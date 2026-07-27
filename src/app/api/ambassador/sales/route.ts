import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;

  if (access.partner.type !== "AMBASSADOR") {
    return NextResponse.json({ error: "Ambassador profile required." }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    where: { partnerId: access.partner.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      orderNumber: true,
      email: true,
      total: true,
      paymentStatus: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ orders });
}
