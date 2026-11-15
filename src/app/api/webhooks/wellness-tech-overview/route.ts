import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { resolvePartnerSiteFromPayload } from "@/lib/intake/partner-status-sync";

function secretOk(header: string | null) {
  const expected =
    process.env.WT_PARTNER_ORDER_SECRET?.trim() ||
    process.env.KIAN_PARTNER_SECRET?.trim() ||
    "";
  if (!expected || !header) return false;
  const left = Buffer.from(header);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function moneyCents(value: { toNumber?: () => number } | number | null | undefined) {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/**
 * Wellness Tech Connected Sites / Hub Control poller.
 * Returns ops metrics + processing queue so WT can oversee while KIAN processes.
 */
export async function GET(request: Request) {
  if (!secretOk(request.headers.get("x-wt-partner-secret"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const openIntakeStatuses = ["PENDING_REVIEW", "UNDER_PHYSICIAN_REVIEW", "NEEDS_LABS", "NEEDS_FOLLOW_UP"] as const;

  const [
    usersTotal,
    roleGroups,
    partnersActive,
    ordersTotal,
    orders30d,
    intakesTotal,
    intakesOpen,
    bookings30d,
    therapySubsActive,
    therapySubsPastDue,
    membershipSubsActive,
    retailProducts,
    clinicalProducts,
    recentIntakes,
    recentOrders,
    openProposals,
    distributionErrors,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.partnerProfile.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.therapeuticsIntakeSubmission.count(),
    prisma.therapeuticsIntakeSubmission.count({
      where: { status: { in: [...openIntakeStatuses] } },
    }),
    prisma.bookingRequest.count({ where: { createdAt: { gte: since } } }).catch(() => 0),
    prisma.therapySubscription.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.therapySubscription.count({ where: { status: "PAST_DUE" } }).catch(() => 0),
    prisma.subscription.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.product.count({ where: { catalogKind: "RETAIL", status: "ACTIVE" } }).catch(() => 0),
    prisma.product.count({ where: { catalogKind: "CLINICAL", status: "ACTIVE" } }).catch(() => 0),
    prisma.therapeuticsIntakeSubmission.findMany({
      where: { status: { in: [...openIntakeStatuses] } },
      orderBy: { updatedAt: "desc" },
      take: 25,
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        referredBy: true,
        payload: true,
        assignedPartner: { select: { displayName: true } },
        createdAt: true,
        updatedAt: true,
        therapyProposals: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            billingInterval: true,
            items: { select: { quantity: true, unitPrice: true, titleSnapshot: true } },
          },
        },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        distributionStatus: true,
        distributionOrderId: true,
        rxhereOrderId: true,
        total: true,
        createdAt: true,
        intakeSubmissionId: true,
        fulfillments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { trackingNumber: true, carrier: true, status: true },
        },
      },
    }),
    prisma.intakeTherapyProposal.findMany({
      where: { status: { in: ["DRAFT", "SENT", "ACCEPTED"] } },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        status: true,
        billingInterval: true,
        updatedAt: true,
        items: { select: { unitPrice: true, quantity: true } },
        intakeSubmission: { select: { id: true, fullName: true, email: true, payload: true, referredBy: true } },
      },
    }),
    prisma.order.count({
      where: { distributionSyncError: { not: null } },
    }).catch(() => 0),
  ]);

  const usersByRole: Record<string, number> = {};
  for (const row of roleGroups) {
    usersByRole[String(row.role)] = row._count._all;
  }

  const distributionPending = recentOrders.filter((o) => {
    const s = String(o.distributionStatus || "").toLowerCase();
    if (!(o.distributionOrderId || o.rxhereOrderId)) return o.paymentStatus === "PAID";
    return !["delivered", "cancelled", "canceled"].includes(s);
  }).length;

  return NextResponse.json({
    ok: true,
    site: "kian-prive",
    processor: "kian-prive",
    hub: "wellness-tech",
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    fetchedAt: new Date().toISOString(),
    /** Ops facts for Hub Control / Alycia questions */
    capabilities: {
      telemedicine: true,
      telemedicineNote:
        "Physician telemedicine bookings + consults on KIAN. Not a standalone multi-state IDN marketplace.",
      bloodwork: true,
      bloodworkNote: "Comprehensive bloodwork / lab panels bookable; intakes support NEEDS_LABS.",
      therapyProposals: true,
      paymentProcessing: true,
      pharmacyFulfillment: "wellness-tech → VitaRelay/Eventide",
    },
    usersTotal,
    usersByRole,
    partnersActive,
    ordersTotal,
    orders30d,
    intakesTotal,
    intakesOpen,
    bookings30d,
    therapySubsActive,
    therapySubsPastDue,
    membershipSubsActive,
    retailProducts,
    clinicalProducts,
    distributionPending,
    distributionErrors,
    processingQueue: {
      openIntakes: recentIntakes.map((row) => {
        const proposal = row.therapyProposals[0];
        const proposalTotal = proposal
          ? proposal.items.reduce(
              (sum, item) => sum + moneyCents(Number(item.unitPrice || 0) * item.quantity),
              0,
            )
          : null;
        return {
          id: row.id,
          fullName: row.fullName,
          email: row.email,
          status: row.status,
          source: resolvePartnerSiteFromPayload(row.payload) || row.referredBy || "kian-prive",
          assignedProvider: row.assignedPartner?.displayName || null,
          proposalStatus: proposal?.status || null,
          proposalTotalCents: proposalTotal,
          updatedAt: row.updatedAt.toISOString(),
        };
      }),
      openProposals: openProposals.map((row) => ({
        id: row.id,
        status: row.status,
        totalCents: row.items.reduce(
          (sum, item) => sum + moneyCents(Number(item.unitPrice || 0) * item.quantity),
          0,
        ),
        interval: row.billingInterval,
        intakeId: row.intakeSubmission.id,
        patient: row.intakeSubmission.fullName,
        email: row.intakeSubmission.email,
        source:
          resolvePartnerSiteFromPayload(row.intakeSubmission.payload) ||
          row.intakeSubmission.referredBy ||
          "kian-prive",
        updatedAt: row.updatedAt.toISOString(),
      })),
      recentOrders: recentOrders.map((row) => ({
        id: row.id,
        orderNumber: row.orderNumber,
        status: row.status,
        fulfillmentStatus: row.fulfillmentStatus,
        distributionStatus: row.distributionStatus,
        distributionOrderId: row.distributionOrderId,
        rxhereOrderId: row.rxhereOrderId,
        totalCents: moneyCents(row.total),
        trackingNumber: row.fulfillments[0]?.trackingNumber || null,
        intakeId: row.intakeSubmissionId,
        createdAt: row.createdAt.toISOString(),
      })),
    },
  });
}
