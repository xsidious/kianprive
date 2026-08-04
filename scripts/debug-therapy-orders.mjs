import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const orders = await p.order.findMany({
  where: { OR: [{ orderNumber: { startsWith: "KP-THERAPY" } }, { therapyProposal: { isNot: null } }] },
  include: {
    items: true,
    payments: true,
    partner: { select: { displayName: true } },
    intakeSubmission: { select: { publicTrackingToken: true, fullName: true } },
    therapyProposal: { select: { status: true, id: true } },
  },
  orderBy: { createdAt: "desc" },
});

for (const o of orders) {
  console.log("\n===", o.orderNumber);
  console.log({
    paymentStatus: o.paymentStatus,
    status: o.status,
    fulfillmentStatus: o.fulfillmentStatus,
    total: Number(o.total),
    authorizeNetTransId: o.authorizeNetTransId,
    partner: o.partner?.displayName,
    intake: o.intakeSubmission?.publicTrackingToken,
    therapyStatus: o.therapyProposal?.status,
    itemCount: o.items.length,
    payments: o.payments.map((pay) => ({
      provider: pay.provider,
      status: pay.status,
      amount: Number(pay.amount),
      meta: pay.metadata,
    })),
  });
  for (const item of o.items) {
    console.log("  item:", item.title, "x", item.quantity, "@", Number(item.unitPrice), "=", Number(item.lineTotal));
  }
}
await p.$disconnect();
