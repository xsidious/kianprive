import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";

const createSchema = z.object({
  partnerId: z.string().min(1),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});

export async function GET(req: Request) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get("partnerId") ?? undefined;

  const payouts = await prisma.partnerPayout.findMany({
    where: partnerId ? { partnerId } : undefined,
    include: {
      partner: { select: { displayName: true, partnerCode: true } },
      entries: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ payouts });
}

export async function POST(req: Request) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const periodStart = new Date(parsed.data.periodStart);
  const periodEnd = new Date(parsed.data.periodEnd);

  const eligible = await prisma.commissionLedgerEntry.findMany({
    where: {
      partnerId: parsed.data.partnerId,
      status: "ELIGIBLE",
      earnedAt: { gte: periodStart, lte: periodEnd },
    },
  });

  const totalAmount = eligible.reduce((sum, e) => sum + Number(e.commissionAmount), 0);

  const payout = await prisma.$transaction(async (tx) => {
    const created = await tx.partnerPayout.create({
      data: {
        partnerId: parsed.data.partnerId,
        periodStart,
        periodEnd,
        totalAmount,
        status: "DRAFT",
      },
    });
    if (eligible.length) {
      await tx.commissionLedgerEntry.updateMany({
        where: { id: { in: eligible.map((e) => e.id) } },
        data: { status: "INCLUDED_IN_PAYOUT", payoutId: created.id },
      });
    }
    return created;
  });

  await writeAuditLog({
    userId: access.userId,
    action: "partner.payout.generate",
    entityType: "PartnerPayout",
    entityId: payout.id,
    metadata: { partnerId: parsed.data.partnerId, totalAmount, lines: eligible.length },
  });

  return NextResponse.json({ payout }, { status: 201 });
}
