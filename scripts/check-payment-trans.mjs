import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const order = await prisma.order.findFirst({
  where: { orderNumber: "KP-THERAPY-1787177830822" },
  include: {
    intakeSubmission: { select: { fullName: true, email: true } },
    payments: { orderBy: { createdAt: "desc" } },
    therapyProposal: { select: { status: true, paidAt: true } },
  },
});

console.log("=== Order ===");
console.log(JSON.stringify(order, null, 2));

const byTransId = await prisma.paymentRecord.findMany({
  where: {
    OR: [
      { metadata: { path: ["transId"], equals: "81758378631" } },
      { metadata: { path: ["raw", "transactionResponse", "transId"], equals: "81758378631" } },
    ],
  },
});

console.log("\n=== Payment by transId 81758378631 ===");
console.log(JSON.stringify(byTransId, null, 2));

await prisma.$disconnect();
