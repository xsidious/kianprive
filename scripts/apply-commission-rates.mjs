import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Keep in sync with src/lib/commission-policy.ts */
const EVERYONE_SERVICES = {
  "icoone-laser": 10,
  "comprehensive-bloodwork": 10,
  "glp1-peptides": 10,
};

const CONSULTATION_SPECIALISTS = new Set(["SHANESHUCK", "JENNFENNER"]);
const CONSULTATION_RATES = {
  telemedicine: 75,
  nutrition: 75,
};

const DEFAULT_PRODUCT_PCT = 10;
const PEPTIDE_PRODUCT_PCT = 10;

function isPeptideProduct(product) {
  if (product.isPrescription) return true;
  const haystack = `${product.slug} ${product.title} ${product.category ?? ""}`.toLowerCase();
  return /peptide|glp|semaglutide|tirzepatide|compound/.test(haystack);
}

async function upsertServiceAssignment(partnerId, serviceSlug, commissionPct) {
  await prisma.partnerServiceAssignment.upsert({
    where: { partnerId_serviceSlug: { partnerId, serviceSlug } },
    create: { partnerId, serviceSlug, active: true, commissionPct },
    update: { active: true, commissionPct },
  });
}

async function upsertProductAssignment(partnerId, productId, commissionPct) {
  await prisma.partnerProductAssignment.upsert({
    where: { partnerId_productId: { partnerId, productId } },
    create: { partnerId, productId, active: true, commissionPct },
    update: { active: true, commissionPct },
  });
}

async function main() {
  const [partners, products] = await Promise.all([
    prisma.partnerProfile.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, displayName: true, partnerCode: true, type: true },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, slug: true, title: true, category: true, isPrescription: true },
    }),
  ]);

  const peptideProducts = products.filter(isPeptideProduct);
  const shopProducts = products.filter((p) => !isPeptideProduct(p));

  for (const partner of partners) {
    await prisma.partnerProfile.update({
      where: { id: partner.id },
      data: { defaultProductCommissionPct: DEFAULT_PRODUCT_PCT },
    });

    for (const [slug, pct] of Object.entries(EVERYONE_SERVICES)) {
      await upsertServiceAssignment(partner.id, slug, pct);
    }

    if (CONSULTATION_SPECIALISTS.has(partner.partnerCode.toUpperCase())) {
      for (const [slug, pct] of Object.entries(CONSULTATION_RATES)) {
        await upsertServiceAssignment(partner.id, slug, pct);
      }
    }

    // Clinical / brand partners need product assignments to earn shop commission.
    if (partner.type === "CLINICAL" || partner.type === "BRAND" || partner.type === "BOTH") {
      for (const product of shopProducts) {
        await upsertProductAssignment(partner.id, product.id, DEFAULT_PRODUCT_PCT);
      }
    }

    // Peptide / Rx shop products: everyone including practitioners who refer sales.
    for (const product of peptideProducts) {
      await upsertProductAssignment(partner.id, product.id, PEPTIDE_PRODUCT_PCT);
    }

    const specialist = CONSULTATION_SPECIALISTS.has(partner.partnerCode.toUpperCase());
    console.log(
      `✓ ${partner.displayName} (${partner.partnerCode}): shop products ${DEFAULT_PRODUCT_PCT}%` +
        (specialist ? ", consultations 75%" : "") +
        `, Icoone/bloodwork/peptides services 10%` +
        (peptideProducts.length ? `, ${peptideProducts.length} peptide SKU(s) ${PEPTIDE_PRODUCT_PCT}%` : ""),
    );
  }

  console.log(`\nShop catalog SKUs (non-peptide): ${shopProducts.length}`);
  console.log(`Peptide / Rx SKUs found: ${peptideProducts.length}`);
  if (!peptideProducts.length) {
    console.log(
      "Note: no peptide shop products in DB yet — pathway referral uses glp1-peptides service at 10%. When peptide SKUs are added (isPrescription), re-run this script.",
    );
  }
  console.log(`Applied rates to ${partners.length} active partners.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
