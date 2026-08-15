/**
 * Upsert KIAN Toner size SKUs into the live retail catalog.
 *
 * Usage: node scripts/upsert-kian-toner.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient, ProductCatalogKind, ProductStatus } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  for (const file of [".env", ".env.local"]) {
    const full = path.join(__dirname, "..", file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const prisma = new PrismaClient();

const description =
  "KIAN Toner is a daily finishing step after cleanse — a light, clarifying mist that helps rebalance the skin, restore hydration, and ready the complexion for serums and oils.\n\nUse morning and evening: sweep or mist over clean skin, then follow with facial oil or moisturizer. Choose 4 oz for travel and first rituals, or 8 oz for everyday use at home.";

const products = [
  {
    slug: "kian-toner",
    title: "KIAN Toner",
    sku: "KIAN-TONER",
    price: 20,
    wholesalePrice: null,
    inventoryQty: 0,
    trackInventory: false,
  },
  {
    slug: "kian-toner-4oz",
    title: "KIAN Toner — 4 ounce",
    sku: "KIAN-TONER-4OZ",
    price: 20,
    wholesalePrice: 3.42,
    inventoryQty: 27,
    trackInventory: true,
  },
  {
    slug: "kian-toner-8oz",
    title: "KIAN Toner — 8 ounce",
    sku: "KIAN-TONER-8OZ",
    price: 38,
    wholesalePrice: 10.28,
    inventoryQty: 13,
    trackInventory: true,
  },
];

async function main() {
  for (const row of products) {
    const product = await prisma.product.upsert({
      where: { slug: row.slug },
      update: {
        title: row.title,
        description,
        status: ProductStatus.ACTIVE,
        category: "Skincare",
        catalogKind: ProductCatalogKind.RETAIL,
        isPrescription: false,
        price: row.price,
        wholesalePrice: row.wholesalePrice,
        featuredImage: "/images/facial-treatments.webp",
        inventoryQty: row.inventoryQty,
        trackInventory: row.trackInventory,
        sku: row.sku,
      },
      create: {
        slug: row.slug,
        title: row.title,
        description,
        status: ProductStatus.ACTIVE,
        category: "Skincare",
        catalogKind: ProductCatalogKind.RETAIL,
        isPrescription: false,
        price: row.price,
        wholesalePrice: row.wholesalePrice,
        featuredImage: "/images/facial-treatments.webp",
        inventoryQty: row.inventoryQty,
        trackInventory: row.trackInventory,
        sku: row.sku,
        currency: "USD",
      },
    });
    const cost = product.wholesalePrice != null ? Number(product.wholesalePrice) : null;
    const retail = Number(product.price);
    const profit = cost != null ? (retail - cost).toFixed(2) : "n/a";
    console.log(
      `${product.sku}  retail $${retail.toFixed(2)}  cost ${cost != null ? `$${cost.toFixed(2)}` : "—"}  profit $${profit}  qty ${product.inventoryQty}  (${product.slug})`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
