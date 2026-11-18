import { syncPrescribeUsaCatalog, syncEventideCatalog } from "../src/lib/eventide/sync-catalog";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Syncing Eventide…");
  const eventide = await syncEventideCatalog({ activateNew: true });
  console.log(JSON.stringify(eventide));
  if (!eventide.ok) process.exitCode = 1;

  console.log("Syncing PrescribeUSA…");
  const pusa = await syncPrescribeUsaCatalog({ activateNew: true });
  console.log(JSON.stringify(pusa));

  const products = await prisma.product.findMany({ select: { category: true, source: true } });
  const eventideCount = products.filter((p) => String(p.category || "").startsWith("Eventide") || p.source === "EVENTIDE").length;
  const pusaCount = products.filter((p) => String(p.category || "").startsWith("PrescribeUSA") || p.source === "PRESCRIBEUSA").length;
  console.log(JSON.stringify({ total: products.length, eventideProducts: eventideCount, prescribeUsaProducts: pusaCount }));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "sync failed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
