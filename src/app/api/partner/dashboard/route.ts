import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { networkKindFromType } from "@/lib/network-profile";
import { prisma } from "@/lib/prisma";

type PaidKind = "review_fee" | "therapy" | "shop" | "booking_service" | "booking_review" | "other";

function paymentMetaKind(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const kind = (metadata as Record<string, unknown>).kind;
  return typeof kind === "string" ? kind : null;
}

function classifyOrder(input: {
  notes: string | null;
  orderNumber: string;
  therapySubscriptionId: string | null;
  total: Prisma.Decimal | number;
  payments: { metadata: unknown }[];
}): { kind: PaidKind; label: string } {
  const notes = (input.notes || "").toLowerCase();
  const metaKinds = input.payments.map((p) => paymentMetaKind(p.metadata)).filter(Boolean) as string[];

  if (
    metaKinds.includes("intake_review_fee") ||
    notes.includes("medical review") ||
    notes.includes("review fee") ||
    notes.includes("provider review")
  ) {
    return { kind: "review_fee", label: "Practitioner review fee" };
  }
  if (
    input.therapySubscriptionId ||
    notes.includes("therapy") ||
    input.orderNumber.toUpperCase().includes("THERAPY")
  ) {
    return { kind: "therapy", label: "Therapy payment" };
  }
  if (Number(input.total) > 0) {
    return { kind: "shop", label: "Shop / product order" };
  }
  return { kind: "other", label: "Attributed payment" };
}

function asMoney(value: Prisma.Decimal | number | null | undefined) {
  return Number(value ?? 0);
}

