import bcrypt from "bcryptjs";
import { PrismaClient, PartnerStatus, PartnerType, Role } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Strong passwords mix each person's name with symbols, digits, and casing.
 * Share privately with each ambassador; do not commit to public channels long-term.
 */
const ambassadors = [
  {
    name: "Jennifer Frenner",
    email: "jennifer.frenner@kianprive.com",
    displayName: "Jennifer Frenner",
    phone: "",
    code: "JENNFRENNER",
    productPct: 10,
    password: "JenniferFrenner#Kp9mX!",
  },
  {
    name: "Carolina Millan",
    email: "carolina.millan@kianprive.com",
    displayName: "Carolina Millan",
    phone: "",
    code: "CAROMILLAN",
    productPct: 10,
    password: "CarolinaMillan$Kp7wQ!",
  },
  {
    name: "Shane Shuckerow",
    email: "shane.shuckerow@kianprive.com",
    displayName: "Shane Shuckerow",
    phone: "",
    code: "SHANESHUCK",
    productPct: 10,
    password: "ShaneShuckerow@Kp4nR!",
  },
  {
    name: "Alycia Lin",
    email: "Mei8710@aol.com",
    displayName: "Alycia Lin",
    phone: "",
    code: "ALYCIALIN",
    productPct: 10,
    password: "AlyciaLin#Kp6tY!",
  },
];

async function main() {
  for (const row of ambassadors) {
    const passwordHash = await bcrypt.hash(row.password, 12);

    const user = await prisma.user.upsert({
      where: { email: row.email.toLowerCase() },
      update: {
        name: row.name,
        passwordHash,
        role: Role.AMBASSADOR,
      },
      create: {
        name: row.name,
        email: row.email.toLowerCase(),
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
          phone: row.phone || null,
          type: PartnerType.AMBASSADOR,
          partnerCode: row.code,
          status: PartnerStatus.ACTIVE,
          defaultProductCommissionPct: row.productPct,
          defaultServiceCommissionPct: 0,
          onboardingComplete: true,
        },
      });
    } else {
      let partnerCode = row.code;
      const codeTaken = await prisma.partnerProfile.findUnique({ where: { partnerCode } });
      if (codeTaken && codeTaken.userId !== user.id) {
        partnerCode = `${row.code}${Math.floor(Math.random() * 90 + 10)}`;
      }
      await prisma.partnerProfile.create({
        data: {
          userId: user.id,
          displayName: row.displayName,
          phone: row.phone || null,
          type: PartnerType.AMBASSADOR,
          partnerCode,
          status: PartnerStatus.ACTIVE,
          defaultProductCommissionPct: row.productPct,
          defaultServiceCommissionPct: 0,
          onboardingComplete: true,
        },
      });
    }
  }

  console.log("Ambassadors seeded (ACTIVE).\n");
  for (const row of ambassadors) {
    console.log(`${row.displayName}`);
    console.log(`  Email:    ${row.email.toLowerCase()}`);
    console.log(`  Password: ${row.password}`);
    console.log(`  Code:     ${row.code}`);
    console.log(`  Shop:     /shop?partner=${row.code}`);
    console.log(`  Portal:   /ambassador`);
    console.log("");
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
