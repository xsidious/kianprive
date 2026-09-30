import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const pattern = /semaglutide|tirzepatide|retatrutide|trizapatide/i;

async function main() {
  const items = await p.orderItem.findMany({ select: { id: true, title: true } });
  const hits = items.filter((i) => pattern.test(i.title || ""));
  console.log("orderItem hits", hits.length);
  for (const h of hits.slice(0, 20)) console.log(" ", h.title);

  if (hits.length) {
    let updated = 0;
    for (const item of hits) {
      const title = item.title
        .replace(/Trizapatide/gi, "GLP 2")
        .replace(/Tirzepatide/gi, "GLP 2")
        .replace(/Semaglutide/gi, "GLP 1")
        .replace(/Retatrutide/gi, "GLP 3")
        .replace(/GLP-2T\s+GLP 2/gi, "GLP-2T")
        .replace(/\s{2,}/g, " ")
        .trim();
      await p.orderItem.update({ where: { id: item.id }, data: { title } });
      updated += 1;
    }
    console.log("orderItem updated", updated);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
