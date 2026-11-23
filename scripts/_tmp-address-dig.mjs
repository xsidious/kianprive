import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const o = await prisma.order.findUnique({
  where: { orderNumber: "KP-THERAPY-1793624210951" },
  include: {
    intakeSubmission: true,
    user: { include: { profile: true } },
    partner: true,
  },
});
const payload = o?.intakeSubmission?.payload;
console.log(
  JSON.stringify(
    {
      payloadAddressFields: payload
        ? Object.fromEntries(
            Object.entries(payload).filter(([k]) =>
              /address|city|state|zip|postal|street|ship|mail|line/i.test(k),
            ),
          )
        : null,
      profile: o?.user?.profile
        ? {
            addressLine1: o.user.profile.addressLine1,
            addressLine2: o.user.profile.addressLine2,
            city: o.user.profile.city,
            state: o.user.profile.state,
            postalCode: o.user.profile.postalCode,
            phone: o.user.profile.phone,
          }
        : null,
      partnerShip: o?.partner
        ? {
            addressLine1: o.partner.addressLine1,
            city: o.partner.city,
            state: o.partner.state,
            postalCode: o.partner.postalCode,
          }
        : null,
    },
    null,
    2,
  ),
);
await prisma.$disconnect();
