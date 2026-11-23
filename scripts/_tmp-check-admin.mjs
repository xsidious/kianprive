import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const admins = await prisma.user.findMany({
  where: { OR: [{ role: "ADMIN" }, { role: "OPS" }, { email: { contains: "admin" } }] },
  select: { email: true, role: true, status: true },
  take: 20,
});
console.log(admins);
await prisma.$disconnect();
