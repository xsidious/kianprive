import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  const partnerId = access.partner.id;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    bookings,
    pending,
    completedMtd,
    eligibleCommission,
    pendingLedger,
    mtdOrderSales,
    mtdServiceGross,
    todaysBookings,
    latestPayout,
    partner,
  ] = await Promise.all([
    prisma.bookingRequest.count({ where: { partnerId } }),
    prisma.bookingRequest.count({ where: { partnerId, status: "PENDING" } }),
    prisma.bookingRequest.count({
      where: { partnerId, status: "COMPLETED", updatedAt: { gte: monthStart } },
    }),
    prisma.commissionLedgerEntry.aggregate({
      where: { partnerId, status: "ELIGIBLE" },
      _sum: { commissionAmount: true },
    }),
    prisma.commissionLedgerEntry.aggregate({
      where: { partnerId, status: "PENDING" },
      _sum: { commissionAmount: true },
    }),
    prisma.order.aggregate({
      where: { partnerId, paymentStatus: "PAID", createdAt: { gte: monthStart } },
      _sum: { total: true },
    }),
    prisma.bookingRequest.findMany({
      where: { partnerId, status: "COMPLETED", updatedAt: { gte: monthStart } },
      select: { guestTotal: true, memberTotal: true },
    }),
    prisma.bookingRequest.findMany({
      where: {
        partnerId,
        scheduledStart: { gte: today, lt: tomorrow },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { scheduledStart: "asc" },
      take: 20,
    }),
    prisma.partnerPayout.findFirst({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.partnerProfile.findUnique({
      where: { id: partnerId },
      include: {
        serviceAssignments: { where: { active: true }, select: { id: true } },
        productAssignments: { where: { active: true }, select: { id: true } },
      },
    }),
  ]);

  const serviceGrossMtd = mtdServiceGross.reduce((sum, b) => {
    const member = Number(b.memberTotal ?? 0);
    const guest = Number(b.guestTotal ?? 0);
    return sum + (member > 0 ? member : guest);
  }, 0);

  const mtdSales = Number(mtdOrderSales._sum.total ?? 0) + serviceGrossMtd;
  const pendingCommission = Number(eligibleCommission._sum.commissionAmount ?? 0);
  const awaitingCompletion = Number(pendingLedger._sum.commissionAmount ?? 0);

  const onboarding = {
    hasPhone: Boolean(partner?.phone),
    hasPayoutMethod: Boolean(partner?.payoutMethod),
    hasAssignment: Boolean(
      (partner?.serviceAssignments.length ?? 0) + (partner?.productAssignments.length ?? 0),
    ),
    complete: Boolean(partner?.onboardingComplete),
    partnerCode: partner?.partnerCode ?? "",
    status: partner?.status ?? "INVITED",
  };

  return NextResponse.json({
    stats: {
      bookings,
      pending,
      completedMtd,
      pendingCommission,
      awaitingCompletion,
      mtdSales,
      mtdProductSales: Number(mtdOrderSales._sum.total ?? 0),
      mtdServiceGross: serviceGrossMtd,
    },
    todaysBookings,
    latestPayout,
    onboarding,
  });
}
