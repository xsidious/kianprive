import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const pattern = /semaglutide|tirzepatide|retatrutide|trizapatide|ozempic|wegovy|mounjaro|zepbound/i;

async function main() {
  const guidelines = await p.partnerGuideline.findMany({
    select: { id: true, title: true, body: true },
  });
  const gHits = guidelines.filter(
    (g) => pattern.test(g.title) || pattern.test(g.body || "")
  );
  console.log("guideline hits", gHits.length);
  for (const g of gHits) console.log("G:", g.title);

  const products = await p.product.findMany({
    select: { id: true, title: true, slug: true, description: true, summary: true },
  });
  const pHits = products.filter(
    (x) =>
      pattern.test(x.title || "") ||
      pattern.test(x.slug || "") ||
      pattern.test(x.description || "") ||
      pattern.test(x.summary || "")
  );
  console.log("product hits", pHits.length);
  for (const x of pHits) console.log("P:", x.slug, "|", x.title);

  // Any GLP-named protocols already?
  const glp = guidelines.filter((g) => /GLP\s*[123]/i.test(g.title));
  console.log("GLP-titled guidelines", glp.length);
  for (const g of glp) console.log("GLP:", g.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
