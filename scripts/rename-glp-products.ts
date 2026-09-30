/**
 * Replace Semaglutide / Tirzepatide / Retatrutide in Product titles, descriptions, and slugs
 * with generic GLP 1 / GLP 2 / GLP 3 labels.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const pattern = /semaglutide|tirzepatide|retatrutide|trizapatide/i;

function rewriteLabel(text: string): string {
  return text
    .replace(/Trizapatide/gi, "GLP 2")
    .replace(/Tirzepatide/gi, "GLP 2")
    .replace(/Semaglutide/gi, "GLP 1")
    .replace(/Retatrutide/gi, "GLP 3")
    // Clean doubled labels like "GLP-2T GLP 2" → "GLP-2T"
    .replace(/GLP-2T\s+GLP 2/gi, "GLP-2T")
    .replace(/GLP-1S\s+GLP 1/gi, "GLP-1S")
    .replace(/GLP-3R\s+GLP 3/gi, "GLP-3R")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function rewriteSlug(slug: string): string {
  return slug
    .replace(/trizapatide/gi, "glp-2")
    .replace(/tirzepatide/gi, "glp-2")
    .replace(/semaglutide/gi, "glp-1")
    .replace(/retatrutide/gi, "glp-3")
    .replace(/glp-2t-glp-2/gi, "glp-2t")
    .replace(/glp-1s-glp-1/gi, "glp-1s")
    .replace(/glp-3r-glp-3/gi, "glp-3r")
    .replace(/-{2,}/g, "-");
}

async function uniqueSlug(desired: string, excludeId: string): Promise<string> {
  let candidate = desired;
  let n = 2;
  while (true) {
    const existing = await prisma.product.findFirst({
      where: { slug: candidate, NOT: { id: excludeId } },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${desired}-${n}`;
    n += 1;
  }
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true, slug: true, description: true, seoTitle: true, seoDescription: true },
  });

  let updated = 0;
  for (const product of products) {
    const hay = [product.title, product.slug, product.description, product.seoTitle, product.seoDescription]
      .filter(Boolean)
      .join("\n");
    if (!pattern.test(hay)) continue;

    const title = rewriteLabel(product.title);
    const description = product.description ? rewriteLabel(product.description) : product.description;
    const seoTitle = product.seoTitle ? rewriteLabel(product.seoTitle) : product.seoTitle;
    const seoDescription = product.seoDescription ? rewriteLabel(product.seoDescription) : product.seoDescription;
    const slug = await uniqueSlug(rewriteSlug(product.slug), product.id);

    await prisma.product.update({
      where: { id: product.id },
      data: { title, slug, description, seoTitle, seoDescription },
    });
    updated += 1;
    console.log(`${product.slug}`);
    console.log(`  → title: ${title}`);
    if (slug !== product.slug) console.log(`  → slug:  ${slug}`);
  }

  console.log(`\nUpdated ${updated} products.`);

  const leftovers = await prisma.product.findMany({
    select: { title: true, slug: true, description: true },
  });
  const still = leftovers.filter(
    (x) => pattern.test(x.title || "") || pattern.test(x.slug || "") || pattern.test(x.description || "")
  );
  console.log(`Remaining product hits: ${still.length}`);
  for (const x of still) console.log(" ", x.slug, "|", x.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
