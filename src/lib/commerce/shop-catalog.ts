import { ProductCatalogKind, ProductStatus, type Product, type ProductVariant } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  catalogProducts,
  getCatalogProduct,
  type CatalogProduct,
  type CatalogProductOption,
} from "@/lib/commerce/products";

const FALLBACK_IMAGE = "/images/facial-treatments.webp";

type DbProduct = Product & { variants: ProductVariant[] };

function money(value: unknown) {
  return Number(value ?? 0);
}

function catalogKeySet() {
  const keys = new Set<string>();
  for (const product of catalogProducts) {
    keys.add(product.slug);
    keys.add(product.id);
    for (const option of product.options ?? []) keys.add(option.id);
  }
  return keys;
}

function dbRowToCatalog(row: DbProduct, catalog?: CatalogProduct | null): CatalogProduct {
  const variantOptions: CatalogProductOption[] | undefined =
    row.hasVariants && row.variants.length
      ? row.variants.map((variant) => ({
          id: variant.sku || variant.id,
          label: variant.title,
          price: money(variant.price),
        }))
      : undefined;

  return {
    id: catalog?.id ?? row.slug,
    slug: row.slug,
    name: row.title,
    category: row.category?.trim() || catalog?.category || "General",
    price: money(row.price),
    image: row.featuredImage || catalog?.image || FALLBACK_IMAGE,
    summary: catalog?.summary,
    description: row.description || catalog?.description,
    redirectUrl: catalog?.redirectUrl,
    options: variantOptions ?? catalog?.options,
  };
}

function overlayCatalogWithDb(catalog: CatalogProduct, bySlug: Map<string, DbProduct>): CatalogProduct {
  const row = bySlug.get(catalog.slug) ?? bySlug.get(catalog.id);
  const options = catalog.options?.map((opt) => {
    const optionRow = bySlug.get(opt.id);
    if (optionRow) {
      return { ...opt, price: money(optionRow.price), label: optionRow.title || opt.label };
    }
    const variant = row?.variants.find((entry) => entry.title === opt.label || entry.sku === opt.id);
    if (variant) return { ...opt, price: money(variant.price) };
    return opt;
  });

  if (!row) return { ...catalog, options };

  const fromDb = dbRowToCatalog(row, catalog);
  return {
    ...fromDb,
    id: catalog.id,
    slug: catalog.slug,
    redirectUrl: catalog.redirectUrl,
    summary: catalog.summary ?? fromDb.summary,
    options: fromDb.options ?? options,
  };
}

/** Live shop catalog: static merchandising plus admin-saved prices and copy. */
export async function listShopCatalogProducts(): Promise<CatalogProduct[]> {
  const rows = await prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE, catalogKind: ProductCatalogKind.RETAIL },
    include: { variants: { orderBy: { createdAt: "asc" } } },
  });
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  const catalogKeys = catalogKeySet();

  const listed = catalogProducts.map((product) => overlayCatalogWithDb(product, bySlug));
  const extras = rows
    .filter(
      (row) =>
        !catalogKeys.has(row.slug) &&
        !catalogKeys.has(row.id) &&
        row.slug !== "payment-test-1" &&
        !/payment test/i.test(row.title),
    )
    .map((row) => dbRowToCatalog(row, getCatalogProduct(row.slug)));

  return [...listed, ...extras];
}

export async function getShopCatalogProduct(slugOrId: string): Promise<CatalogProduct | null> {
  const products = await listShopCatalogProducts();
  return products.find((product) => product.slug === slugOrId || product.id === slugOrId) ?? null;
}
