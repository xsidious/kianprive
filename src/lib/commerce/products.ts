export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  redirectUrl?: string;
};

/** Client catalog — `id` and `slug` match seeded Prisma product slugs for reliable cart sync. */
export const catalogProducts: CatalogProduct[] = [
  {
    id: "exosomes",
    slug: "exosomes",
    name: "Exosomes",
    category: "Skincare",
    price: 0,
    image: "/images/facial-treatments.jpg",
  },
  {
    id: "kian-toner",
    slug: "kian-toner",
    name: "KIAN Toner",
    category: "Skincare",
    price: 0,
    image: "/images/facial-treatments.jpg",
  },
  {
    id: "soap",
    slug: "soap",
    name: "Soap",
    category: "Skincare",
    price: 0,
    image: "/images/esthetics.avif",
  },
  {
    id: "hair-mask",
    slug: "hair-mask",
    name: "Hair Mask",
    category: "Skincare",
    price: 0,
    image: "/images/hairrestoration.jpeg",
  },
  {
    id: "hair-serum",
    slug: "hair-serum",
    name: "Hair Serum",
    category: "Skincare",
    price: 0,
    image: "/images/HairReatorationpicture.jpeg",
  },
  {
    id: "kian-anti-aging-facial-oil",
    slug: "kian-anti-aging-facial-oil",
    name: "KIAN Anti Aging Facial Oil",
    category: "Skincare",
    price: 0,
    image: "/images/esthetics.avif",
  },
  {
    id: "kian-body-oil",
    slug: "kian-body-oil",
    name: "KIAN Body Oil",
    category: "Skincare",
    price: 0,
    image: "/images/facial-treatments.jpg",
  },
  {
    id: "moringa-capsules",
    slug: "moringa-capsules",
    name: "Moringa Capsules",
    category: "Nutrients",
    price: 0,
    image: "/images/nutrition.avif",
  },
  {
    id: "moringa-powder",
    slug: "moringa-powder",
    name: "Moringa Powder",
    category: "Nutrients",
    price: 0,
    image: "/images/nutrition.avif",
  },
  {
    id: "agara-coffee",
    slug: "agara-coffee",
    name: "Agara Coffee",
    category: "Nutrients",
    price: 0,
    image: "/images/beauty.avif",
    redirectUrl: "https://shop.kianprive.com/r/NRM2TY",
  },
  {
    id: "professional-distribution",
    slug: "professional-distribution",
    name: "Professional",
    category: "Professional",
    price: 0,
    image: "/images/wellness.avif",
    redirectUrl: "https://wellnesstechbiodistribution.com/",
  },
];

export function getCatalogProduct(slugOrId: string) {
  return catalogProducts.find((product) => product.id === slugOrId || product.slug === slugOrId) ?? null;
}
