import { prisma } from "@/lib/prisma";
import { isProviderPayableService, providerPayableServiceIds } from "@/lib/consultations";
import {
  resolveCommissionPct,
  roundCommissionAmount,
  toCommissionNumber,
} from "@/lib/commission-rates";

type ServiceAssignment = {
  serviceSlug: string;
  commissionPct: unknown;
};

function pickPrimaryServiceSlug(
  serviceIds: string[],
  assignments: ServiceAssignment[],
  payableOnly: boolean,
) {
  const candidates = payableOnly
    ? providerPayableServiceIds(serviceIds)
    : serviceIds.filter((id) => isProviderPayableService(id));

  const withExplicitRate = candidates.find((id) =>
    assignments.some((a) => a.serviceSlug === id && a.commissionPct != null),
  );
  if (withExplicitRate) return withExplicitRate;

  const assigned = candidates.find((id) => assignments.some((a) => a.serviceSlug === id));
  if (assigned) return assigned;

  return candidates[0] ?? serviceIds[0];
}

export async function createServiceCommissionForBooking(bookingId: string) {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    include: {
      partner: { include: { serviceAssignments: { where: { active: true } } } },
    },
  });
  if (!booking?.partnerId || !booking.partner) return null;

  const partnerType = booking.partner.type;
  const isAmbassador = partnerType === "AMBASSADOR";
  const isProvider = partnerType === "PROVIDER";

  const payableIds = providerPayableServiceIds(booking.serviceIds);
  // Providers never earn on prescription-only bookings (e.g. GLP/peptide pathway).
  if (isProvider && !payableIds.length) return null;

  const existing = await prisma.commissionLedgerEntry.findFirst({
    where: { bookingId, sourceType: "SERVICE", status: { not: "VOID" } },
  });
  if (existing) return existing;

  const primarySlug = pickPrimaryServiceSlug(
    booking.serviceIds,
    booking.partner.serviceAssignments,
    isProvider,
  );
  if (!primarySlug) return null;
  if (isProvider && !isProviderPayableService(primarySlug)) return null;

  const assignment = booking.partner.serviceAssignments.find((a) => a.serviceSlug === primarySlug);

  // Ambassadors earn referral commissions only when a rate is assigned for that service.
  if (isAmbassador && (assignment == null || assignment.commissionPct == null)) {
    return null;
  }

  const pctNum = resolveCommissionPct(
    assignment?.commissionPct,
    booking.partner.defaultServiceCommissionPct,
  );
  if (pctNum <= 0) return null;

  const gross = booking.memberTotal && Number(booking.memberTotal) > 0 ? booking.memberTotal : booking.guestTotal;
  const grossNum = toCommissionNumber(gross ?? 0);
  const commissionAmount = roundCommissionAmount(grossNum, pctNum);

  const titles = isProvider
    ? booking.serviceTitles.filter((_, i) => isProviderPayableService(booking.serviceIds[i] ?? ""))
    : booking.serviceTitles;

  return prisma.commissionLedgerEntry.create({
    data: {
      partnerId: booking.partnerId,
      sourceType: "SERVICE",
      bookingId: booking.id,
      description: titles.join(", ") || "Consultation / telemedicine",
      grossAmount: grossNum,
      commissionPct: pctNum,
      commissionAmount,
      status: booking.status === "COMPLETED" ? "ELIGIBLE" : "PENDING",
      earnedAt: new Date(),
    },
  });
}

export async function markServiceCommissionEligible(bookingId: string) {
  const entry = await createServiceCommissionForBooking(bookingId);
  if (!entry) return null;
  if (entry.status === "ELIGIBLE" || entry.status === "INCLUDED_IN_PAYOUT") return entry;
  return prisma.commissionLedgerEntry.update({
    where: { id: entry.id },
    data: { status: "ELIGIBLE", earnedAt: new Date() },
  });
}

export async function createProductCommissionsForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { id: true, isPrescription: true, title: true } } } },
      partner: true,
    },
  });
  if (!order) return [];

  const created = [];
  for (const item of order.items) {
    const partnerId = item.partnerId ?? order.partnerId;
    if (!partnerId) continue;

    const existing = await prisma.commissionLedgerEntry.findFirst({
      where: { orderItemId: item.id, sourceType: "PRODUCT", status: { not: "VOID" } },
    });
    if (existing) continue;

    const partner = await prisma.partnerProfile.findUnique({
      where: { id: partnerId },
      include: { productAssignments: { where: { active: true, productId: item.productId } } },
    });
    if (!partner) continue;

    // Practitioners never earn on Rx unless an explicit peptide/product assignment rate exists.
    const isRx = item.product?.isPrescription === true;
    const assignment = partner.productAssignments[0];
    const isAmbassador = partner.type === "AMBASSADOR";
    const isProvider = partner.type === "PROVIDER";
    if (isProvider && isRx && (assignment == null || assignment.commissionPct == null)) continue;

    // Ambassadors: all products. Providers: non-Rx products (assignment optional — uses default %).
    // Clinical partners: assignment required.
    if (!assignment && !isAmbassador && !isProvider) continue;
    if (isAmbassador && isRx) {
      // Ambassadors also skip marked prescriptions unless explicitly assigned.
      if (!assignment) continue;
    }

    const pctNum = resolveCommissionPct(assignment?.commissionPct, partner.defaultProductCommissionPct);
    const grossNum = toCommissionNumber(item.lineTotal);
    if (pctNum <= 0) continue;
    const commissionAmount = roundCommissionAmount(grossNum, pctNum);

    const entry = await prisma.commissionLedgerEntry.create({
      data: {
        partnerId,
        sourceType: "PRODUCT",
        orderItemId: item.id,
        description: item.title,
        grossAmount: grossNum,
        commissionPct: pctNum,
        commissionAmount,
        status: order.paymentStatus === "PAID" ? "ELIGIBLE" : "PENDING",
        earnedAt: new Date(),
      },
    });
    created.push(entry);
  }
  return created;
}
