import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const o = await prisma.order.findUnique({
  where: { orderNumber: "KP-THERAPY-1793624210951" },
  include: {
    items: true,
    payments: true,
    refunds: true,
    therapyProposal: true,
  },
});
console.log(
  JSON.stringify(
    {
      subtotal: o?.subtotal,
      discountTotal: o?.discountTotal,
      taxTotal: o?.taxTotal,
      shippingTotal: o?.shippingTotal,
      total: o?.total,
      payments: o?.payments,
      items: o?.items,
      therapyProposal: o?.therapyProposal
        ? {
            id: o.therapyProposal.id,
            status: o.therapyProposal.status,
            notes: o.therapyProposal.notes,
          }
        : null,
      notes: o?.notes,
      shippingAddress: o?.shippingAddress,
    },
    null,
    2,
  ),
);
await prisma.$disconnect();
