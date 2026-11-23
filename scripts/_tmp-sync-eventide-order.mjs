import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const updated = await prisma.order.updateMany({
  where: { orderNumber: "KP-THERAPY-1793624210951" },
  data: {
    eventideOrderId: null,
    distributionStatus: "on_hold",
    distributionSyncError:
      "Eventide Practice API blocked: placed_by_user_id null (API key not linked to a portal user). Portal path works: Patients → Alycia → Scripts → Checkout → pay. Unpaid VR-20261102-0e6747 was cancelled (bad ship address). Fix Alycia address to 1731 Plunkett St Hollywood FL 33020, add card / pay checkout, or ask VitaRelay to reissue Practice key tied to Alen Beslija.",
  },
});

console.log("updated", updated);
console.log(
  await prisma.order.findFirst({
    where: { orderNumber: "KP-THERAPY-1793624210951" },
    select: {
      orderNumber: true,
      eventideOrderId: true,
      distributionStatus: true,
      distributionSyncError: true,
    },
  }),
);
await prisma.$disconnect();
