import { ProductCatalogKind, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CatalogProduct } from "@/lib/commerce/products";

/** Clinical SKUs that are accessory supplies, shown as retail on /shop. */
const CLINICAL_SUPPLY_TO_RETAIL_SLUG: Record<string, string> = {
  "bac-water-10ml-wg61zj": "bac-water-10ml",
  "pen-tips-box-of-100-eg9k52": "pen-tips",
  "pen-tips-and-alcohol-pad-kit-20-count-1x063c": "pen-tips-alcohol-pad-kit",
  "insulin-syringe-kit-1ml-x-31g-x-8mm-box-of-10-q0qlao": "insulin-syringes",
  "insulin-syringe-kit-1ml-x-31g-x-8mm-box-of-20-p36ytc": "insulin-syringes",
  "insulin-syringe-1ml-x-31g-x-8mm-box-of-100-individually-wrap-9hnv6k": "insulin-syringes",
  "alcohol-pads-box-of-100-4k37qu": "alcohol-pads",
  "alcohol-pads-box-of-200-56t2c0": "alcohol-pads",
  "alcohol-wipes-bl1s7o": "alcohol-pads",
};

const SUPPLY_TITLE_RE =
  /^(bac water|sterile water|pen tips|insulin syringe|alcohol pad|alcohol wipe)/i;

/** Shop path for accessory supplies; null means this clinical SKU is a compound (Hub). */
export function getRetailPathForClinicalSupply(slug: string, title?: string, category?: string | null) {
  const mapped = CLINICAL_SUPPLY_TO_RETAIL_SLUG[slug];
  if (mapped) return `/shop/${mapped}`;
  if (category?.trim() === "Sterile Water") return "/shop/bac-water-10ml";
  if (title && SUPPLY_TITLE_RE.test(title.trim())) return "/shop";
  return null;
}

const FALLBACK_IMAGE = "/images/facial-treatments.webp";

export type ClinicalShopProduct = CatalogProduct & {
  isClinical: true;
  isPrescription?: boolean;
  form?: string | null;
  strength?: string | null;
};

function toShopProduct(row: {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  description: string | null;
  featuredImage: string | null;
  isPrescription: boolean;
  form: string | null;
  strength: string | null;
}): ClinicalShopProduct {
  const meta = [row.form, row.strength].filter(Boolean).join(" · ");
  return {
    id: row.id,
    slug: row.slug,
    name: row.title,
    category: row.category?.trim() || "Peptides",
    price: 0,
    image: row.featuredImage || FALLBACK_IMAGE,
    summary: meta || undefined,
    description: row.description || undefined,
    isClinical: true,
    isPrescription: row.isPrescription,
    form: row.form,
    strength: row.strength,
  };
}

/** ACTIVE clinical catalog for physicians and admin. Never shown on the consumer shop. */
export async function listClinicalShopProducts(): Promise<ClinicalShopProduct[]> {
  const rows = await prisma.product.findMany({
    where: {
      catalogKind: ProductCatalogKind.CLINICAL,
      status: ProductStatus.ACTIVE,
    },
    orderBy: [{ category: "asc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      description: true,
      featuredImage: true,
      isPrescription: true,
      form: true,
      strength: true,
    },
  });
  return rows.map(toShopProduct);
}

export async function getClinicalShopProductBySlug(
  slug: string,
): Promise<ClinicalShopProduct | null> {
  const row = await prisma.product.findFirst({
    where: {
      slug,
      catalogKind: ProductCatalogKind.CLINICAL,
      status: ProductStatus.ACTIVE,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      description: true,
      featuredImage: true,
      isPrescription: true,
      form: true,
      strength: true,
    },
  });
  return row ? toShopProduct(row) : null;
}

export function clinicalShopCategories(products: ClinicalShopProduct[]) {
  return Array.from(new Set(products.map((p) => p.category))).sort((a, b) => a.localeCompare(b));
}
