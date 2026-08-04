/**
 * Import PrescribeUSA clinical products from Alycia CSV.
 * Usage: node scripts/import-prescribeusa-products.mjs [path-to-csv]
 */
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CSV =
  "c:/Users/FindMeAnywhere/Downloads/products-detailed_www-prescribeusa-com_2026-08-03_17-52-53 alycia.csv";

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

function money(value) {
  const n = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

async function readRows(csvPath) {
  const rl = createInterface({ input: createReadStream(csvPath, { encoding: "utf8" }), crlfDelay: Infinity });
  let headers = null;
  const byId = new Map();
  let buffer = "";
  let inQuotes = false;

  for await (const raw of rl) {
    buffer = buffer ? `${buffer}\n${raw}` : raw;
    for (const ch of raw) {
      if (ch === '"') inQuotes = !inQuotes;
    }
    if (inQuotes) continue;

    const line = buffer;
    buffer = "";
    if (!headers) {
      headers = parseCsvLine(line).map((h) => h.trim());
      continue;
    }
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    const id = String(row["Product ID"] || "").trim();
    if (!id) continue;
    // Keep richest row (prefer one with description / image)
    const existing = byId.get(id);
    const score =
      (row.Description ? 2 : 0) + (row["Image URLs"] ? 2 : 0) + (row.Category ? 1 : 0) + (row.SKU ? 1 : 0);
    const existingScore = existing
      ? (existing.Description ? 2 : 0) +
        (existing["Image URLs"] ? 2 : 0) +
        (existing.Category ? 1 : 0) +
        (existing.SKU ? 1 : 0)
      : -1;
    if (!existing || score >= existingScore) byId.set(id, row);
  }
  return [...byId.values()];
}

async function main() {
  const csvPath = process.argv[2] || DEFAULT_CSV;
  const rows = await readRows(csvPath);
  console.log(`Parsed ${rows.length} unique products from CSV`);

  let upserted = 0;
  for (const row of rows) {
    const externalId = String(row["Product ID"]).trim();
    const title = String(row["Product Name"] || "").trim() || `Product ${externalId.slice(-6)}`;
    const baseSlug = slugify(title) || `clinical-${externalId.slice(-8)}`;
    const slug = `${baseSlug}-${externalId.slice(-6)}`;
    const category = String(row.Category || row["Product Class"] || "Peptides").trim() || "Peptides";
    const subcategory = String(row.Subcategory || row["Product Sub-Class"] || "").trim() || null;
    const description = String(row.Description || "").trim() || null;
    const sku = String(row.SKU || "").trim() || null;
    const image = String(row["Image URLs"] || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)[0];
    const wholesale = money(row.Wholesale);
    const strengthParts = [row.Strength, row["Strength Unit"]].filter(Boolean).join(" ").trim();
    const isRx = String(row.Prescription || "").toUpperCase() === "RX";

    await prisma.product.upsert({
      where: { externalId },
      create: {
        externalId,
        slug,
        title,
        description,
        category,
        subcategory,
        form: String(row.Form || "").trim() || null,
        strength: strengthParts || null,
        deliveryMethod: String(row["Delivery Method"] || "").trim() || null,
        source: "PRESCRIBE_USA",
        catalogKind: "CLINICAL",
        isPrescription: isRx,
        featuredImage: image || null,
        galleryImages: image ? [image] : [],
        wholesalePrice: wholesale || null,
        price: 0,
        sku: sku || null,
        status: "ACTIVE",
        inventoryQty: 100,
        trackInventory: false,
      },
      update: {
        title,
        description,
        category,
        subcategory,
        form: String(row.Form || "").trim() || null,
        strength: strengthParts || null,
        deliveryMethod: String(row["Delivery Method"] || "").trim() || null,
        source: "PRESCRIBE_USA",
        catalogKind: "CLINICAL",
        isPrescription: isRx,
        featuredImage: image || undefined,
        galleryImages: image ? [image] : undefined,
        wholesalePrice: wholesale || null,
        sku: sku || undefined,
        status: "ACTIVE",
      },
    });
    upserted += 1;
    if (upserted % 25 === 0) console.log(`… ${upserted}/${rows.length}`);
  }

  console.log(`Upserted ${upserted} clinical products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
