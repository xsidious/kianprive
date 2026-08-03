import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Keep in sync with src/lib/commission-policy.ts */
const EVERYONE = {
  "icoone-laser": 10,
  "comprehensive-bloodwork": 10,
};

const CONSULTATION_SPECIALISTS = new Set(["SHANESHUCK", "JENNFENNER"]);
const CONSULTATION_RATES = {
  telemedicine: 75,
  nutrition: 75,
};

async function upsertAssignment(partnerId, serviceSlug, commissionPct) {
  await prisma.partnerServiceAssignment.upsert({
    where: { partnerId_serviceSlug: { partnerId, serviceSlug } },
    create: { partnerId, serviceSlug, active: true, commissionPct },
    update: { active: true, commissionPct },
  });
}

async function main() {
  const partners = await prisma.partnerProfile.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, displayName: true, partnerCode: true, type: true },
  });

  for (const partner of partners) {
    for (const [slug, pct] of Object.entries(EVERYONE)) {
      await upsertAssignment(partner.id, slug, pct);
    }

    if (CONSULTATION_SPECIALISTS.has(partner.partnerCode.toUpperCase())) {
      for (const [slug, pct] of Object.entries(CONSULTATION_RATES)) {
        await upsertAssignment(partner.id, slug, pct);
      }
      console.log(
        `✓ ${partner.displayName} (${partner.partnerCode}): Icoone 10%, bloodwork 10%, consultations 75%`,
      );
    } else {
      console.log(`✓ ${partner.displayName} (${partner.partnerCode}): Icoone 10%, bloodwork 10%`);
    }
  }

  console.log(`\nApplied rates to ${partners.length} active partners.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
