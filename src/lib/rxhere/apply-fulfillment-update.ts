import type { FulfillmentStatus, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildTrackingUrl } from "@/lib/commerce/tracking-url";
import { notifyPartnerOrderUpdated } from "@/lib/intake/partner-status-sync";

export type DistributionStatusInput = {
  /** KIAN order number or distributionOrderId or rxhereOrderId */
  externalRef: string;
  status?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  trackingUrl?: string | null;
  event?: string | null;
  reason?: string | null;
  rxhereOrderId?: string | null;
  distributionStatus?: string | null;
};

const STATUS_MAP: Record<
  string,
  { order?: OrderStatus; fulfillment?: FulfillmentStatus }
> = {
  received: { order: "PROCESSING", fulfillment: "PROCESSING" },
  submitted: { order: "PROCESSING", fulfillment: "PROCESSING" },
  verified: { order: "PROCESSING", fulfillment: "PROCESSING" },
  compounding: { order: "PROCESSING", fulfillment: "PROCESSING" },
  processing: { order: "PROCESSING", fulfillment: "PROCESSING" },
  awaiting_payment: { order: "PROCESSING", fulfillment: "PROCESSING" },
  ready_to_ship: { order: "PROCESSING", fulfillment: "PROCESSING" },
  "ready to ship": { order: "PROCESSING", fulfillment: "PROCESSING" },
  paid: { order: "PROCESSING", fulfillment: "PROCESSING" },
  fulfilled: { order: "FULFILLED", fulfillment: "FULFILLED" },
  shipped: { order: "FULFILLED", fulfillment: "FULFILLED" },
  delivered: { order: "DELIVERED", fulfillment: "DELIVERED" },
  cancelled: { order: "CANCELED" },
  canceled: { order: "CANCELED" },
  on_hold: { order: "PROCESSING", fulfillment: "PROCESSING" },
  delayed: { order: "PROCESSING", fulfillment: "PROCESSING" },
  exception: { order: "PROCESSING", fulfillment: "PROCESSING" },
};

function normalizeStatus(raw?: string | null) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[.\s]+/g, "_");
}

export async function applyDistributionFulfillmentUpdate(input: DistributionStatusInput) {
  const ref = input.externalRef?.trim();
  if (!ref) return { ok: false as const, error: "externalRef is required." };

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { orderNumber: ref },
        { distributionOrderId: ref },
        { rxhereOrderId: ref },
      ],
    },
    include: { fulfillments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) return { ok: false as const, error: "Order not found." };

  const statusKey = normalizeStatus(input.status || input.distributionStatus || input.event);
  const mapped = STATUS_MAP[statusKey] || {};
  const trackingNumber = input.trackingNumber?.trim() || null;
  const carrier = input.carrier?.trim() || null;
  const trackingUrl =
    input.trackingUrl?.trim() ||
    (trackingNumber ? buildTrackingUrl(trackingNumber, carrier) : null);

  const nextDistributionStatus =
    input.distributionStatus?.trim() ||
    input.status?.trim() ||
    order.distributionStatus ||
    null;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      ...(mapped.order ? { status: mapped.order } : {}),
      ...(mapped.fulfillment ? { fulfillmentStatus: mapped.fulfillment } : {}),
      ...(input.rxhereOrderId ? { rxhereOrderId: input.rxhereOrderId } : {}),
      ...(nextDistributionStatus ? { distributionStatus: nextDistributionStatus } : {}),
      distributionSyncError: input.reason || null,
    },
  });

  if (trackingNumber || mapped.fulfillment || input.event) {
    const existing = order.fulfillments[0];
    const shipped =
      statusKey === "shipped" || statusKey === "fulfilled" || input.event?.toUpperCase() === "SHIPPED";
    const delivered = statusKey === "delivered" || input.event?.toUpperCase() === "DELIVERED";

    if (existing) {
      await prisma.fulfillment.update({
        where: { id: existing.id },
        data: {
          status: mapped.fulfillment || existing.status,
          carrier: carrier || existing.carrier || "Carrier",
          trackingNumber: trackingNumber || existing.trackingNumber,
          trackingUrl: trackingUrl || existing.trackingUrl || undefined,
          shippedAt: shipped ? existing.shippedAt || new Date() : existing.shippedAt,
          deliveredAt: delivered ? existing.deliveredAt || new Date() : existing.deliveredAt,
          notes:
            [existing.notes, input.event ? `Event ${input.event}` : "", input.reason || ""]
              .filter(Boolean)
              .join(" · ") || null,
        },
      });
    } else {
      await prisma.fulfillment.create({
        data: {
          orderId: order.id,
          status: mapped.fulfillment || "PROCESSING",
          carrier: carrier || "Carrier",
          trackingNumber,
          trackingUrl,
          shippedAt: shipped ? new Date() : null,
          deliveredAt: delivered ? new Date() : null,
          notes: [input.event ? `Event ${input.event}` : "", input.reason || ""].filter(Boolean).join(" · ") || null,
        },
      });
    }
  }

  if (order.intakeSubmissionId) {
    await notifyPartnerOrderUpdated({
      orderId: order.id,
      status: mapped.order || order.status,
      fulfillment: {
        status: mapped.fulfillment || order.fulfillmentStatus,
        carrier: carrier || order.fulfillments[0]?.carrier || null,
        trackingNumber: trackingNumber || order.fulfillments[0]?.trackingNumber || null,
        trackingUrl: trackingUrl || order.fulfillments[0]?.trackingUrl || null,
      },
    });
  }

  return {
    ok: true as const,
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: mapped.order || order.status,
    fulfillmentStatus: mapped.fulfillment || order.fulfillmentStatus,
    trackingNumber,
    trackingUrl,
  };
}
