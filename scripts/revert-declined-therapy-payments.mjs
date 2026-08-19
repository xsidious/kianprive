/**
 * One-time fix: reopen therapy orders that were marked PAID when Authorize.net declined.
 * Run: node scripts/revert-declined-therapy-payments.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ORDER_NUMBERS = ["KP-THERAPY-1787176018543", "KP-THERAPY-1787177830822"];

for (const orderNumber of ORDER_NUMBERS) {
  const order = await prisma.order.findFirst({
    where: { orderNumber },
    include: { therapyProposal: true, payments: true },
  });
  if (!order) {
    console.log(`Skip ${orderNumber} — not found`);
    continue;
  }

  const declined = order.payments.some((p) => {
    const code = p.metadata?.raw?.transactionResponse?.responseCode;
    return code && code !== "1";
  });

  if (!declined) {
    console.log(`Skip ${orderNumber} — no declined payment on file`);
    continue;
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "UNPAID",
        status: "PENDING",
        fulfillmentStatus: "UNFULFILLED",
        authorizeNetTransId: null,
      },
    });

    if (order.therapyProposal) {
      await tx.intakeTherapyProposal.update({
        where: { id: order.therapyProposal.id },
        data: { status: "SENT", paidAt: null },
      });
    }

    for (const payment of order.payments) {
      const code = payment.metadata?.raw?.transactionResponse?.responseCode;
      if (code && code !== "1") {
        await tx.paymentRecord.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            provider: "authorize.net.declined",
            metadata: {
              ...payment.metadata,
              note: "Reopened — Authorize.net declined but order was incorrectly marked paid (fixed in app).",
            },
          },
        });
      }
    }
  });

  console.log(`Reopened ${orderNumber} for payment`);
}

await prisma.$disconnect();
