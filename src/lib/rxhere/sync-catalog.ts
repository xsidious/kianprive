import { prisma } from "@/lib/prisma";
import {
  absoluteAssetUrl,
  fetchAllCatalog,
  fetchPricedCatalogPage,
  rxhereConfigured,
  type RxHereCatalogProduct,
} from "@/lib/rxhere/client";

const PATIENT_MARKUP = 2;

function money(centsOrDollars: number, fromCents = false) {
  const n = fromCents ? centsOrDollars / 100 : centsOrDollars;
  return Math.round(n * 100) / 100;
}

function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 52);
}

/** Replace pharma names with generic GLP labels (do not touch Semax). */
export function applyGlpNaming(text: string | null | undefined) {
  if (!text) return text || "";
  return String(text)
    .replace(/Trizapatide/gi, "GLP 2")
    .replace(/Tirzepatide/gi, "GLP 2")
    .replace(/Semaglutide/gi, "GLP 1")
    .replace(/Retatrutide/gi, "GLP 3")
    .replace(/GLP-2T\s+GLP 2/gi, "GLP-2T")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function ensureRxHereVendor() {
  const email = (process.env.RXHERE_VENDOR_EMAIL || "fulfillment@thewellnesstech.com").trim();
  const name = (process.env.RXHERE_VENDOR_NAME || "Compounding Pharmacy").trim();
  const phone = (process.env.RXHERE_VENDOR_PHONE || "").trim() || null;
  const contactName = process.env.RXHERE_VENDOR_CONTACT?.trim() || "Pharmacy Orders";

  const existing = await prisma.vendor.findFirst({
    where: {
      OR: [
        { email: { equals: email, mode: "insensitive" } },
        { name: { equals: name, mode: "insensitive" } },
        { name: { equals: "RxHere", mode: "insensitive" } },
      ],
    },
  });

  const notes =
    "Live Rx Here formulary sync. Licensed compounding. Orders flow KIAN → Wellness Tech → Rx Here.";

  if (existing) {
    return prisma.vendor.update({
      where: { id: existing.id },
      data: {
        name,
        email: existing.email || email,
        phone: existing.phone || phone,
        contactName: existing.contactName || contactName,
        paymentMethod: existing.paymentMethod || "ACH",
        notes,
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

async function priceMapFromVitaRelay() {
  const map = new Map<string, number>();
  let page = 1;
  while (page <= 20) {
    const result = await fetchPricedCatalogPage(100, page);
    if (!result.ok) break;
    const payload = result.data as { data?: RxHereCatalogProduct[]; total?: number };
    const rows = Array.isArray(payload.data) ? payload.data : [];
    for (const row of rows) {
      if (row.id && typeof row.price_cents === "number") {
        map.set(row.id, money(row.price_cents, true));
      }
    }
    const total = payload.total ?? rows.length;
    if (!rows.length || map.size >= total) break;
    page += 1;
  }
  return map;
}

function productTitle(row: RxHereCatalogProduct) {
  const name = applyGlpNaming(row.name);
  const strength = (row.strengths || []).filter(Boolean).join(" / ");
  const volume = row.volume?.trim();
  return [name, strength || null, volume ? `(${volume})` : null].filter(Boolean).join(" · ");
}

function productDescription(row: RxHereCatalogProduct) {
  const bits: string[] = [];
  if (row.description) bits.push(applyGlpNaming(row.description));
  const meta = [
    row.type ? `Type: ${row.type}` : null,
    row.dosage_form ? `Form: ${row.dosage_form}` : null,
    row.strengths?.length ? `Strength: ${row.strengths.join(", ")}` : null,
    row.volume ? `Volume: ${row.volume}` : null,
    row.controlled_substance ? "Controlled substance" : null,
    `Rx Here id: ${row.id}`,
  ].filter(Boolean);
  bits.push(meta.join(" · "));
  return bits.join("\n\n");
}

export async function syncRxHereCatalog(options?: { activateNew?: boolean }) {
  if (!rxhereConfigured()) {
    return { ok: false as const, error: "RXHERE_API_KEY is not configured on this environment." };
  }

  const catalog = await fetchAllCatalog();
  if (!catalog.ok) return { ok: false as const, error: catalog.error };

  const vendor = await ensureRxHereVendor();
  const prices = await priceMapFromVitaRelay();
  const activateNew = options?.activateNew !== false;

  let created = 0;
  let updated = 0;
  let offers = 0;
  let skipped = 0;

  for (const row of catalog.products) {
    if (!row.id || !row.name) {
      skipped += 1;
      continue;
    }

    const externalId = `rxhere:${row.id}`;
    const vendorSku = row.id;
    const title = productTitle(row);
    const slugBase = row.slug || row.id;
    const slug = `rxhere-${slugify(slugBase)}`.slice(0, 70);
    const isRx = Boolean(row.requires_prescription) || row.type === "503a";
    const catalogKind = row.type === "rnd" && !isRx ? "RETAIL" : "CLINICAL";
    const category = applyGlpNaming(row.category_label || row.category || "Compounded") || "Compounded";
    const form = row.dosage_form || null;
    const strength = [...(row.strengths || []), row.volume].filter(Boolean).join(" · ") || null;
    const featuredImage = absoluteAssetUrl(row.image_urls?.[0]);
    const wholesale = prices.get(row.id) ?? null;
    const sellPrice = wholesale != null ? money(wholesale * PATIENT_MARKUP) : null;

    const existing = await prisma.product.findUnique({ where: { externalId } });

    const product = await prisma.product.upsert({
      where: { externalId },
      create: {
        externalId,
        slug,
        title,
        description: productDescription(row),
        category,
        form,
        strength,
        deliveryMethod: form,
        source: "RXHERE",
        catalogKind,
        isPrescription: isRx,
        wholesalePrice: wholesale,
        price: sellPrice ?? 0,
        featuredImage,
        sku: vendorSku.slice(0, 64),
        status: activateNew ? "ACTIVE" : "DRAFT",
        inventoryQty: 100,
        trackInventory: false,
        vendorId: vendor.id,
      },
      update: {
        title,
        description: productDescription(row),
        category,
        form,
        strength,
        deliveryMethod: form,
        source: "RXHERE",
        catalogKind,
        isPrescription: isRx,
        ...(wholesale != null ? { wholesalePrice: wholesale, price: sellPrice ?? undefined } : {}),
        ...(featuredImage ? { featuredImage } : {}),
        sku: vendorSku.slice(0, 64),
        vendorId: vendor.id,
        // Keep ACTIVE products active; don't force DRAFT back to ACTIVE if archived intentionally
        ...(existing?.status === "ARCHIVED" ? {} : { status: existing?.status === "DRAFT" && !activateNew ? "DRAFT" : "ACTIVE" }),
      },
    });

    if (existing) updated += 1;
    else created += 1;

    await prisma.productVendorOffer.upsert({
      where: {
        productId_vendorId: { productId: product.id, vendorId: vendor.id },
      },
      create: {
        productId: product.id,
        vendorId: vendor.id,
        unitCost: wholesale ?? 0,
        shippingCost: 0,
        vendorSku,
        notes: `Live sync · type=${row.type || "unknown"}`,
      },
      update: {
        ...(wholesale != null ? { unitCost: wholesale } : {}),
        vendorSku,
        notes: `Live sync · type=${row.type || "unknown"}`,
      },
    });
    offers += 1;
  }

  return {
    ok: true as const,
    totalRemote: catalog.total,
    created,
    updated,
    offers,
    skipped,
    priced: prices.size,
    vendorId: vendor.id,
  };
}
