import { ProductCatalogKind, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CatalogProduct } from "@/lib/commerce/products";
import { getRetailPathForClinicalSupply } from "@/lib/commerce/clinical-shop";
import { PEPTIDES_MEMBER_CATEGORY } from "@/lib/commerce/peptide-orders";

const FALLBACK_IMAGE = "/images/facial-treatments.webp";

/** Clinical peptide compounds for approved members. Supplies stay in the retail shop. */
export async function listMemberPeptideProducts(): Promise<CatalogProduct[]> {
  const rows = await prisma.product.findMany({
    where: {
      catalogKind: ProductCatalogKind.CLINICAL,
      status: ProductStatus.ACTIVE,
      category: { contains: "peptide", mode: "insensitive" },
    },
    orderBy: [{ title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      description: true,
      featuredImage: true,
      price: true,
      form: true,
      strength: true,
    },
  });

  return rows
    .filter((row) => !getRetailPathForClinicalSupply(row.slug, row.title, row.category))
    .map((row) => {
      const image = row.featuredImage?.startsWith("/") ? row.featuredImage : FALLBACK_IMAGE;
      const summary = [row.form, row.strength, row.category].filter(Boolean).join(" · ");
      return {
        id: row.id,
        slug: row.slug,
        name: row.title,
        category: PEPTIDES_MEMBER_CATEGORY,
        price: Number(row.price),
        image,
        summary: summary || undefined,
        description: row.description || undefined,
        membershipOnly: true,
      };
    });
}
