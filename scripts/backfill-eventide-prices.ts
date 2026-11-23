import { prisma } from "../src/lib/prisma";

async function main() {
  const key =
    process.env.VITARELAY_API_KEY?.trim() ||
    process.env.EVENTIDE_API_KEY?.trim() ||
    process.env.EVENTIDE_API_KEY?.trim() ||
    "";
  if (!key) throw new Error("No Eventide/VitaRelay API key");

  const headers = { Authorization: `Bearer ${key}`, Accept: "application/json" };
  const priced = new Map<string, number>();
  for (let page = 1; page <= 40; page += 1) {
    const res = await fetch(`https://vitarelay.com/api/public/v1/catalog?limit=100&page=${page}`, {
      headers,
      cache: "no-store",
    });
    const json = (await res.json()) as { data?: Array<{ id?: string; name?: string; price_cents?: number }> };
    const rows = Array.isArray(json.data) ? json.data : [];
    if (!rows.length) break;
    for (const row of rows) {
      if (row.id && typeof row.price_cents === "number") {
        priced.set(row.id, row.price_cents);
        priced.set(
          `name:${String(row.name || "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim()}`,
          row.price_cents,
        );
      }
    }
    if (rows.length < 100) break;
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { source: "EVENTIDE" },
        { category: { startsWith: "Eventide" } },
        { externalId: { startsWith: "eventide:" } },
      ],
    },
    select: { id: true, sku: true, title: true, externalId: true },
  });

  let updated = 0;
  for (const p of products) {
    const id = (p.externalId || "").replace(/^eventide:/i, "") || p.sku || "";
    const cents =
      priced.get(id) ??
      priced.get(
        `name:${String(p.title || "")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim()}`,
      );
    if (cents == null) continue;
    await prisma.product.update({
      where: { id: p.id },
      data: { wholesalePrice: Math.round(cents) / 100 },
    });
    updated += 1;
  }

  console.log(JSON.stringify({ eventideProducts: products.length, pricedRemote: priced.size / 2, updated }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
