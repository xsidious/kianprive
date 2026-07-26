/**
 * One-off asset compression for LCP / card images.
 * Run: node scripts/optimize-images.mjs
 */
import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/images");

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function writeWebp(inputName, outputName, width, quality = 72) {
  const input = path.join(root, inputName);
  const output = path.join(root, outputName);
  if (!(await exists(input))) {
    console.warn("skip missing", inputName);
    return;
  }
  await sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(output);
  console.log("wrote", outputName);
}

async function main() {
  await mkdir(root, { recursive: true });

  // Hero: wide but compressed WebP for faster LCP when optimizer serves derivatives
  await writeWebp("facial-treatments.jpg", "facial-treatments.webp", 1600, 70);
  // Keep a reasonably sized JPEG fallback for older refs
  await sharp(path.join(root, "facial-treatments.jpg"))
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(path.join(root, "facial-treatments-opt.jpg"));
  console.log("wrote facial-treatments-opt.jpg");

  await writeWebp("blood-work.png", "blood-work.webp", 800, 72);
  await writeWebp("icoone-treatment-session.png", "icoone-treatment-session.webp", 800, 72);
  await writeWebp("microneedling.jpg", "microneedling.webp", 900, 70);
  await writeWebp("microneedlingg.jpeg", "microneedlingg.webp", 900, 72);

  // OG default from hero
  await sharp(path.join(root, "facial-treatments.jpg"))
    .rotate()
    .resize({ width: 1200, height: 630, fit: "cover" })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(path.join(root, "og-default.jpg"));
  console.log("wrote og-default.jpg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
