import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";

export async function GET(req: Request) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get("partnerId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const entries = await prisma.commissionLedgerEntry.findMany({
    where: {
      partnerId: partnerId || undefined,
      status: status ? (status as "PENDING" | "ELIGIBLE" | "INCLUDED_IN_PAYOUT" | "VOID") : undefined,
    },
    include: {
      partner: { select: { displayName: true, partnerCode: true } },
      booking: { select: { id: true, serviceTitles: true, status: true } },
      orderItem: { select: { id: true, title: true } },
    },
    orderBy: { earnedAt: "desc" },
    take: 300,
  });

  return NextResponse.json({ entries });
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "ELIGIBLE", "INCLUDED_IN_PAYOUT", "VOID"]),
});

export async function PATCH(req: Request) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const entry = await prisma.commissionLedgerEntry.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  await writeAuditLog({
    userId: access.userId,
    action: "partner.commission.update",
    entityType: "CommissionLedgerEntry",
    entityId: entry.id,
    metadata: { status: entry.status },
  });

  return NextResponse.json({ entry });
}
