/**
 * Rename legacy Semaglutide / Tirzepatide / Retatrutide protocol titles
 * to generic GLP 1 / GLP 2 / GLP 3 labels in PartnerGuideline rows.
 */
import { PrismaClient } from "@prisma/client";
import {
  PEPTIDE_GUIDELINES,
  PEPTIDE_LIBRARY_VERSION,
  peptideToGuidelineBody,
} from "../src/lib/partners/peptide-guidelines-data";

const prisma = new PrismaClient();

const RENAMES: Array<{ from: string; to: string; peptideId: string }> = [
  { from: "Peptide Protocol: Semaglutide", to: "Peptide Protocol: GLP 1", peptideId: "glp-1" },
  { from: "Peptide Protocol: Tirzepatide", to: "Peptide Protocol: GLP 2", peptideId: "glp-2" },
  { from: "Peptide Protocol: Trizapatide", to: "Peptide Protocol: GLP 2", peptideId: "glp-2" },
  { from: "Peptide Protocol: Retatrutide", to: "Peptide Protocol: GLP 3", peptideId: "glp-3" },
];

async function main() {
  for (const { from, to, peptideId } of RENAMES) {
    const peptide = PEPTIDE_GUIDELINES.find((p) => p.id === peptideId);
    if (!peptide) throw new Error(`Missing peptide ${peptideId}`);

    const oldRow = await prisma.partnerGuideline.findFirst({ where: { title: from } });
    if (!oldRow) {
      console.log(`skip (not found): ${from}`);
      continue;
    }

    const existingNew = await prisma.partnerGuideline.findFirst({ where: { title: to } });
    if (existingNew && existingNew.id !== oldRow.id) {
      // Prefer the GLP-titled row; remove the legacy chemical-named duplicate.
      await prisma.partnerGuidelineGrant.deleteMany({ where: { guidelineId: oldRow.id } });
      await prisma.partnerGuideline.delete({ where: { id: oldRow.id } });
      await prisma.partnerGuideline.update({
        where: { id: existingNew.id },
        data: {
          body: peptideToGuidelineBody(peptide),
          version: PEPTIDE_LIBRARY_VERSION,
          publishedAt: new Date(),
        },
      });
      console.log(`merged duplicate → kept "${to}", deleted "${from}"`);
      continue;
    }

    await prisma.partnerGuideline.update({
      where: { id: oldRow.id },
      data: {
        title: to,
        body: peptideToGuidelineBody(peptide),
        version: PEPTIDE_LIBRARY_VERSION,
        publishedAt: new Date(),
      },
    });
    console.log(`renamed: ${from} → ${to}`);
  }

  // Sweep any leftover mentions in titles/bodies
  const pattern = /semaglutide|tirzepatide|retatrutide|trizapatide|ozempic|wegovy|mounjaro|zepbound/i;
  const leftovers = await prisma.partnerGuideline.findMany({
    select: { id: true, title: true, body: true },
  });
  const hits = leftovers.filter((g) => pattern.test(g.title) || pattern.test(g.body || ""));
  console.log(`remaining guideline hits: ${hits.length}`);
  for (const h of hits) console.log("  leftover:", h.title);

  const products = await prisma.product.findMany({
    select: { id: true, title: true, slug: true, description: true },
  });
  const pHits = products.filter(
    (x) =>
      pattern.test(x.title || "") ||
      pattern.test(x.slug || "") ||
      pattern.test(x.description || "")
  );
  console.log(`product hits: ${pHits.length}`);
  for (const x of pHits) console.log("  product:", x.slug, "|", x.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
