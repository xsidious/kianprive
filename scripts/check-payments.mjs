import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const orders = await prisma.order.findMany({
  where: { orderNumber: { in: ["KP-THERAPY-1787176018543", "KP-THERAPY-1787177830822"] } },
  include: { therapyProposal: true, therapySubscription: true, payments: true },
});

for (const o of orders) {
  console.log(o.orderNumber, "sub", o.therapySubscription?.status, "proposal", o.therapyProposal?.status);
}

await prisma.$disconnect();
