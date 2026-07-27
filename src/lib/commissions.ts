import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import { isProviderPayableService, providerPayableServiceIds } from "@/lib/consultations";

function toNumber(value: Decimal | number | string) {
  return typeof value === "number" ? value : Number(value);
}

export async function createServiceCommissionForBooking(bookingId: string) {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    include: {
      partner: { include: { serviceAssignments: { where: { active: true } } } },
    },
  });
  if (!booking?.partnerId || !booking.partner) return null;
  // Ambassadors are product-referral only — no visit payouts.
  if (booking.partner.type === "AMBASSADOR") return null;

  const payableIds = providerPayableServiceIds(booking.serviceIds);
  // Providers never earn on prescription-only bookings (e.g. GLP/peptide pathway).
  if (booking.partner.type === "PROVIDER" && !payableIds.length) return null;

  const existing = await prisma.commissionLedgerEntry.findFirst({
    where: { bookingId, sourceType: "SERVICE", status: { not: "VOID" } },
  });
  if (existing) return existing;

  const primarySlug =
    (booking.partner.type === "PROVIDER"
      ? payableIds[0]
      : booking.serviceIds.find((id) => isProviderPayableService(id))) ?? booking.serviceIds[0];
  if (booking.partner.type === "PROVIDER" && primarySlug && !isProviderPayableService(primarySlug)) {
    return null;
  }

  const assignment = booking.partner.serviceAssignments.find((a) => a.serviceSlug === primarySlug);
  const pct = assignment?.commissionPct ?? booking.partner.defaultServiceCommissionPct;
  const gross = booking.memberTotal && Number(booking.memberTotal) > 0 ? booking.memberTotal : booking.guestTotal;
  const grossNum = toNumber(gross ?? 0);
  const pctNum = toNumber(pct);
  const commissionAmount = Math.round(((grossNum * pctNum) / 100) * 100) / 100;

  const titles =
    booking.partner.type === "PROVIDER"
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

    // Practitioners / providers never earn on prescription products.
    const isRx = item.product?.isPrescription === true;
    if (partner.type === "PROVIDER" && isRx) continue;

    const assignment = partner.productAssignments[0];
    const isAmbassador = partner.type === "AMBASSADOR";
    const isProvider = partner.type === "PROVIDER";
    // Ambassadors: all products. Providers: non-Rx products (assignment optional — uses default %).
    // Clinical partners: assignment required.
    if (!assignment && !isAmbassador && !isProvider) continue;
    if (isAmbassador && isRx) {
      // Ambassadors also skip marked prescriptions unless explicitly assigned.
      if (!assignment) continue;
    }

    const pct = assignment?.commissionPct ?? partner.defaultProductCommissionPct;
    const grossNum = toNumber(item.lineTotal);
    const pctNum = toNumber(pct);
    if (pctNum <= 0) continue;
    const commissionAmount = Math.round(((grossNum * pctNum) / 100) * 100) / 100;

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
