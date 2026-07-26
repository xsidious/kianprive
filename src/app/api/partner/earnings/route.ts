import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const earnedAt =
    from || to
      ? {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        }
      : undefined;

  const ledger = await prisma.commissionLedgerEntry.findMany({
    where: { partnerId: access.partner.id, earnedAt },
    orderBy: { earnedAt: "desc" },
    take: 300,
  });

  const summary = {
    gross: ledger.reduce((s, e) => s + Number(e.grossAmount), 0),
    commission: ledger.reduce((s, e) => s + Number(e.commissionAmount), 0),
    pending: ledger.filter((e) => e.status === "PENDING").reduce((s, e) => s + Number(e.commissionAmount), 0),
    eligible: ledger.filter((e) => e.status === "ELIGIBLE").reduce((s, e) => s + Number(e.commissionAmount), 0),
    included: ledger
      .filter((e) => e.status === "INCLUDED_IN_PAYOUT")
      .reduce((s, e) => s + Number(e.commissionAmount), 0),
    bySource: {
      SERVICE: ledger.filter((e) => e.sourceType === "SERVICE").reduce((s, e) => s + Number(e.commissionAmount), 0),
      PRODUCT: ledger.filter((e) => e.sourceType === "PRODUCT").reduce((s, e) => s + Number(e.commissionAmount), 0),
    },
  };

  return NextResponse.json({ ledger, summary });
}
