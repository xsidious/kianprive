import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const orderNumber = "KP-THERAPY-1793624210951";

const order = await prisma.order.findUnique({
  where: { orderNumber },
  include: { intakeSubmission: true },
});
if (!order) {
  console.error("Order not found");
  process.exit(1);
}

const shippingAddress = {
  name: order.intakeSubmission?.fullName || "Alycia Lerer",
  line1: "1731 Plunkett St",
  line2: "1",
  city: "Hollywood",
  state: "FL",
  postal: "33020",
  destinationType: "patient_direct",
};

await prisma.order.update({
  where: { id: order.id },
  data: {
    shippingAddress,
    // Clear stale WT id so we can recreate with a complete address.
    // forwardPaidOrderToWellnessTech({force:true}) also does this after retry 404.
    distributionOrderId: null,
    distributionStatus: null,
    distributionSyncError: "Preparing fresh WT/Eventide submit with complete ship-to.",
  },
});

console.log("Updated shipping + cleared stale distribution ids");

const { forwardPaidOrderToWellnessTech } = await import("../src/lib/commerce/forward-distribution-order.ts");
const result = await forwardPaidOrderToWellnessTech(order.id, { force: true });
console.log("FORWARD RESULT", JSON.stringify(result, null, 2));

const refreshed = await prisma.order.findUnique({
  where: { id: order.id },
  select: {
    orderNumber: true,
    shippingAddress: true,
    distributionOrderId: true,
    distributionStatus: true,
    eventideOrderId: true,
    distributionSyncError: true,
  },
});
console.log("ORDER AFTER", JSON.stringify(refreshed, null, 2));
await prisma.$disconnect();
