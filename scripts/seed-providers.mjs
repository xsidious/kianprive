import bcrypt from "bcryptjs";
import { PrismaClient, PartnerStatus, PartnerType, Role } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Demo service providers — bookable for visits with service commission.
 * Share credentials privately; rotate after handoff.
 */
const providers = [
  {
    name: "Dr. Karl Ryan",
    email: "karl.ryan@kianprive.com",
    displayName: "Dr. Karl Ryan, DDS",
    specialty: "Medical Aesthetics",
    code: "KARLRYAN",
    servicePct: 25,
    productPct: 10,
    services: ["facial-aesthetics", "microneedling-with-exosomes"],
    password: "KarlRyan#Kp8vN!",
  },
  {
    name: "Dr. John Maarouf",
    email: "john.maarouf@kianprive.com",
    displayName: "Dr. John Maarouf, DO",
    specialty: "Medical Aesthetics",
    code: "JOHNMAAROUF",
    servicePct: 25,
    productPct: 10,
    services: ["facial-aesthetics", "iv-therapy", "telemedicine"],
    password: "JohnMaarouf$Kp6tQ!",
  },
  {
    name: "Dr. Carmen Ramirez",
    email: "carmen.ramirez@kianprive.com",
    displayName: "Dr. Carmen Ramirez",
    specialty: "Clinical Care",
    code: "CARMENRAM",
    servicePct: 25,
    productPct: 10,
    services: ["telemedicine", "comprehensive-bloodwork", "nutrition"],
    password: "CarmenRamirez#Kp5wL!",
  },
];

async function main() {
  for (const row of providers) {
    const passwordHash = await bcrypt.hash(row.password, 12);

    const user = await prisma.user.upsert({
      where: { email: row.email.toLowerCase() },
      update: {
        name: row.name,
        passwordHash,
        role: Role.PROVIDER,
      },
      create: {
        name: row.name,
        email: row.email.toLowerCase(),
        passwordHash,
        role: Role.PROVIDER,
      },
    });

    const existing = await prisma.partnerProfile.findUnique({ where: { userId: user.id } });
    let partnerId = existing?.id;
    if (existing) {
      await prisma.partnerProfile.update({
        where: { id: existing.id },
        data: {
          displayName: row.displayName,
          specialty: row.specialty,
          type: PartnerType.PROVIDER,
          partnerCode: row.code,
          status: PartnerStatus.ACTIVE,
          defaultServiceCommissionPct: row.servicePct,
          defaultProductCommissionPct: row.productPct,
          onboardingComplete: true,
        },
      });
    } else {
      let partnerCode = row.code;
      const codeTaken = await prisma.partnerProfile.findUnique({ where: { partnerCode } });
      if (codeTaken && codeTaken.userId !== user.id) {
        partnerCode = `${row.code}${Math.floor(Math.random() * 90 + 10)}`;
      }
      const created = await prisma.partnerProfile.create({
        data: {
          userId: user.id,
          displayName: row.displayName,
          specialty: row.specialty,
          type: PartnerType.PROVIDER,
          partnerCode,
          status: PartnerStatus.ACTIVE,
          defaultServiceCommissionPct: row.servicePct,
          defaultProductCommissionPct: row.productPct,
          onboardingComplete: true,
        },
      });
      partnerId = created.id;
    }

    if (!partnerId) continue;
    await prisma.partnerServiceAssignment.deleteMany({ where: { partnerId } });
    await prisma.partnerServiceAssignment.createMany({
      data: row.services.map((serviceSlug) => ({
        partnerId,
        serviceSlug,
        active: true,
      })),
    });
  }

  console.log("Providers seeded (ACTIVE).\n");
  for (const row of providers) {
    console.log(`${row.displayName}`);
    console.log(`  Email:    ${row.email.toLowerCase()}`);
    console.log(`  Password: ${row.password}`);
    console.log(`  Code:     ${row.code}`);
    console.log(`  Portal:   /provider (Practitioner)`);
    console.log(`  Book:     /book-online?partner=${row.code}`);
    console.log(`  Shop:     /shop?partner=${row.code}`);
    console.log("");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
