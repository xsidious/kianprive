import { PrismaClient, PartnerGuidelineCategory } from "@prisma/client";
import {
  PEPTIDE_GUIDELINES,
  PEPTIDE_LIBRARY_DISCLAIMER,
  PEPTIDE_LIBRARY_INTRO,
  PEPTIDE_LIBRARY_TITLE,
  PEPTIDE_LIBRARY_VERSION,
  peptideToGuidelineBody,
} from "./peptide-guidelines-data.mjs";

const prisma = new PrismaClient();

async function main() {
  const cover =
    (await prisma.partnerGuideline.findFirst({
      where: { title: PEPTIDE_LIBRARY_TITLE },
    })) ??
    (await prisma.partnerGuideline.create({
      data: {
        title: PEPTIDE_LIBRARY_TITLE,
        category: PartnerGuidelineCategory.PEPTIDES,
        body: `${PEPTIDE_LIBRARY_INTRO}\n\n${PEPTIDE_LIBRARY_DISCLAIMER}`,
        version: PEPTIDE_LIBRARY_VERSION,
        requiresAck: true,
        publishedAt: new Date(),
      },
    }));

  await prisma.partnerGuideline.update({
    where: { id: cover.id },
    data: {
      category: PartnerGuidelineCategory.PEPTIDES,
      body: `${PEPTIDE_LIBRARY_INTRO}\n\n${PEPTIDE_LIBRARY_DISCLAIMER}`,
      version: PEPTIDE_LIBRARY_VERSION,
      requiresAck: true,
      publishedAt: new Date(),
    },
  });

  await prisma.partnerGuidelineGrant.deleteMany({ where: { guidelineId: cover.id } });
  await prisma.partnerGuidelineGrant.create({
    data: { guidelineId: cover.id, allPartners: true },
  });

  let upserted = 0;
  for (const peptide of PEPTIDE_GUIDELINES) {
    const title = `Peptide Protocol: ${peptide.name}`;
    const existing = await prisma.partnerGuideline.findFirst({ where: { title } });
    if (existing) {
      await prisma.partnerGuideline.update({
        where: { id: existing.id },
        data: {
          category: PartnerGuidelineCategory.PEPTIDES,
          body: peptideToGuidelineBody(peptide),
          version: PEPTIDE_LIBRARY_VERSION,
          requiresAck: false,
          publishedAt: new Date(),
        },
      });
      await prisma.partnerGuidelineGrant.deleteMany({ where: { guidelineId: existing.id } });
      await prisma.partnerGuidelineGrant.create({
        data: { guidelineId: existing.id, allPartners: true },
      });
    } else {
      await prisma.partnerGuideline.create({
        data: {
          title,
          category: PartnerGuidelineCategory.PEPTIDES,
          body: peptideToGuidelineBody(peptide),
          version: PEPTIDE_LIBRARY_VERSION,
          requiresAck: false,
          publishedAt: new Date(),
          grants: { create: [{ allPartners: true }] },
        },
      });
    }
    upserted += 1;
  }

  console.log("Peptide library published.");
  console.log(`Cover: ${PEPTIDE_LIBRARY_TITLE}`);
  console.log(`Protocols: ${upserted}`);
  console.log("Granted to: all partners");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
