/**
 * Reseed Carmen + Shuckerow family logins with known-good passwords and verify bcrypt.
 *
 * Usage: node scripts/reseed-team-logins.mjs
 */
import bcrypt from "bcryptjs";
import { PrismaClient, PartnerStatus, PartnerType, Role } from "@prisma/client";

const prisma = new PrismaClient();

const ACCOUNTS = [
  {
    name: "Dr. Carmen Ramirez",
    displayName: "Dr. Carmen Ramirez",
    email: "carmen.ramirez@kianprive.com",
    aliasEmails: ["carmenramirezmd@yahoo.com"],
    role: Role.PROVIDER,
    partnerType: PartnerType.PROVIDER,
    code: "CARMENRAM",
    specialty: "Clinical Care",
    servicePct: 25,
    productPct: 10,
    password: "Cadasil8@$",
    services: [
      "telemedicine",
      "physician-visit",
      "icoone-laser",
      "facial-aesthetics",
      "nutrition",
      "iv-therapy",
      "comprehensive-bloodwork",
      "beauty-hair-nails",
      "inbody-scan",
      "microneedling-with-exosomes",
      "korean-organic-skincare",
      "glp1-peptides",
    ],
  },
  {
    name: "Shane Shuckerow",
    displayName: "Shane Shuckerow",
    email: "shane.shuckerow@kianprive.com",
    aliasEmails: [],
    role: Role.AMBASSADOR,
    partnerType: PartnerType.AMBASSADOR,
    code: "SHANESHUCK",
    specialty: null,
    servicePct: 0,
    productPct: 10,
    password: "Steeler$3030",
    services: [],
  },
  {
    name: "Alexander Shuckerow",
    displayName: "Alexander Shuckerow",
    email: "alexander.shuckerow@kianprive.com",
    aliasEmails: ["alex.shuckerow@kianprive.com"],
    role: Role.AMBASSADOR,
    partnerType: PartnerType.AMBASSADOR,
    code: "ALEXSHUCK",
    specialty: null,
    servicePct: 0,
    productPct: 10,
    password: "Cosmo0219$!",
    services: [],
  },
  {
    name: "Lucas Shuckerow",
    displayName: "Lucas Shuckerow",
    email: "lucas.shuckerow@kianprive.com",
    aliasEmails: ["lucasshuckerow@gmail.com"],
    role: Role.AMBASSADOR,
    partnerType: PartnerType.AMBASSADOR,
    code: "LUCASSHUCK",
    specialty: null,
    servicePct: 0,
    productPct: 10,
    password: "3Burrito0109$",
    services: [],
  },
  {
    name: "Isabella Shuckerow",
    displayName: "Isabella Shuckerow",
    email: "isabella.shuckerow@kianprive.com",
    aliasEmails: ["bella.shuckerow@kianprive.com"],
    role: Role.AMBASSADOR,
    partnerType: PartnerType.AMBASSADOR,
    code: "ISABELLASHUCK",
    specialty: null,
    servicePct: 0,
    productPct: 10,
    password: "Justice212$",
    services: [],
  },
];

async function upsertAccount(row) {
  const passwordHash = await bcrypt.hash(row.password, 12);
  const emails = [row.email.toLowerCase(), ...row.aliasEmails.map((e) => e.toLowerCase())];
  const results = [];

  for (const email of emails) {
    const isPrimary = email === row.email.toLowerCase();
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: row.name,
        passwordHash,
        role: row.role,
        mustSetPassword: false,
        memberOnboardingComplete: true,
      },
      create: {
        email,
        name: row.name,
        passwordHash,
        role: row.role,
        mustSetPassword: false,
        memberOnboardingComplete: true,
      },
    });

    if (isPrimary) {
      const existing = await prisma.partnerProfile.findUnique({ where: { userId: user.id } });
      let partnerId = existing?.id;
      if (existing) {
        await prisma.partnerProfile.update({
          where: { id: existing.id },
          data: {
            displayName: row.displayName,
            specialty: row.specialty,
            type: row.partnerType,
            partnerCode: row.code,
            status: PartnerStatus.ACTIVE,
            defaultServiceCommissionPct: row.servicePct,
            defaultProductCommissionPct: row.productPct,
            onboardingComplete: true,
          },
        });
      } else {
        let partnerCode = row.code;
        const taken = await prisma.partnerProfile.findUnique({ where: { partnerCode } });
        if (taken && taken.userId !== user.id) {
          partnerCode = `${row.code}${Math.floor(Math.random() * 90 + 10)}`;
        }
        const created = await prisma.partnerProfile.create({
          data: {
            userId: user.id,
            displayName: row.displayName,
            specialty: row.specialty,
            type: row.partnerType,
            partnerCode,
            status: PartnerStatus.ACTIVE,
            defaultServiceCommissionPct: row.servicePct,
            defaultProductCommissionPct: row.productPct,
            onboardingComplete: true,
          },
        });
        partnerId = created.id;
      }

      if (partnerId && row.services.length) {
        await prisma.partnerServiceAssignment.deleteMany({ where: { partnerId } });
        await prisma.partnerServiceAssignment.createMany({
          data: row.services.map((serviceSlug) => ({
            partnerId,
            serviceSlug,
            active: true,
          })),
        });
      }
    }

    const fresh = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, passwordHash: true, role: true, mustSetPassword: true },
    });
    const ok = fresh?.passwordHash
      ? await bcrypt.compare(row.password, fresh.passwordHash)
      : false;

    results.push({
      email,
      primary: isPrimary,
      role: fresh?.role,
      mustSetPassword: fresh?.mustSetPassword,
      passwordOk: ok,
    });
  }

  return results;
}

async function main() {
  console.log("Reseeding team logins…\n");
  let failed = 0;

  for (const row of ACCOUNTS) {
    const results = await upsertAccount(row);
    console.log(`${row.displayName}`);
    console.log(`  Password: ${row.password}`);
    console.log(`  Portal:   ${row.role === Role.PROVIDER ? "/provider" : "/ambassador"}`);
    for (const r of results) {
      const mark = r.passwordOk ? "OK" : "FAIL";
      if (!r.passwordOk) failed += 1;
      console.log(
        `  [${mark}] ${r.email} · role=${r.role} · mustSetPassword=${r.mustSetPassword}${r.primary ? " · PRIMARY" : " · alias"}`,
      );
    }
    console.log("");
  }

  if (failed) {
    console.error(`Verification failed for ${failed} account(s).`);
    process.exit(1);
  }

  console.log("All passwords verified against DB hashes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
