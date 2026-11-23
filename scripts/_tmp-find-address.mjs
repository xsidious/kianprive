import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const intakes = await prisma.therapeuticsIntakeSubmission.findMany({
  where: {
    OR: [
      { email: { contains: "keepingitallnatural", mode: "insensitive" } },
      { fullName: { contains: "Lerer", mode: "insensitive" } },
      { phone: { contains: "3057635982" } },
    ],
  },
  take: 10,
  select: { id: true, email: true, fullName: true, phone: true, payload: true, createdAt: true },
});

const users = await prisma.user.findMany({
  where: { email: { contains: "keepingitallnatural", mode: "insensitive" } },
  include: { profile: true },
  take: 5,
});

const orders = await prisma.order.findMany({
  where: {
    OR: [
      { email: { contains: "keepingitallnatural", mode: "insensitive" } },
      { orderNumber: { startsWith: "KP-THERAPY-" } },
    ],
  },
  take: 20,
  orderBy: { createdAt: "desc" },
  select: {
    orderNumber: true,
    email: true,
    shippingAddress: true,
    distributionOrderId: true,
    eventideOrderId: true,
    distributionStatus: true,
    distributionSyncError: true,
    paymentStatus: true,
    createdAt: true,
  },
});

console.log(
  JSON.stringify(
    {
      intakes: intakes.map((i) => ({
        id: i.id,
        fullName: i.fullName,
        email: i.email,
        addressBits: i.payload && typeof i.payload === "object"
          ? Object.fromEntries(
              Object.entries(i.payload).filter(([k]) => /address|city|state|zip|postal|street|ship/i.test(k)),
            )
          : null,
      })),
      users: users.map((u) => ({
        email: u.email,
        profile: u.profile
          ? {
              addressLine1: u.profile.addressLine1,
              city: u.profile.city,
              state: u.profile.state,
              postalCode: u.profile.postalCode,
            }
          : null,
      })),
      recentOrders: orders,
    },
    null,
    2,
  ),
);
await prisma.$disconnect();
