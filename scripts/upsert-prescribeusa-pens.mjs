/**
 * Upsert PrescribeUSA pre-filled pens into KIAN clinical catalog.
 * Usage: node scripts/upsert-prescribeusa-pens.mjs
 */
import { PrismaClient, ProductCatalogKind, ProductStatus } from "@prisma/client";

const pens = [
  ["pusa-glut-600", "Glutathione 600mg 3mL Pen", "Peptide Pens", "200 mg/mL · 600 mg total", "Pre-filled injectable glutathione pen for detoxification and cellular support protocols."],
  ["pusa-glp1s-1-5", "GLP-1S Pen 1.5mg", "GLP-1 Pens", "2.5 mg/mL · 1.5 mg total", "Pre-filled GLP-1S injectable pen for metabolic / weight-management protocols."],
  ["pusa-glp1s-3-5", "GLP-1S Pen 3.5mg", "GLP-1 Pens", "5 mg/mL · 3.5 mg total", "Pre-filled GLP-1S injectable pen for metabolic / weight-management protocols."],
  ["pusa-glp1s-5-5", "GLP-1S Pen 5.5mg", "GLP-1 Pens", "5 mg/mL · 5.5 mg total", "Pre-filled GLP-1S injectable pen for metabolic / weight-management protocols."],
  ["pusa-glp1s-7-5", "GLP-1S Pen 7.5mg", "GLP-1 Pens", "5 mg/mL · 7.5 mg total", "Pre-filled GLP-1S injectable pen for metabolic / weight-management protocols."],
  ["pusa-glp1s-10", "GLP-1S Pen 10mg", "GLP-1 Pens", "5 mg/mL · 10 mg total", "Pre-filled GLP-1S injectable pen for metabolic / weight-management protocols."],
  ["pusa-glp2t-40", "GLP-2T Tirzepatide Pen 40mg", "GLP-1 Pens", "20 mg/mL · 40 mg total", "Pre-filled tirzepatide (GLP-2T) injectable pen for metabolic protocols."],
  ["pusa-tesa-ipa-12-3", "Tesamorelin/Ipamorelin 12mg/3mg 3mL Pen", "Peptide Pens", "12 mg / 3 mg total", "Pre-filled Tesamorelin/Ipamorelin combination injectable pen."],
  ["pusa-b3-1000", "B3 1000mg 3mL Pen", "Peptide Pens", "333.33 mg/mL · 1000 mg total", "Pre-filled B3 injectable pen."],
  ["pusa-cjc-ipa-5-5", "CJC (no DAC)/Ipamorelin 5/5mg 3mL Pen", "Peptide Pens", "5 mg / 5 mg total", "Pre-filled CJC (no DAC)/Ipamorelin combination injectable pen."],
  ["pusa-cagri-20", "Cagrilinitide 20mg 3mL Pen", "GLP-1 Pens", "20 mg total", "Pre-filled cagrilintide injectable pen."],
  ["pusa-kiss-5", "Kisspeptin 5mg 3mL Pen", "Peptide Pens", "5 mg total", "Pre-filled Kisspeptin injectable pen."],
  ["pusa-ipa-30", "Ipamorelin 30mg 3mL Pen", "Peptide Pens", "30 mg total", "Pre-filled Ipamorelin injectable pen."],
  ["pusa-5a1mq-50", "5 Amino 1mq 50mg 3mL Pen", "Peptide Pens", "50 mg total", "Pre-filled 5-Amino-1MQ injectable pen."],
];

const wholesale = 199;
const retail = 299;
const prisma = new PrismaClient();

async function main() {
  let upserted = 0;
  for (const [slug, title, category, strength, description] of pens) {
    const sku = `PUSA-${slug.replace(/^pusa-/, "").toUpperCase()}`;
    await prisma.product.upsert({
      where: { slug },
      create: {
        slug,
        title,
        description: `${description}\n\nSource: PrescribeUSA pre-filled injectable pen. Prescription therapy — clinical catalog only.`,
        status: ProductStatus.ACTIVE,
        category,
        subcategory: "PrescribeUSA",
        isPrescription: true,
        catalogKind: ProductCatalogKind.CLINICAL,
        externalId: `prescribeusa:${slug}`,
        wholesalePrice: wholesale,
        form: "Pre-Filled Injectable Pen",
        strength,
        deliveryMethod: "Injectable Pen",
        source: "PrescribeUSA",
        price: retail,
        sku,
        inventoryQty: 100,
        trackInventory: false,
        seoTitle: `${title} | KIAN Privé Therapeutics`,
        seoDescription: description,
      },
      update: {
        title,
        description: `${description}\n\nSource: PrescribeUSA pre-filled injectable pen. Prescription therapy — clinical catalog only.`,
        status: ProductStatus.ACTIVE,
        category,
        subcategory: "PrescribeUSA",
        isPrescription: true,
        catalogKind: ProductCatalogKind.CLINICAL,
        externalId: `prescribeusa:${slug}`,
        wholesalePrice: wholesale,
        form: "Pre-Filled Injectable Pen",
        strength,
        deliveryMethod: "Injectable Pen",
        source: "PrescribeUSA",
        price: retail,
        sku,
        trackInventory: false,
        seoTitle: `${title} | KIAN Privé Therapeutics`,
        seoDescription: description,
      },
    });
    upserted += 1;
  }
  console.log(`Upserted ${upserted} PrescribeUSA pens into KIAN (wholesale $${wholesale}, retail $${retail}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
