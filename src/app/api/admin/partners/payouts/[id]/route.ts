import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(["DRAFT", "APPROVED", "PAID"]),
  exportNote: z.string().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const payout = await prisma.partnerPayout.update({
    where: { id },
    data: {
      status: parsed.data.status,
      exportNote: parsed.data.exportNote,
      paidAt: parsed.data.status === "PAID" ? new Date() : undefined,
    },
    include: { partner: true, entries: true },
  });

  await writeAuditLog({
    userId: access.userId,
    action: "partner.payout.update",
    entityType: "PartnerPayout",
    entityId: id,
    metadata: { status: parsed.data.status },
  });

  if (parsed.data.status === "PAID") {
    const { notifyPartnerPayoutPaid } = await import("@/lib/partner-notify");
    await notifyPartnerPayoutPaid(id);
  }

  return NextResponse.json({ payout });
}

export async function GET(_req: Request, { params }: Params) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const { id } = await params;
  const payout = await prisma.partnerPayout.findUnique({
    where: { id },
    include: { partner: true, entries: true },
  });
  if (!payout) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const csv = [
    "description,sourceType,grossAmount,commissionPct,commissionAmount,earnedAt",
    ...payout.entries.map(
      (e) =>
        `"${(e.description ?? "").replace(/"/g, '""')}",${e.sourceType},${e.grossAmount},${e.commissionPct},${e.commissionAmount},${e.earnedAt.toISOString()}`,
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payout-${payout.id}.csv"`,
    },
  });
}
