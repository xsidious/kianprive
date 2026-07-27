import bcrypt from "bcryptjs";
import { PrismaClient, PartnerStatus, PartnerType, Role } from "@prisma/client";

const prisma = new PrismaClient();

const ambassadors = [
  {
    name: "Elena Vargas",
    email: "ambassador.elena@kianprive.com",
    displayName: "Elena Vargas",
    phone: "+1 (305) 555-0141",
    code: "ELENAKIAN",
    productPct: 12,
  },
  {
    name: "Marcus Hill",
    email: "ambassador.marcus@kianprive.com",
    displayName: "Marcus Hill",
    phone: "+1 (786) 555-0198",
    code: "MARCUSHILL",
    productPct: 10,
  },
  {
    name: "Sofia Nguyen",
    email: "ambassador.sofia@kianprive.com",
    displayName: "Sofia Nguyen",
    phone: "+1 (954) 555-0177",
    code: "SOFIANGYN",
    productPct: 15,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("Ambassador!234", 10);

  for (const row of ambassadors) {
    const user = await prisma.user.upsert({
      where: { email: row.email },
      update: {
        name: row.name,
        passwordHash,
        role: Role.AMBASSADOR,
      },
      create: {
        name: row.name,
        email: row.email,
        passwordHash,
        role: Role.AMBASSADOR,
      },
    });

    const existing = await prisma.partnerProfile.findUnique({ where: { userId: user.id } });
    if (existing) {
      await prisma.partnerProfile.update({
        where: { id: existing.id },
        data: {
          displayName: row.displayName,
          phone: row.phone,
          type: PartnerType.AMBASSADOR,
          partnerCode: row.code,
          status: PartnerStatus.ACTIVE,
          defaultProductCommissionPct: row.productPct,
          defaultServiceCommissionPct: 0,
          onboardingComplete: true,
        },
      });
    } else {
      const codeTaken = await prisma.partnerProfile.findUnique({ where: { partnerCode: row.code } });
      await prisma.partnerProfile.create({
        data: {
          userId: user.id,
          displayName: row.displayName,
          phone: row.phone,
          type: PartnerType.AMBASSADOR,
          partnerCode: codeTaken ? `${row.code}${Math.floor(Math.random() * 90 + 10)}` : row.code,
          status: PartnerStatus.ACTIVE,
          defaultProductCommissionPct: row.productPct,
          defaultServiceCommissionPct: 0,
          onboardingComplete: true,
        },
      });
    }
  }

  console.log("Ambassadors ready.");
  console.log("Password for all: Ambassador!234");
  for (const row of ambassadors) {
    console.log(`- ${row.displayName} <${row.email}> code ${row.code}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
