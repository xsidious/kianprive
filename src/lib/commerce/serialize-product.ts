import type { Product, ProductVariant } from "@prisma/client";

export function asMoney(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function serializeAdminProduct<
  T extends Product & { variants?: ProductVariant[]; collection?: unknown },
>(product: T) {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : null,
    wholesalePrice: product.wholesalePrice != null ? Number(product.wholesalePrice) : null,
    variants: product.variants?.map((variant) => ({
      ...variant,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice != null ? Number(variant.compareAtPrice) : null,
    })),
  };
}
