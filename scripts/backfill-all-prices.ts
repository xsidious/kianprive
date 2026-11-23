import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { prescribeUsaPensCatalog } from "../src/lib/prescribeusa-pens-catalog";
import { prisma } from "../src/lib/prisma";

function loadEnvFrom(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}
loadEnvFrom(resolve(process.cwd(), ".env"));
loadEnvFrom(resolve("C:/Users/FindMeAnywhere/Desktop/wellness-tech/.env"));

function norm(s: string) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const key =
    process.env.VITARELAY_API_KEY?.trim() ||
    process.env.EVENTIDE_API_KEY?.trim() ||
    process.env.EVENTIDE_API_KEY?.trim() ||
    "";
  const publicPrices = new Map<string, number>();
  if (key) {
    const headers = { Authorization: `Bearer ${key}`, Accept: "application/json" };
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
          publicPrices.set(row.id, row.price_cents / 100);
          publicPrices.set(`name:${norm(row.name || "")}`, row.price_cents / 100);
        }
      }
      if (rows.length < 100) break;
    }
  }

  const localPath = resolve("C:/Users/FindMeAnywhere/Desktop/wellness-tech/data/eventide-formulary.json");
  const local = existsSync(localPath)
    ? (JSON.parse(readFileSync(localPath, "utf8")) as Array<{
        medication?: string;
        name?: string;
        strength?: string;
        size?: string;
        price?: number;
      }>)
    : [];
  const localByName = new Map<string, number>();
  for (const row of local) {
    if (row.price == null) continue;
    localByName.set(norm([row.medication || row.name, row.strength, row.size].filter(Boolean).join(" ")), Number(row.price));
    localByName.set(norm(row.medication || row.name || ""), Number(row.price));
  }

  let pusa = 0;
  for (const line of prescribeUsaPensCatalog) {
    const externalId = `prescribeusa:${line.sku}`;
    await prisma.product.updateMany({
      where: { OR: [{ externalId }, { sku: line.sku }] },
      data: {
        wholesalePrice: line.priceCents / 100,
        category: line.category.startsWith("PrescribeUSA") ? line.category : `PrescribeUSA · ${line.category}`,
        source: "PRESCRIBEUSA",
        status: "ACTIVE",
      },
    });
    pusa += 1;
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { source: "EVENTIDE" },
        { category: { startsWith: "Eventide" } },
        { externalId: { startsWith: "eventide:" } },
      ],
    },
    select: { id: true, sku: true, title: true, externalId: true, wholesalePrice: true, category: true },
  });

  const categoryVals: Record<string, number[]> = {};
  let updated = 0;
  const planned: Array<{ id: string; wholesale: number; category: string }> = [];

  for (const p of products) {
    const id = (p.externalId || "").replace(/^eventide:/i, "") || p.sku || "";
    let wholesale =
      publicPrices.get(id) ??
      publicPrices.get(`name:${norm(p.title)}`) ??
      localByName.get(norm(p.title)) ??
      null;
    if (wholesale == null) {
      // fuzzy: longest medication key contained in title
      let best = 0;
      let bestPrice = 0;
      for (const [key, price] of localByName) {
        if (key.length < 4) continue;
        if (norm(p.title).includes(key) || key.includes(norm(p.title).slice(0, 24))) {
          if (key.length > best) {
            best = key.length;
            bestPrice = price;
          }
        }
      }
      if (best > 0) wholesale = bestPrice;
    }
    if (wholesale != null && wholesale > 0) {
      planned.push({ id: p.id, wholesale, category: p.category || "Eventide" });
      (categoryVals[p.category || "Eventide"] ||= []).push(wholesale);
    }
  }

  const medians = new Map<string, number>();
  for (const [cat, vals] of Object.entries(categoryVals)) {
    const sorted = [...vals].sort((a, b) => a - b);
    medians.set(cat, sorted[Math.floor(sorted.length / 2)] || 45);
  }
  const all = Object.values(categoryVals).flat().sort((a, b) => a - b);
  const globalMedian = all[Math.floor(all.length / 2)] || 45;

  const priced = new Set(planned.map((p) => p.id));
  for (const p of products) {
    if (priced.has(p.id)) continue;
    planned.push({
      id: p.id,
      wholesale: medians.get(p.category || "") || globalMedian,
      category: p.category || "Eventide",
    });
  }

  for (const row of planned) {
    await prisma.product.update({
      where: { id: row.id },
      data: { wholesalePrice: row.wholesale },
    });
    updated += 1;
  }

  const withWholesale = await prisma.product.count({
    where: {
      wholesalePrice: { gt: 0 },
      OR: [{ source: "EVENTIDE" }, { category: { startsWith: "Eventide" } }, { source: "PRESCRIBEUSA" }],
    },
  });
  const zero = await prisma.product.count({
    where: {
      OR: [{ wholesalePrice: null }, { wholesalePrice: 0 }],
      AND: [{ OR: [{ source: "EVENTIDE" }, { category: { startsWith: "Eventide" } }, { source: "PRESCRIBEUSA" }] }],
    },
  });

  console.log(JSON.stringify({ pusa, planned: planned.length, updated, withWholesale, zero }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
