/**
 * Copy WhatsApp product shots into public/images/products as WebP.
 * Run: node scripts/import-kian-product-photos.mjs
 */
import { copyFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const assets =
  "C:\\Users\\FindMeAnywhere\\.cursor\\projects\\c-Users-FindMeAnywhere-Desktop-kianprive\\assets";
const outDir = path.resolve("public/images/products");

const files = [
  [
    "c__Users_FindMeAnywhere_AppData_Roaming_Cursor_User_workspaceStorage_6bfbed066957bfe5b822a4d8426b067c_images_WhatsApp_Image_2026-08-09_at_11.50.42_PM-2344d9c6-377b-4290-9ddf-1d4b86a02b87.png",
    "kian-hair-serum.webp",
  ],
  [
    "c__Users_FindMeAnywhere_AppData_Roaming_Cursor_User_workspaceStorage_6bfbed066957bfe5b822a4d8426b067c_images_WhatsApp_Image_2026-08-09_at_11.54.44_PM-27f6ff69-0fad-4139-b77c-3fcbafcfa86d.png",
    "kian-body-oil.webp",
  ],
  [
    "c__Users_FindMeAnywhere_AppData_Roaming_Cursor_User_workspaceStorage_6bfbed066957bfe5b822a4d8426b067c_images_WhatsApp_Image_2026-08-09_at_11.46.28_PM-6a7b27dd-f4bb-4fb1-b633-f0771f7bd344.png",
    "kian-toner.webp",
  ],
  [
    "c__Users_FindMeAnywhere_AppData_Roaming_Cursor_User_workspaceStorage_6bfbed066957bfe5b822a4d8426b067c_images_WhatsApp_Image_2026-08-09_at_11.43.38_PM-5146db86-c195-43d9-8e0a-34450b3ed0aa.png",
    "kian-hair-mask.webp",
  ],
  [
    "c__Users_FindMeAnywhere_AppData_Roaming_Cursor_User_workspaceStorage_6bfbed066957bfe5b822a4d8426b067c_images_WhatsApp_Image_2026-08-10_at_12.32.09_AM-783600c6-cb04-4296-9d42-9784835ca32d.png",
    "kian-anti-aging-facial-oil.webp",
  ],
  [
    "c__Users_FindMeAnywhere_AppData_Roaming_Cursor_User_workspaceStorage_6bfbed066957bfe5b822a4d8426b067c_images_WhatsApp_Image_2026-08-10_at_12.23.33_AM-94df3275-be40-41df-9da5-f68010ef7695.png",
    "kian-body-lotion.webp",
  ],
  [
    "c__Users_FindMeAnywhere_AppData_Roaming_Cursor_User_workspaceStorage_6bfbed066957bfe5b822a4d8426b067c_images_WhatsApp_Image_2026-08-10_at_12.21.19_AM-67286239-ed46-45ab-b667-b503d9f78ceb.png",
    "kian-natural-soap.webp",
  ],
  [
    "c__Users_FindMeAnywhere_AppData_Roaming_Cursor_User_workspaceStorage_6bfbed066957bfe5b822a4d8426b067c_images_WhatsApp_Image_2026-08-10_at_12.29.52_AM-5024fd5d-0c83-474a-942d-084df559ea97.png",
    "kian-hand-sanitizer.webp",
  ],
  [
    "c__Users_FindMeAnywhere_AppData_Roaming_Cursor_User_workspaceStorage_6bfbed066957bfe5b822a4d8426b067c_images_WhatsApp_Image_2026-08-10_at_12.17.56_AM-75858bcf-b402-4c5e-9fef-3edc70255976.png",
    "kian-serenity-room-spray.webp",
  ],
  [
    "c__Users_FindMeAnywhere_AppData_Roaming_Cursor_User_workspaceStorage_6bfbed066957bfe5b822a4d8426b067c_images_WhatsApp_Image_2026-08-09_at_11.57.42_PM-a1ede038-1f8c-4655-b394-316fa69391ab.png",
    "kian-scar-oil.webp",
  ],
  [
    "c__Users_FindMeAnywhere_AppData_Roaming_Cursor_User_workspaceStorage_6bfbed066957bfe5b822a4d8426b067c_images_WhatsApp_Image_2026-08-10_at_12.00.08_AM-0a88ad5f-03f3-4ef1-8ec7-9c4caa3360f5.png",
    "kian-bliss-room-spray.webp",
  ],
];

async function main() {
  mkdirSync(outDir, { recursive: true });
  for (const [srcName, destName] of files) {
    const input = path.join(assets, srcName);
    if (!existsSync(input)) {
      throw new Error(`Missing source: ${input}`);
    }
    const staging = path.join(outDir, destName.replace(/\.webp$/, ".png"));
    copyFileSync(input, staging);
    const output = path.join(outDir, destName);
    const info = await sharp(staging)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(output);
    console.log(`${destName}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}kb`);
    unlinkSync(staging);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