export async function GET() {
  const access = await requirePartnerProfile(["partner", "practitioner", "ambassador"]);
  if (!access.ok) return access.response;
  const partnerId = access.partner.id;
  const networkKind = networkKindFromType(access.partner.type);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attributedOrderWhere: Prisma.OrderWhereInput = {
    paymentStatus: "PAID",
    OR: [
      { partnerId },
      { intakeSubmission: { assignedPartnerId: partnerId } },
      { items: { some: { partnerId } } },
    ],
  };

  const [
    bookings,
    pending,
    completedMtd,
    eligibleCommission,
    pendingLedger,
    mtdOrderSales,
    mtdServiceGross,
    todaysBookings,
    recentBookings,
    latestPayout,
    partner,
    intakesAssigned,
    intakesPendingReview,
    intakesApproved,
    paidOrders,
    allPaidOrdersLite,
    reviewBookings,
    recentCommissions,
    recentIntakes,
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
      where: { ...attributedOrderWhere, createdAt: { gte: monthStart }, total: { gt: 0 } },
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
    prisma.bookingRequest.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        fullName: true,
        email: true,
        scheduledStart: true,
        createdAt: true,
        status: true,
        serviceTitles: true,
        guestTotal: true,
        memberTotal: true,
        medicalReviewPaidAt: true,
        medicalReviewAmount: true,
      },
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
    prisma.therapeuticsIntakeSubmission.count({ where: { assignedPartnerId: partnerId } }),
    prisma.therapeuticsIntakeSubmission.count({
      where: {
        assignedPartnerId: partnerId,
        status: { in: ["PENDING_REVIEW", "UNDER_PHYSICIAN_REVIEW"] },
      },
    }),
    prisma.therapeuticsIntakeSubmission.count({
      where: { assignedPartnerId: partnerId, status: "APPROVED" },
    }),
    prisma.order.findMany({
      where: { ...attributedOrderWhere, total: { gt: 0 } },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        orderNumber: true,
        email: true,
        total: true,
        notes: true,
        createdAt: true,
        therapySubscriptionId: true,
        intakeSubmissionId: true,
        partnerId: true,
        intakeSubmission: { select: { fullName: true, email: true, status: true } },
        payments: { select: { amount: true, metadata: true, createdAt: true } },
        items: { select: { title: true, quantity: true, lineTotal: true } },
      },
    }),
    prisma.order.findMany({
      where: { ...attributedOrderWhere, total: { gt: 0 } },
      select: {
        total: true,
        notes: true,
        orderNumber: true,
        therapySubscriptionId: true,
        payments: { select: { metadata: true } },
      },
    }),
    prisma.bookingRequest.findMany({
      where: { partnerId, medicalReviewPaidAt: { not: null } },
      orderBy: { medicalReviewPaidAt: "desc" },
      take: 100,
      select: {
        id: true,
        fullName: true,
        email: true,
        medicalReviewAmount: true,
        medicalReviewPaidAt: true,
        serviceTitles: true,
        guestTotal: true,
        memberTotal: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.commissionLedgerEntry.findMany({
      where: { partnerId },
      orderBy: { earnedAt: "desc" },
      take: 20,
      select: {
        id: true,
        description: true,
        grossAmount: true,
        commissionAmount: true,
        commissionPct: true,
        status: true,
        sourceType: true,
        earnedAt: true,
        bookingId: true,
        orderItemId: true,
      },
    }),
    prisma.therapeuticsIntakeSubmission.findMany({
      where: { assignedPartnerId: partnerId },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        programs: true,
        createdAt: true,
        payload: true,
        orders: {
          where: { paymentStatus: "PAID", total: { gt: 0 } },
          select: { orderNumber: true, total: true, notes: true, createdAt: true },
        },
      },
    }),
  ]);

  const serviceGrossMtd = mtdServiceGross.reduce((sum, b) => {
    const member = Number(b.memberTotal ?? 0);
    const guest = Number(b.guestTotal ?? 0);
    return sum + (member > 0 ? member : guest);
  }, 0);

  const mtdSales = asMoney(mtdOrderSales._sum.total) + serviceGrossMtd;
  const pendingCommission = asMoney(eligibleCommission._sum.commissionAmount);
  const awaitingCompletion = asMoney(pendingLedger._sum.commissionAmount);

  const reviewBookingIds = new Set(reviewBookings.map((b) => b.id));

  const paidActivity = [
    ...paidOrders.map((order) => {
      const classified = classifyOrder(order);
      const patientName = order.intakeSubmission?.fullName || order.email || "Patient";
      return {
        id: `order-${order.id}`,
        at: order.createdAt.toISOString(),
        kind: classified.kind,
        label: classified.label,
        patientName,
        patientEmail: order.intakeSubmission?.email || order.email,
        amount: asMoney(order.total),
        reference: order.orderNumber,
        status: "PAID",
        detail:
          order.items.length > 0
            ? order.items.map((i) => `${i.title} × ${i.quantity}`).join(", ")
            : order.notes,
      };
    }),
    ...reviewBookings.map((booking) => ({
      id: `booking-review-${booking.id}`,
      at: (booking.medicalReviewPaidAt ?? booking.createdAt).toISOString(),
      kind: "booking_review" as PaidKind,
      label: "Lab medical review fee",
      patientName: booking.fullName,
      patientEmail: booking.email,
      amount: asMoney(booking.medicalReviewAmount ?? 75),
      reference: booking.id,
      status: "PAID",
      detail: booking.serviceTitles.join(", ") || null,
    })),
    ...recentBookings
      .filter(
        (b) =>
          !reviewBookingIds.has(b.id) && (asMoney(b.memberTotal) > 0 || asMoney(b.guestTotal) > 0),
      )
      .map((booking) => {
        const amount =
          asMoney(booking.memberTotal) > 0 ? asMoney(booking.memberTotal) : asMoney(booking.guestTotal);
        return {
          id: `booking-${booking.id}`,
          at: (booking.scheduledStart ?? booking.createdAt).toISOString(),
          kind: "booking_service" as PaidKind,
          label: "Consultation / visit",
          patientName: booking.fullName,
          patientEmail: booking.email,
          amount,
          reference: booking.id,
          status: booking.status,
          detail: booking.serviceTitles.join(", ") || null,
        };
      }),
  ]
    .sort((a, b) => +new Date(b.at) - +new Date(a.at))
    .slice(0, 40);

  const classifiedOrders = allPaidOrdersLite.map((order) => ({ order, ...classifyOrder(order) }));
  const reviewFeeOrders = classifiedOrders.filter((o) => o.kind === "review_fee");
  const therapyOrders = classifiedOrders.filter((o) => o.kind === "therapy");
  const shopOrders = classifiedOrders.filter((o) => o.kind === "shop");

  const reviewFeesCount = reviewFeeOrders.length + reviewBookings.length;
  const reviewFeesTotal =
    reviewFeeOrders.reduce((s, o) => s + asMoney(o.order.total), 0) +
    reviewBookings.reduce((s, b) => s + asMoney(b.medicalReviewAmount ?? 75), 0);
  const therapyPaidCount = therapyOrders.length;
  const therapyPaidTotal = therapyOrders.reduce((s, o) => s + asMoney(o.order.total), 0);
  const shopPaidCount = shopOrders.length;
  const shopPaidTotal = shopOrders.reduce((s, o) => s + asMoney(o.order.total), 0);

  const patientPaidTotal =
    allPaidOrdersLite.reduce((s, o) => s + asMoney(o.total), 0) +
    reviewBookings.reduce((s, b) => s + asMoney(b.medicalReviewAmount ?? 75), 0);

  const recentIntakeRows = recentIntakes.map((intake) => {
    const payload = intake.payload && typeof intake.payload === "object" ? (intake.payload as Record<string, unknown>) : {};
    const reviewFee =
      payload.reviewFee && typeof payload.reviewFee === "object"
        ? (payload.reviewFee as Record<string, unknown>)
        : null;
    const paidFromOrders = intake.orders.reduce((s, o) => s + asMoney(o.total), 0);
    const reviewFeeAmount = reviewFee?.amount != null ? Number(reviewFee.amount) : null;
    return {
      id: intake.id,
      fullName: intake.fullName,
      email: intake.email,
      status: intake.status,
      programs: intake.programs,
      createdAt: intake.createdAt.toISOString(),
      reviewFeeAmount,
      reviewFeePaidAt: typeof reviewFee?.paidAt === "string" ? reviewFee.paidAt : null,
      paidOrderTotal: paidFromOrders,
      paidOrders: intake.orders.map((o) => ({
        orderNumber: o.orderNumber,
        total: asMoney(o.total),
        notes: o.notes,
        createdAt: o.createdAt.toISOString(),
      })),
    };
  });

  const onboarding = {
    hasPhone: Boolean(partner?.phone),
    hasPayoutMethod: Boolean(partner?.payoutMethod),
    hasAssignment: Boolean(
      (partner?.serviceAssignments.length ?? 0) + (partner?.productAssignments.length ?? 0),
    ),
    complete: Boolean(partner?.onboardingComplete),
    partnerCode: partner?.partnerCode ?? "",
    status: partner?.status ?? "INVITED",
    networkKind,
    displayName: partner?.displayName ?? "",
  };

  return NextResponse.json({
    stats: {
      bookings,
      pending,
      completedMtd,
      pendingCommission,
      awaitingCompletion,
      mtdSales,
      mtdProductSales: asMoney(mtdOrderSales._sum.total),
      mtdServiceGross: serviceGrossMtd,
      intakesAssigned,
      intakesPendingReview,
      intakesApproved,
      reviewFeesCount,
      reviewFeesTotal,
      therapyPaidCount,
      therapyPaidTotal,
      shopPaidCount,
      shopPaidTotal,
      patientPaidTotal,
      paidActivityCount: paidActivity.length,
    },
    todaysBookings,
    recentBookings,
    recentIntakes: recentIntakeRows,
    paidActivity,
    recentCommissions: recentCommissions.map((c) => ({
      id: c.id,
      description: c.description,
      grossAmount: asMoney(c.grossAmount),
      commissionAmount: asMoney(c.commissionAmount),
      commissionPct: asMoney(c.commissionPct),
      status: c.status,
      sourceType: c.sourceType,
      earnedAt: c.earnedAt.toISOString(),
      bookingId: c.bookingId,
      orderItemId: c.orderItemId,
    })),
    latestPayout,
    onboarding,
  });
}
