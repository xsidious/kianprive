import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  const { id } = await params;

  const payout = await prisma.partnerPayout.findFirst({
    where: { id, partnerId: access.partner.id },
    include: { entries: true, partner: { select: { displayName: true, partnerCode: true } } },
  });
  if (!payout) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const header = [
    "partner",
    "partnerCode",
    "payoutId",
    "periodStart",
    "periodEnd",
    "status",
    "paidAt",
    "description",
    "sourceType",
    "grossAmount",
    "commissionPct",
    "commissionAmount",
    "earnedAt",
  ].join(",");

  const rows = payout.entries.map((e) =>
    [
      `"${payout.partner.displayName.replace(/"/g, '""')}"`,
      payout.partner.partnerCode,
      payout.id,
      payout.periodStart.toISOString(),
      payout.periodEnd.toISOString(),
      payout.status,
      payout.paidAt?.toISOString() ?? "",
      `"${(e.description ?? "").replace(/"/g, '""')}"`,
      e.sourceType,
      e.grossAmount,
      e.commissionPct,
      e.commissionAmount,
      e.earnedAt.toISOString(),
    ].join(","),
  );

  const csv = [header, ...rows, `"TOTAL",,,,,,,,,,,,${payout.totalAmount},`].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="partner-payout-${payout.id}.csv"`,
    },
  });
}
