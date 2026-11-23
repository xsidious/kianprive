/**
 * READ/UPDATE only — never deletes.
 * Undoes the fake Eventide test webhook that marked KP-THERAPY-1793624210951 as shipped/fulfilled.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ORDER_NUMBER = "KP-THERAPY-1793624210951";

async function main() {
  const order = await prisma.order.findUnique({
    where: { orderNumber: ORDER_NUMBER },
    include: { fulfillments: true, payments: true, items: true },
  });
  if (!order) {
    console.error("ORDER NOT FOUND — aborting (nothing deleted).");
    process.exitCode = 1;
    return;
  }

  console.log("BEFORE", {
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    distributionStatus: order.distributionStatus,
    eventideOrderId: order.eventideOrderId,
    total: order.total,
    paid: order.payments.map((p) => ({ amount: p.amount, status: p.status })),
    fulfillments: order.fulfillments.map((f) => ({
      id: f.id,
      status: f.status,
      trackingNumber: f.trackingNumber,
      trackingUrl: f.trackingUrl,
    })),
  });

  // Only clear clearly-fake test fulfillment artifacts from our webhook probe.
  const fakeFulfillments = order.fulfillments.filter(
    (f) =>
      f.trackingNumber === "TEST123456" ||
      f.trackingUrl?.includes("example.com/track") ||
      f.trackingNumber === "TEST999",
  );

  for (const f of fakeFulfillments) {
    await prisma.fulfillment.update({
      where: { id: f.id },
      data: {
        status: "PROCESSING",
        trackingNumber: null,
        trackingUrl: null,
        carrier: null,
        notes: "Cleared fake test tracking from Eventide webhook probe — order payment preserved.",
      },
    });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      // Keep PAID — never touch payment records
      paymentStatus: "PAID",
      status: "PAID",
      fulfillmentStatus: "UNFULFILLED",
      // Clear fake Eventide test id; keep real WT distribution order id
      eventideOrderId:
        order.eventideOrderId === "evt-test-order-id" || order.eventideOrderId === "evt-test"
          ? null
          : order.eventideOrderId,
      distributionStatus:
        order.distributionStatus === "shipped" &&
        (order.eventideOrderId === "evt-test-order-id" || !order.eventideOrderId || order.eventideOrderId === "evt-test")
          ? "on_hold"
          : order.distributionStatus,
      notes: [order.notes, "Status restored after accidental test webhook mark-as-shipped; payment untouched."]
        .filter(Boolean)
        .join("\n"),
    },
    include: { fulfillments: true, payments: true },
  });

  console.log("AFTER", {
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status,
    paymentStatus: updated.paymentStatus,
    fulfillmentStatus: updated.fulfillmentStatus,
    distributionStatus: updated.distributionStatus,
    distributionOrderId: updated.distributionOrderId,
    eventideOrderId: updated.eventideOrderId,
    payments: updated.payments.map((p) => ({ amount: p.amount, status: p.status })),
    fulfillments: updated.fulfillments.map((f) => ({
      id: f.id,
      status: f.status,
      trackingNumber: f.trackingNumber,
    })),
  });
  console.log("Done. No rows deleted.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
