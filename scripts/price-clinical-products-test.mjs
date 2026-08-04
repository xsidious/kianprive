import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const result = await prisma.product.updateMany({
  where: { catalogKind: "CLINICAL" },
  data: { price: 99 },
});
console.log(`Priced ${result.count} clinical products at $99 for local testing.`);
await prisma.$disconnect();
