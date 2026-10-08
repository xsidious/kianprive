/**
 * Fill missing RxHere product photos by matching medication / product name.
 *
 * Rules:
 * 1) Prefer an exact medication-name match that already has a webp.
 * 2) Else match a related medication (shared primary ingredient / stack component).
 * 3) Propagate that photo to every SKU with the same medication name.
 * 4) Update scripts/data/rxhere-formulary.json and Product.featuredImage in DB.
 *
 * Usage: node scripts/backfill-formulary-images-by-name.mjs
 */
import "dotenv/config";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { formularyImageForCategory } from "./formulary-image-map.mjs";

const prisma = new PrismaClient();
const FORMULARY = resolve("scripts/data/rxhere-formulary.json");
const SKU_IMAGES = resolve("scripts/data/rxhere-sku-images.json");

function normName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/semaglutide/g, "glp 1")
    .replace(/tirzepatide|trizapatide/g, "glp 2")
    .replace(/retatrutide/g, "glp 3")
    .replace(/[^a-z0-9/+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function primaryToken(name) {
  const n = normName(name);
  if (!n) return "";
  // Prefer first stack component before /
  return n.split("/")[0].trim();
}

function localPath(imageId) {
  return `/images/formulary/rxhere/${imageId}.webp`;
}

function isWebpPath(path) {
  return Boolean(path && String(path).includes("/images/formulary/rxhere/") && String(path).endsWith(".webp"));
}

function scoreMatch(need, have) {
  const a = normName(need);
  const b = normName(have);
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (a.includes(b) || b.includes(a)) return 80;
  const ap = primaryToken(a);
  const bp = primaryToken(b);
  if (ap && ap === bp) return 70;
  // shared component in stacks
  const as = new Set(a.split(/[/\s]+/).filter((t) => t.length > 2));
  const bs = new Set(b.split(/[/\s]+/).filter((t) => t.length > 2));
  let shared = 0;
  for (const t of as) if (bs.has(t)) shared += 1;
  if (shared >= 2) return 60;
  if (shared === 1 && (as.size <= 2 || bs.size <= 2)) return 50;
  return 0;
}

async function main() {
  const rows = JSON.parse(readFileSync(FORMULARY, "utf8"));
  const skuImages = existsSync(SKU_IMAGES) ? JSON.parse(readFileSync(SKU_IMAGES, "utf8")) : [];

  /** @type {Map<string, { medication: string, imageId: string, image: string, sku: string }>} */
  const donors = new Map();

  function remember(medication, imageId, sku) {
    if (!medication || !imageId) return;
    const key = normName(medication);
    if (!key) return;
    if (!donors.has(key)) {
      donors.set(key, { medication, imageId, image: localPath(imageId), sku });
    }
  }

  for (const row of skuImages) remember(row.medication, row.imageId, row.sku);
  for (const row of rows) {
    if (row.imageId) remember(row.medication, row.imageId, row.sku);
  }

  // Also pull current DB webp paths as donors (title/sku).
  const dbProducts = await prisma.product.findMany({
    where: { source: "RXHERE", catalogKind: "CLINICAL" },
    select: { id: true, sku: true, title: true, featuredImage: true, category: true },
  });
  for (const product of dbProducts) {
    if (!isWebpPath(product.featuredImage)) continue;
    const imageId = String(product.featuredImage).split("/").pop()?.replace(/\.webp$/, "");
    const med =
      rows.find((r) => r.sku === product.sku)?.medication ||
      String(product.title || "").replace(/\s+\d.*$/, "").trim();
    remember(med, imageId, product.sku);
  }

  const donorList = [...donors.values()];

  function findDonor(medication) {
    let best = null;
    let bestScore = 0;
    for (const donor of donorList) {
      const score = scoreMatch(medication, donor.medication);
      if (score > bestScore) {
        bestScore = score;
        best = donor;
      }
    }
    return bestScore >= 50 ? best : null;
  }

  let jsonFilled = 0;
  let jsonUnchanged = 0;
  const usedByMed = new Map();

  for (const row of rows) {
    const medKey = normName(row.medication);
    // Prefer already-known webp for this exact medication if any sibling has one
    let donor = usedByMed.get(medKey) || null;
    if (!donor && isWebpPath(row.image) && row.imageId) {
      donor = { medication: row.medication, imageId: row.imageId, image: row.image, sku: row.sku };
      usedByMed.set(medKey, donor);
    }
    if (!donor) donor = findDonor(row.medication);
    if (donor) {
      usedByMed.set(medKey, donor);
      if (row.image !== donor.image || row.imageId !== donor.imageId) {
        row.image = donor.image;
        row.imageId = donor.imageId;
        row.imageSourceUrl = `https://rxhere.qrolic.com/api/uploads/${donor.imageId}.webp`;
        jsonFilled += 1;
      } else {
        jsonUnchanged += 1;
      }
    } else {
      jsonUnchanged += 1;
    }
  }

  writeFileSync(FORMULARY, JSON.stringify(rows, null, 2) + "\n");

  // Update DB: same-name products share one photo; missing ones get donor photo.
  let dbUpdated = 0;
  let dbSkipped = 0;
  for (const product of dbProducts) {
    const formulary = rows.find((r) => r.sku === product.sku);
    const medication = formulary?.medication || String(product.title || "").replace(/\s+\d.*$/, "").trim();
    const medKey = normName(medication);
    let donor = usedByMed.get(medKey) || findDonor(medication);
    const nextImage = donor?.image || formulary?.image || (isWebpPath(product.featuredImage) ? product.featuredImage : null);
    const featuredImage = nextImage || formularyImageForCategory(product.category || formulary?.category);
    if (product.featuredImage === featuredImage) {
      dbSkipped += 1;
      continue;
    }
    await prisma.product.update({
      where: { id: product.id },
      data: { featuredImage },
    });
    dbUpdated += 1;
  }

  const stillSvg = await prisma.product.count({
    where: { source: "RXHERE", featuredImage: { contains: ".svg" } },
  });
  const webp = await prisma.product.count({
    where: { source: "RXHERE", featuredImage: { contains: ".webp" } },
  });

  console.log(
    JSON.stringify(
      {
        donors: donors.size,
        jsonFilled,
        jsonUnchanged,
        dbUpdated,
        dbSkipped,
        dbWebp: webp,
        dbSvg: stillSvg,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
