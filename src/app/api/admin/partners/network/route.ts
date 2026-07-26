import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;

  const [partners, unassignedBookings, eligibleOwed] = await Promise.all([
    prisma.partnerProfile.findMany({
      include: {
        _count: { select: { bookings: true, commissionEntries: true, orders: true } },
        commissionEntries: {
          where: { status: "ELIGIBLE" },
          select: { commissionAmount: true },
        },
      },
      orderBy: { displayName: "asc" },
    }),
    prisma.bookingRequest.findMany({
      where: {
        partnerId: null,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        fullName: true,
        email: true,
        serviceTitles: true,
        status: true,
        scheduledStart: true,
        createdAt: true,
      },
    }),
    prisma.commissionLedgerEntry.aggregate({
      where: { status: "ELIGIBLE" },
      _sum: { commissionAmount: true },
    }),
  ]);

  const topPartners = partners
    .map((p) => ({
      id: p.id,
      displayName: p.displayName,
      partnerCode: p.partnerCode,
      status: p.status,
      bookings: p._count.bookings,
      orders: p._count.orders,
      owed: p.commissionEntries.reduce((s, e) => s + Number(e.commissionAmount), 0),
    }))
    .sort((a, b) => b.owed - a.owed)
    .slice(0, 10);

  return NextResponse.json({
    topPartners,
    unassignedBookings,
    totalOwed: Number(eligibleOwed._sum.commissionAmount ?? 0),
    partnerCount: partners.length,
  });
}
