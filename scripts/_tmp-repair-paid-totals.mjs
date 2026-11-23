import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const paidStatuses = new Set(["PAID", "CAPTURED", "SETTLED", "SUCCEEDED", "SUCCESS"]);

const orders = await prisma.order.findMany({
  where: { paymentStatus: "PAID" },
  include: { payments: true, items: true },
});

let fixed = 0;
for (const order of orders) {
  const paid = order.payments
    .filter((p) => paidStatuses.has(String(p.status || "").toUpperCase()))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  if (paid <= 0) continue;

  const shipping = Math.max(0, Number(order.shippingTotal) || 0);
  const tax = Math.max(0, Number(order.taxTotal) || 0);
  const discount = Math.max(0, Number(order.discountTotal) || 0);
  const itemSub = order.items.reduce((sum, i) => sum + Number(i.lineTotal || 0), 0);
  const subtotal = Math.max(Number(order.subtotal) || 0, itemSub);
  const expected = Math.max(paid, subtotal + shipping + tax - discount);
  const current = Number(order.total) || 0;

  if (Math.abs(current - expected) < 0.005 && Math.abs(Number(order.subtotal) - subtotal) < 0.005) {
    continue;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      subtotal,
      total: expected,
      shippingTotal: shipping,
      taxTotal: tax,
      discountTotal: discount,
    },
  });
  fixed += 1;
  console.log(
    JSON.stringify({
      orderNumber: order.orderNumber,
      was: current,
      now: expected,
      paid,
      subtotal,
      shipping,
    }),
  );
}

console.log(`Repaired ${fixed} order(s).`);
await prisma.$disconnect();
