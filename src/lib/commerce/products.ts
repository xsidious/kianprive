export type CatalogProductOption = {
  id: string;
  label: string;
  price: number;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  /** Short line for cards / SEO */
  summary?: string;
  /** Full product-page copy */
  description?: string;
  redirectUrl?: string;
  /** Size / kit options — cart uses each option `id` as the product id. */
  options?: CatalogProductOption[];
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
    price: 35,
    image: "/images/moringa-capsules.png",
    summary: "90 capsules of nutrient-dense Moringa oleifera leaf — daily wellness made simple.",
    description:
      "Moringa oleifera — often called the “miracle tree” — is prized for its concentrated nutrition. Our Moringa Capsules deliver pure leaf powder in an easy daily format: 90 capsules for consistent support on the go.\n\nEach serving draws on the plant’s rich profile of vitamins A, C, and B-complex nutrients, plus minerals such as magnesium and iron. Moringa leaves are also known for antioxidants like quercetin and chlorogenic acid, which help the body manage oxidative stress and are studied for roles in supporting healthy blood pressure and blood-sugar balance.\n\nResearch continues to explore moringa’s broader wellness potential — including anti-inflammatory support that may ease everyday discomfort, compounds investigated for cellular health, and benefits for insulin sensitivity. Capsules are ideal when you want the benefits of this nutrient-dense superfood without mixing powders: one steady ritual toward better daily wellness.",
  },
  {
    id: "moringa-powder",
    slug: "moringa-powder",
    name: "Moringa Powder",
    category: "Nutrients",
    price: 20,
    image: "/images/moringa-powder.png",
    summary: "Pure Moringa oleifera leaf powder — blend into smoothies, meals, and daily rituals.",
    description:
      "Moringa oleifera, often hailed as the “miracle tree,” is a powerhouse of nutrition. Our Moringa Powder is finely milled leaf — rich in vitamins A, C, and a variety of B vitamins, plus minerals like magnesium and iron — so you can fold this superfood into smoothies, juices, yogurt, oatmeal, or recipes with ease.\n\nThe leaves are packed with antioxidants such as quercetin and chlorogenic acid, which help combat oxidative stress and are associated with supporting healthy blood pressure and blood-sugar regulation. Studies also highlight moringa’s anti-inflammatory qualities and ongoing research into cellular health, insulin sensitivity, and everyday resilience for concerns such as joint comfort and respiratory wellness.\n\nChoose the size that fits your routine — 4 oz ($20), 8 oz ($35), or 16 oz ($50) — and incorporate moringa powder into your daily diet to harness this nutrient-dense plant and take a practical step toward a healthier lifestyle.",
    options: [
      { id: "moringa-powder-4oz", label: "4 ounce", price: 20 },
      { id: "moringa-powder-8oz", label: "8 ounce", price: 35 },
      { id: "moringa-powder-16oz", label: "16 ounce", price: 50 },
    ],
  },
  {
    id: "moringa-loose-leaf-tea",
    slug: "moringa-loose-leaf-tea",
    name: "Moringa Loose Leaf Tea",
    category: "Nutrients",
    price: 0,
    image: "/images/moringa-loose-leaf-tea.png",
    summary: "Steeped Moringa oleifera leaves — a calm, nutrient-forward cup of daily wellness.",
    description:
      "Experience Moringa oleifera as a mindful tea ritual. Our Moringa Loose Leaf Tea uses the same remarkable leaf celebrated as the “miracle tree” — naturally rich in vitamins A, C, and B vitamins, along with minerals such as magnesium and iron.\n\nSteeping the leaves draws out antioxidants including quercetin and chlorogenic acid, traditionally enjoyed to support vitality, help the body navigate oxidative stress, and complement habits aimed at balanced blood pressure and blood sugar. Moringa’s anti-inflammatory character and researched ties to insulin sensitivity and overall wellness make this an elegant way to welcome the plant into your day — warm, simple, and restorative.\n\nBrew a cup morning or evening and explore the transformative power of moringa in its most calming form: a nourishing leaf infusion for better health and wellness.",
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
  const direct = catalogProducts.find((product) => product.id === slugOrId || product.slug === slugOrId);
  if (direct) return direct;

  for (const product of catalogProducts) {
    const option = product.options?.find((entry) => entry.id === slugOrId);
    if (!option) continue;
    return {
      id: option.id,
      slug: option.id,
      name: `${product.name} — ${option.label}`,
      category: product.category,
      price: option.price,
      image: product.image,
      summary: product.summary,
      description: product.description,
    } satisfies CatalogProduct;
  }

  return null;
}

export function getCatalogDisplayPrice(product: CatalogProduct) {
  if (product.options?.length) {
    return Math.min(...product.options.map((option) => option.price));
  }
  return product.price;
}
