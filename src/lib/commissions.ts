import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";

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

  const existing = await prisma.commissionLedgerEntry.findFirst({
    where: { bookingId, sourceType: "SERVICE", status: { not: "VOID" } },
  });
  if (existing) return existing;

  const primarySlug = booking.serviceIds[0];
  const assignment = booking.partner.serviceAssignments.find((a) => a.serviceSlug === primarySlug);
  const pct = assignment?.commissionPct ?? booking.partner.defaultServiceCommissionPct;
  const gross = booking.memberTotal && Number(booking.memberTotal) > 0 ? booking.memberTotal : booking.guestTotal;
  const grossNum = toNumber(gross ?? 0);
  const pctNum = toNumber(pct);
  const commissionAmount = Math.round(((grossNum * pctNum) / 100) * 100) / 100;

  return prisma.commissionLedgerEntry.create({
    data: {
      partnerId: booking.partnerId,
      sourceType: "SERVICE",
      bookingId: booking.id,
      description: booking.serviceTitles.join(", ") || "Service booking",
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
      items: true,
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

    const assignment = partner.productAssignments[0];
    if (!assignment && !order.partnerId) continue;
    if (!assignment) continue;

    const pct = assignment.commissionPct ?? partner.defaultProductCommissionPct;
    const grossNum = toNumber(item.lineTotal);
    const pctNum = toNumber(pct);
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
