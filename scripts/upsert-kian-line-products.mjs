/**
 * Upsert KIAN retail line products (photos, titles, known prices).
 * Does not overwrite toner cost / batch inventory.
 *
 * Usage: node scripts/upsert-kian-line-products.mjs
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

const products = [
  {
    slug: "kian-toner",
    title: "KIAN Toner",
    sku: "KIAN-TONER",
    category: "Skincare",
    price: 20,
    image: "/images/products/kian-toner.webp",
    description:
      "KIAN Toner is a balancing and hydrating finish after cleanse — a light daily step that helps rebalance the complexion and ready skin for serums and oils.",
    keepInventory: true,
  },
  {
    slug: "kian-toner-4oz",
    title: "KIAN Toner — 4 ounce",
    sku: "KIAN-TONER-4OZ",
    category: "Skincare",
    price: 20,
    image: "/images/products/kian-toner.webp",
    description: "Balancing and hydrating toner. 4 fl oz / 120 ml.",
    keepInventory: true,
  },
  {
    slug: "kian-toner-8oz",
    title: "KIAN Toner — 8 ounce",
    sku: "KIAN-TONER-8OZ",
    category: "Skincare",
    price: 38,
    image: "/images/products/kian-toner.webp",
    description: "Balancing and hydrating toner. 8 fl oz.",
    keepInventory: true,
  },
  {
    slug: "hair-serum",
    title: "KIAN Hair Serum",
    sku: "KIAN-HAIR-SERUM-4OZ",
    category: "Hair Care",
    price: 22,
    image: "/images/products/kian-hair-serum.webp",
    description: "Nourish • Repair • Strengthen. 4 fl oz / 120 ml dropper.",
  },
  {
    slug: "soap",
    title: "KIAN Natural Soap",
    sku: "KIAN-NATURAL-SOAP-5OZ",
    category: "Skincare",
    price: 0,
    image: "/images/products/kian-natural-soap.webp",
    description: "Cleanse • Nourish • Soothe. 5 oz / 140 g bar.",
  },
  {
    slug: "hair-mask",
    title: "KIAN Hair Mask",
    sku: "KIAN-HAIR-MASK-8OZ",
    category: "Hair Care",
    price: 0,
    image: "/images/products/kian-hair-mask.webp",
    description: "Nourish • Repair • Strengthen. Deep conditioning for all hair types. 8.45 fl oz / 250 ml.",
  },
  {
    slug: "kian-anti-aging-facial-oil",
    title: "KIAN Anti Aging Facial Oil",
    sku: "KIAN-FACIAL-OIL-2OZ",
    category: "Skincare",
    price: 0,
    image: "/images/products/kian-anti-aging-facial-oil.webp",
    description: "Restore • Rejuvenate • Renew. 2 fl oz / 60 ml dropper.",
  },
  {
    slug: "kian-body-oil",
    title: "KIAN Body Oil",
    sku: "KIAN-BODY-OIL-8OZ",
    category: "Body Care",
    price: 0,
    image: "/images/products/kian-body-oil.webp",
    description: "Nourish • Hydrate • Glow. 8 fl oz / 240 ml pump.",
  },
  {
    slug: "kian-body-lotion",
    title: "KIAN Body Lotion",
    sku: "KIAN-BODY-LOTION-8OZ",
    category: "Body Care",
    price: 0,
    image: "/images/products/kian-body-lotion.webp",
    description: "Nourish • Hydrate • Soften. 8 fl oz / 240 ml pump.",
  },
  {
    slug: "kian-hand-sanitizer",
    title: "KIAN Hand Sanitizer",
    sku: "KIAN-HAND-SANITIZER-2OZ",
    category: "Body Care",
    price: 0,
    image: "/images/products/kian-hand-sanitizer.webp",
    description: "Cleanse • Protect • Refresh. 2 fl oz / 60 ml spray.",
  },
  {
    slug: "kian-scar-oil",
    title: "KIAN Scar Oil",
    sku: "KIAN-SCAR-OIL-2OZ",
    category: "Skincare",
    price: 0,
    image: "/images/products/kian-scar-oil.webp",
    description: "Repair • Restore • Renew. 2 fl oz / 60 ml dropper.",
  },
  {
    slug: "kian-serenity-room-spray",
    title: "KIAN Serenity Room Spray",
    sku: "KIAN-SERENITY-8OZ",
    category: "Home",
    price: 0,
    image: "/images/products/kian-serenity-room-spray.webp",
    description: "Calm • Refresh • Uplift. 8 fl oz / 240 ml room spray.",
  },
  {
    slug: "kian-bliss-room-spray",
    title: "KIAN Bliss Room Spray",
    sku: "KIAN-BLISS-8OZ",
    category: "Home",
    price: 0,
    image: "/images/products/kian-bliss-room-spray.webp",
    description: "Calm • Refresh • Uplift. 8 fl oz / 240 ml room spray.",
  },
];

async function main() {
  for (const row of products) {
    const existing = await prisma.product.findUnique({ where: { slug: row.slug } });
    const skuTaken =
      row.sku &&
      (await prisma.product.findFirst({
        where: { sku: row.sku, NOT: existing ? { id: existing.id } : undefined },
        select: { id: true },
      }));

    const data = {
      title: row.title,
      description: row.description,
      status: ProductStatus.ACTIVE,
      category: row.category,
      catalogKind: ProductCatalogKind.RETAIL,
      isPrescription: false,
      price: row.price,
      featuredImage: row.image,
      sku: skuTaken ? existing?.sku ?? null : row.sku,
    };

    const product = await prisma.product.upsert({
      where: { slug: row.slug },
      update: data,
      create: {
        slug: row.slug,
        ...data,
        inventoryQty: 0,
        trackInventory: Boolean(row.keepInventory),
        currency: "USD",
      },
    });
    const retail = Number(product.price);
    console.log(
      `${product.slug.padEnd(32)} ${retail > 0 ? `$${retail.toFixed(2)}` : "unpriced"}  ${product.featuredImage}`,
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
