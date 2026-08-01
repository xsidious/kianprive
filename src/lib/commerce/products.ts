export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  redirectUrl?: string;
};

export const shopCategories = [
  "All",
  "Korean Skincare",
  "Skincare",
  "Hair Care",
  "Body Care",
  "Nutrients",
  "Professional",
] as const;

/** Client catalog — `id` and `slug` match seeded Prisma product slugs for reliable cart sync. */
export const catalogProducts: CatalogProduct[] = [
  {
    id: "exosomes",
    slug: "korean-skincare",
    name: "Korean Skincare",
    category: "Korean Skincare",
    price: 0,
    image: "/images/facial-treatments.webp",
  },
  {
    id: "kian-toner",
    slug: "kian-toner",
    name: "KIAN Toner",
    category: "Skincare",
    price: 0,
    image: "/images/facial-treatments.webp",
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
    category: "Hair Care",
    price: 0,
    image: "/images/hairrestoration.jpeg",
  },
  {
    id: "hair-serum",
    slug: "hair-serum",
    name: "Hair Serum",
    category: "Hair Care",
    price: 22,
    image: "/images/HairReatorationpicture.jpeg",
  },
  {
    id: "shampoo",
    slug: "shampoo",
    name: "Shampoo",
    category: "Hair Care",
    price: 15.5,
    image: "/images/hairrestoration.jpeg",
  },
  {
    id: "conditioner",
    slug: "conditioner",
    name: "Conditioner",
    category: "Hair Care",
    price: 15.5,
    image: "/images/hairrestoration.jpeg",
  },
  {
    id: "co-wash-and-go",
    slug: "co-wash-and-go",
    name: "Co-Wash and Go",
    category: "Hair Care",
    price: 15.5,
    image: "/images/hairrestoration.jpeg",
  },
  {
    id: "body-wash",
    slug: "body-wash",
    name: "Body Wash",
    category: "Body Care",
    price: 2,
    image: "/images/esthetics.avif",
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
    image: "/images/facial-treatments.webp",
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
  if (slugOrId === "exosomes") {
    return catalogProducts.find((product) => product.id === "exosomes") ?? null;
  }
  return catalogProducts.find((product) => product.id === slugOrId || product.slug === slugOrId) ?? null;
}
