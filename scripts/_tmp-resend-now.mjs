import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const base = (process.env.WT_API_URL || "").replace(/\/$/, "");
const secret = process.env.WT_PARTNER_ORDER_SECRET;

const order = await prisma.order.findUnique({ where: { orderNumber: "KP-THERAPY-1793624210951" } });
if (!order) {
  console.error("missing order");
  process.exit(1);
}

console.log("WT_API_URL", base);
console.log("distributionOrderId", order.distributionOrderId);

const r = await fetch(`${base}/api/partner/orders/retry`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-wt-partner-secret": secret,
    "x-wt-partner-site": "kian-prive",
  },
  body: JSON.stringify({
    orderId: order.distributionOrderId,
    externalRef: order.orderNumber,
  }),
});
const data = await r.json().catch(() => ({}));
console.log("RETRY", r.status, JSON.stringify(data, null, 2));

await prisma.order.update({
  where: { id: order.id },
  data: {
    eventideOrderId: data.eventideOrderId || undefined,
    distributionStatus: data.status || (data.ok ? "submitted" : "on_hold"),
    distributionSyncError: data.ok ? null : data.error || "Eventide retry failed",
  },
});

const refreshed = await prisma.order.findUnique({
  where: { id: order.id },
  select: {
    orderNumber: true,
    distributionOrderId: true,
    distributionStatus: true,
    eventideOrderId: true,
    distributionSyncError: true,
    shippingAddress: true,
  },
});
console.log("KIAN ORDER", JSON.stringify(refreshed, null, 2));
await prisma.$disconnect();
