import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

// Backfill paid therapy orders so admin fulfillment queue is ready
const result = await p.order.updateMany({
  where: {
    paymentStatus: "PAID",
    therapyProposal: { isNot: null },
    fulfillmentStatus: "UNFULFILLED",
  },
  data: { fulfillmentStatus: "PROCESSING" },
});
console.log("Updated fulfillment on paid therapy orders:", result.count);

await p.$disconnect();
