export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
};

/** Client catalog — `id` and `slug` match seeded Prisma product slugs for reliable cart sync. */
export const catalogProducts: CatalogProduct[] = [
  {
    id: "lymphatic-support-serum",
    slug: "lymphatic-support-serum",
    name: "Lymphatic Support Serum",
    category: "Skincare",
    price: 129,
    image: "/images/facial-treatments.jpg",
  },
  {
    id: "daily-recovery-electrolyte-blend",
    slug: "daily-recovery-electrolyte-blend",
    name: "Daily Recovery Electrolyte Blend",
    category: "Nutrition",
    price: 59,
    image: "/images/beauty.avif",
  },
  {
    id: "collagen-renewal-capsules",
    slug: "collagen-renewal-capsules",
    name: "Collagen Renewal Capsules",
    category: "Supplements",
    price: 89,
    image: "/images/esthetics.avif",
  },
  {
    id: "night-repair-facial-oil",
    slug: "night-repair-facial-oil",
    name: "Night Repair Facial Oil",
    category: "Skincare",
    price: 98,
    image: "/images/facial-treatments.jpg",
  },
  {
    id: "metabolic-support-protein",
    slug: "metabolic-support-protein",
    name: "Metabolic Support Protein",
    category: "Nutrition",
    price: 72,
    image: "/images/nutrition.avif",
  },
  {
    id: "advanced-beauty-essentials-kit",
    slug: "advanced-beauty-essentials-kit",
    name: "Advanced Beauty Essentials Kit",
    category: "Beauty",
    price: 149,
    image: "/images/wellness.avif",
  },
];

export function getCatalogProduct(slugOrId: string) {
  return catalogProducts.find((product) => product.id === slugOrId || product.slug === slugOrId) ?? null;
}
