/**
 * Download RxHere product images into public/images/formulary/rxhere/
 * and attach image paths onto scripts/data/rxhere-formulary.json by SKU.
 *
 * Usage:
 *   node scripts/pull-rxhere-images.mjs
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const ROOT = resolve(".");
const OUT_DIR = resolve(ROOT, "public/images/formulary/rxhere");
const IMAGES_JSON = resolve(ROOT, "scripts/data/rxhere-images.json");
const SKU_JSON = resolve(ROOT, "scripts/data/rxhere-sku-images.json");
const FORMULARY_JSON = resolve(ROOT, "scripts/data/rxhere-formulary.json");

const CONCURRENCY = 8;

function localPathFor(imageId) {
  return `/images/formulary/rxhere/${imageId}.webp`;
}

async function downloadOne(img) {
  const dest = resolve(OUT_DIR, `${img.imageId}.webp`);
  if (existsSync(dest)) {
    const st = await import("fs").then((m) => m.statSync(dest));
    if (st.size > 1000) return { imageId: img.imageId, status: "skip" };
  }
  const url = img.imagePublicUrl || `https://rxhere.qrolic.com/api/uploads/${img.imageId}.webp`;
  const res = await fetch(url);
  if (!res.ok) return { imageId: img.imageId, status: "fail", code: res.status };
  mkdirSync(dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return { imageId: img.imageId, status: "ok" };
}

async function mapPool(items, limit, fn) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function patchFormulary(skuToImage) {
  if (!existsSync(FORMULARY_JSON)) {
    console.warn(`No formulary at ${FORMULARY_JSON}`);
    return { patched: 0, missing: 0 };
  }
  const rows = JSON.parse(readFileSync(FORMULARY_JSON, "utf8"));
  let patched = 0;
  let missing = 0;
  for (const row of rows) {
    const sku = String(row.sku || "").trim();
    const img = skuToImage.get(sku);
    if (img?.imageId) {
      row.imageId = img.imageId;
      row.image = localPathFor(img.imageId);
      row.imageSourceUrl = img.imagePublicUrl || null;
      patched += 1;
    } else {
      missing += 1;
    }
  }
  writeFileSync(FORMULARY_JSON, JSON.stringify(rows, null, 2) + "\n");
  return { patched, missing, total: rows.length };
}

async function main() {
  const images = JSON.parse(readFileSync(IMAGES_JSON, "utf8"));
  const skuRows = JSON.parse(readFileSync(SKU_JSON, "utf8"));
  mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Downloading ${images.length} unique RxHere images → ${OUT_DIR}`);
  const results = await mapPool(images, CONCURRENCY, downloadOne);
  const ok = results.filter((r) => r.status === "ok").length;
  const skip = results.filter((r) => r.status === "skip").length;
  const fail = results.filter((r) => r.status === "fail");
  console.log(`Done downloads: ${ok} new, ${skip} skipped, ${fail.length} failed`);
  if (fail.length) console.log("Failures:", fail.slice(0, 10));

  const skuToImage = new Map();
  for (const row of skuRows) {
    if (row.sku && row.imageId) skuToImage.set(String(row.sku).trim(), row);
  }
  const patch = patchFormulary(skuToImage);
  console.log(`Formulary image fields: ${patch.patched}/${patch.total} SKUs mapped, ${patch.missing} without image`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
