import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;

  const payouts = await prisma.partnerPayout.findMany({
    where: { partnerId: access.partner.id },
    include: { entries: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ payouts });
}
