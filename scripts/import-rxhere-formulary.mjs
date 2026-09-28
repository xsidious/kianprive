/**
 * Import RxHere compounding formulary into clinical catalog + vendor offers.
 *
 * Usage:
 *   node scripts/import-rxhere-formulary.mjs
 *   node scripts/import-rxhere-formulary.mjs path/to/rxhere-formulary.json
 *
 * Creates/updates:
 *   - Vendor "RxHere" (PO email from RXHERE_VENDOR_EMAIL or info@rxhere.com)
 *   - CLINICAL Product rows (source=RXHERE, externalId=rxhere:<SKU>)
 *   - ProductVendorOffer with formulary wholesale unit cost
 *
 * Applies GLP naming policy: Semaglutide→GLP 1, Tirzepatide→GLP 2, Retatrutide→GLP 3
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_JSON = resolve("scripts/data/rxhere-formulary.json");

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 52);
}

/** Replace pharma brand/generic names with generic GLP labels (do not touch Semax). */
function applyGlpNaming(text) {
  if (!text) return text;
  return String(text)
    .replace(/Trizapatide/gi, "GLP 2")
    .replace(/Tirzepatide/gi, "GLP 2")
    .replace(/Semaglutide/gi, "GLP 1")
    .replace(/Retatrutide/gi, "GLP 3")
    .replace(/GLP-2T\s+GLP 2/gi, "GLP-2T")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function money(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function buildTitle(row) {
  const med = applyGlpNaming(row.medication);
  const parts = [med];
  if (row.strength) parts.push(row.strength);
  if (row.size) parts.push(`(${row.size})`);
  if (row.total) parts.push(`· ${row.total}`);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function buildDescription(row) {
  const bits = [];
  if (row.description) bits.push(applyGlpNaming(row.description));
  const meta = [
    row.form ? `Form: ${row.form}` : null,
    row.strength ? `Strength: ${row.strength}` : null,
    row.size ? `Size: ${row.size}` : null,
    row.total ? `Total: ${row.total}` : null,
    `Vendor SKU: ${row.sku}`,
    "Source: RxHere 503A compounding pharmacy (rxhere.com).",
  ].filter(Boolean);
  bits.push(meta.join(" · "));
  return bits.join("\n\n");
}

async function ensureRxHereVendor() {
  const email = (process.env.RXHERE_VENDOR_EMAIL || "info@rxhere.com").trim();
  const name = (process.env.RXHERE_VENDOR_NAME || "RxHere").trim();
  const phone = (process.env.RXHERE_VENDOR_PHONE || "(848) 379-4373").trim();
  const contactName = process.env.RXHERE_VENDOR_CONTACT?.trim() || "RxHere Orders";

  const existing = await prisma.vendor.findFirst({
    where: {
      OR: [
        { email: { equals: email, mode: "insensitive" } },
        { name: { equals: name, mode: "insensitive" } },
      ],
    },
  });

  const notes =
    "RxHere 503A compounding pharmacy — Q3 2026 formulary. Licensed in all 50 states. Volume partner discounts may apply. PO via email after patient payment settles. Site: rxhere.com";

  if (existing) {
    return prisma.vendor.update({
      where: { id: existing.id },
      data: {
        name,
        email: existing.email || email,
        phone: existing.phone || phone,
        contactName: existing.contactName || contactName,
        paymentMethod: existing.paymentMethod || "ACH",
        notes: existing.notes?.includes("RxHere") ? existing.notes : notes,
      },
    });
  }

  return prisma.vendor.create({
    data: {
      name,
      email,
      phone,
      contactName,
      paymentMethod: "ACH",
      notes,
    },
  });
}

async function main() {
  const jsonPath = resolve(process.argv[2] || DEFAULT_JSON);
  const rows = JSON.parse(readFileSync(jsonPath, "utf8"));
  if (!Array.isArray(rows) || !rows.length) {
    throw new Error(`No formulary rows in ${jsonPath}`);
  }

  const vendor = await ensureRxHereVendor();
  console.log(`Vendor: ${vendor.name} (${vendor.id}) · ${vendor.email}`);
  console.log(`Importing ${rows.length} RxHere SKUs from ${jsonPath}`);

  let upserted = 0;
  let offers = 0;
  let skipped = 0;

  for (const row of rows) {
    const vendorSku = String(row.sku || "").trim();
    if (!vendorSku || !row.medication) {
      skipped += 1;
      continue;
    }

    const externalId = `rxhere:${vendorSku}`;
    const title = buildTitle(row);
    const slug = `rxhere-${slugify(vendorSku)}`.slice(0, 70);
    const productSku = `RXH-${vendorSku}`.slice(0, 64);
    const wholesale = money(row.price);
    const category = applyGlpNaming(row.category) || "Compounded";
    const description = buildDescription(row);
    const strength = [row.strength, row.size].filter(Boolean).join(" · ") || null;
    const form = row.form || null;

    const product = await prisma.product.upsert({
      where: { externalId },
      create: {
        externalId,
        slug,
        title,
        description,
        category,
        form,
        strength,
        deliveryMethod: form,
        source: "RXHERE",
        catalogKind: "CLINICAL",
        isPrescription: true,
        wholesalePrice: wholesale || null,
        price: 0,
        sku: productSku,
        status: "ACTIVE",
        inventoryQty: 100,
        trackInventory: false,
        vendorId: vendor.id,
      },
      update: {
        title,
        description,
        category,
        form,
        strength,
        deliveryMethod: form,
        source: "RXHERE",
        catalogKind: "CLINICAL",
        isPrescription: true,
        wholesalePrice: wholesale || null,
        sku: productSku,
        status: "ACTIVE",
        vendorId: vendor.id,
      },
    });

    await prisma.productVendorOffer.upsert({
      where: {
        productId_vendorId: { productId: product.id, vendorId: vendor.id },
      },
      create: {
        productId: product.id,
        vendorId: vendor.id,
        unitCost: wholesale,
        shippingCost: 0,
        vendorSku,
        notes: "Imported from RxHere Q3 2026 formulary",
      },
      update: {
        unitCost: wholesale,
        shippingCost: 0,
        vendorSku,
        notes: "Imported from RxHere Q3 2026 formulary",
      },
    });

    upserted += 1;
    offers += 1;
    if (upserted % 50 === 0) console.log(`… ${upserted}/${rows.length}`);
  }

  console.log(`Done. Products upserted: ${upserted}, offers: ${offers}, skipped: ${skipped}`);
  console.log("Retail/clinic price left at $0 — set patient prices in Admin → Prescriptions / Pricing.");
  console.log("After therapy payment, POs email to the RxHere vendor when WELLNESS_TECH_AUTO_EMAIL_PO is enabled.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
