import bcrypt from "bcryptjs";
import { PrismaClient, PartnerStatus, PartnerType, Role } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Strong passwords mix each person's name with symbols, digits, and casing.
 * Share privately with each ambassador; do not commit to public channels long-term.
 *
 * Pass FILTER_NAMES=Jennifer,Alex,... (comma-separated) to seed only matching people.
 */
const ambassadors = [
  {
    name: "Jennifer Fenner",
    email: "jennifer.fenner@kianprive.com",
    displayName: "Jennifer Fenner",
    phone: "",
    code: "JENNFENNER",
    productPct: 10,
    password: "JenniferFenner#Kp9mX!",
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
    name: "Alexander Shuckerow",
    email: "alexander.shuckerow@kianprive.com",
    displayName: "Alexander Shuckerow",
    phone: "",
    code: "ALEXSHUCK",
    productPct: 10,
    password: "Cosmo0219$!",
    aliasEmails: ["alex.shuckerow@kianprive.com"],
  },
  {
    name: "Shane Shuckerow",
    email: "shane.shuckerow@kianprive.com",
    displayName: "Shane Shuckerow",
    phone: "",
    code: "SHANESHUCK",
    productPct: 10,
    password: "Steeler$3030",
  },
  {
    name: "Lucas Shuckerow",
    email: "lucas.shuckerow@kianprive.com",
    displayName: "Lucas Shuckerow",
    phone: "",
    code: "LUCASSHUCK",
    productPct: 10,
    password: "3Burrito0109$",
    aliasEmails: ["lucasshuckerow@gmail.com"],
  },
  {
    name: "Isabella Shuckerow",
    email: "isabella.shuckerow@kianprive.com",
    displayName: "Isabella Shuckerow",
    phone: "",
    code: "ISABELLASHUCK",
    productPct: 10,
    password: "Justice212$",
    aliasEmails: ["bella.shuckerow@kianprive.com"],
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
  {
    name: "Violetta",
    email: "violetta@kianprive.com",
    displayName: "Violetta",
    phone: "",
    code: "VIOLETTA",
    productPct: 10,
    password: "Violetta#Kp8nR!",
  },
];

function selectedAmbassadors() {
  const filter = (process.env.FILTER_NAMES || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!filter.length) return ambassadors;
  return ambassadors.filter((row) =>
    filter.some((f) => row.name.toLowerCase().includes(f) || row.displayName.toLowerCase().includes(f)),
  );
}

async function main() {
  const rows = selectedAmbassadors();
  if (!rows.length) {
    throw new Error("No ambassadors matched FILTER_NAMES.");
  }

  for (const row of rows) {
    const passwordHash = await bcrypt.hash(row.password, 12);
    const emails = [row.email.toLowerCase(), ...((row.aliasEmails || []).map((e) => e.toLowerCase()))];

    for (const email of emails) {
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          name: row.name,
          passwordHash,
          role: Role.AMBASSADOR,
          mustSetPassword: false,
          memberOnboardingComplete: true,
        },
        create: {
          name: row.name,
          email,
          passwordHash,
          role: Role.AMBASSADOR,
          mustSetPassword: false,
          memberOnboardingComplete: true,
        },
      });

      // Only attach/refresh partner profile on the primary email account
      if (email !== row.email.toLowerCase()) continue;

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
  }

  console.log(`Ambassadors seeded (ACTIVE) — ${rows.length} account(s).\n`);
  for (const row of rows) {
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
