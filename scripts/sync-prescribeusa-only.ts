import { syncPrescribeUsaCatalog } from "../src/lib/eventide/sync-catalog";
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await syncPrescribeUsaCatalog({ activateNew: true });
  console.log(JSON.stringify(result));
  const products = await prisma.product.findMany({ select: { category: true, source: true } });
  console.log(
    JSON.stringify({
      total: products.length,
      eventide: products.filter((p) => String(p.category || "").startsWith("Eventide") || p.source === "EVENTIDE").length,
      prescribeusa: products.filter((p) => String(p.category || "").startsWith("PrescribeUSA") || p.source === "PRESCRIBEUSA").length,
    }),
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "sync failed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
