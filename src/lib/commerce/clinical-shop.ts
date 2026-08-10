import { ProductCatalogKind, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CatalogProduct } from "@/lib/commerce/products";

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

/** ACTIVE clinical catalog for shop — logged-in members only; no prices. */
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
