/**
 * Import body before/after collage and split into left/right frames.
 * Run: node scripts/import-body-before-after.mjs
 */
import { copyFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const assets =
  "C:\\Users\\FindMeAnywhere\\.cursor\\projects\\c-Users-FindMeAnywhere-Desktop-kianprive\\assets";
const srcName =
  "c__Users_FindMeAnywhere_AppData_Roaming_Cursor_User_workspaceStorage_6bfbed066957bfe5b822a4d8426b067c_images_WhatsApp_Image_2026-08-14_at_1.43.09_PM-e3ee8808-4a7f-4d04-a28c-07b75593223c.png";
const outDir = path.resolve("public/images/results");

async function main() {
  mkdirSync(outDir, { recursive: true });
  const input = path.join(assets, srcName);
  if (!existsSync(input)) throw new Error(`Missing source: ${input}`);

  const staging = path.join(outDir, "body-before-after-src.png");
  copyFileSync(input, staging);

  const image = sharp(staging).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) throw new Error("Could not read image size");

  const gap = Math.round(width * 0.01);
  const half = Math.floor(width / 2);

  await sharp(staging)
    .rotate()
    .resize({ width: Math.min(width, 1600), withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 })
    .toFile(path.join(outDir, "body-before-after.webp"));

  await sharp(staging)
    .rotate()
    .extract({ left: 0, top: 0, width: half - gap, height })
    .webp({ quality: 84, effort: 5 })
    .toFile(path.join(outDir, "body-before.webp"));

  await sharp(staging)
    .rotate()
    .extract({ left: half + gap, top: 0, width: width - half - gap, height })
    .webp({ quality: 84, effort: 5 })
    .toFile(path.join(outDir, "body-after.webp"));

  unlinkSync(staging);
  console.log(`source ${width}x${height}  split at ${half}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
