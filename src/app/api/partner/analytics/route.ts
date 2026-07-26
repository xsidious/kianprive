import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  const partnerId = access.partner.id;

  const [bookings, ledger, orders, eligibleSum] = await Promise.all([
    prisma.bookingRequest.findMany({
      where: { partnerId },
      select: {
        status: true,
        serviceTitles: true,
        guestTotal: true,
        memberTotal: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.commissionLedgerEntry.findMany({
      where: { partnerId },
      orderBy: { earnedAt: "desc" },
      take: 500,
    }),
    prisma.order.findMany({
      where: { partnerId, paymentStatus: "PAID" },
      select: { total: true, createdAt: true, items: { select: { quantity: true, title: true } } },
    }),
    prisma.commissionLedgerEntry.aggregate({
      where: { partnerId, status: "ELIGIBLE" },
      _sum: { commissionAmount: true },
    }),
  ]);

  const byStatus: Record<string, number> = {};
  for (const b of bookings) byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;

  const completed = byStatus.COMPLETED ?? 0;
  const totalOps = bookings.filter((b) => b.status !== "CANCELED").length;
  const completionRate = totalOps ? Math.round((completed / totalOps) * 100) : 0;

  const serviceCounts: Record<string, number> = {};
  for (const b of bookings) {
    for (const title of b.serviceTitles) {
      serviceCounts[title] = (serviceCounts[title] ?? 0) + 1;
    }
  }
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([title, count]) => ({ title, count }));

  const productUnits: Record<string, number> = {};
  for (const order of orders) {
    for (const item of order.items) {
      productUnits[item.title] = (productUnits[item.title] ?? 0) + item.quantity;
    }
  }
  const topProducts = Object.entries(productUnits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([title, units]) => ({ title, units }));

  const months: Record<string, { revenue: number; commission: number }> = {};
  for (const order of orders) {
    const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
    months[key] ??= { revenue: 0, commission: 0 };
    months[key].revenue += Number(order.total);
  }
  for (const b of bookings) {
    if (b.status !== "COMPLETED") continue;
    const key = `${b.updatedAt.getFullYear()}-${String(b.updatedAt.getMonth() + 1).padStart(2, "0")}`;
    months[key] ??= { revenue: 0, commission: 0 };
    const member = Number(b.memberTotal ?? 0);
    const guest = Number(b.guestTotal ?? 0);
    months[key].revenue += member > 0 ? member : guest;
  }
  for (const entry of ledger) {
    if (entry.status === "VOID") continue;
    const key = `${entry.earnedAt.getFullYear()}-${String(entry.earnedAt.getMonth() + 1).padStart(2, "0")}`;
    months[key] ??= { revenue: 0, commission: 0 };
    months[key].commission += Number(entry.commissionAmount);
  }
  const trend = Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({ month, ...data }));

  return NextResponse.json({
    byStatus,
    completionRate,
    topServices,
    topProducts,
    trend,
    totals: {
      bookings: bookings.length,
      eligibleCommission: Number(eligibleSum._sum.commissionAmount ?? 0),
      paidProductRevenue: orders.reduce((s, o) => s + Number(o.total), 0),
    },
  });
}
