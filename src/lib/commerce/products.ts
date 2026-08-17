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
  "Home",
  "Nutrients",
  "Supplies",
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
    price: 20,
    image: "/images/products/kian-toner.webp",
    summary: "Balancing and hydrating — a daily toner to reset skin after cleanse. 4 oz and 8 oz.",
    description:
      "KIAN Toner is a balancing and hydrating finish after cleanse — a light daily step that helps rebalance the complexion and ready skin for serums and oils.\n\nUse morning and evening on clean skin, then follow with facial oil or moisturizer. Choose 4 fl oz (120 ml) for travel and first rituals, or 8 fl oz for everyday use at home.",
    options: [
      { id: "kian-toner-4oz", label: "4 ounce", price: 20 },
      { id: "kian-toner-8oz", label: "8 ounce", price: 38 },
    ],
  },
  {
    id: "soap",
    slug: "soap",
    name: "KIAN Natural Soap",
    category: "Skincare",
    price: 0,
    image: "/images/products/kian-natural-soap.webp",
    summary: "Cleanse • Nourish • Soothe — 5 oz / 140 g bar for face and body.",
    description:
      "KIAN Natural Soap is a 5 oz (140 g) bar made for a simple, sensorial cleanse. The speckled bar and wrap carry the same apothecary language as the rest of the line: cleanse, nourish, and soothe.\n\nWork into a lather with warm water and rinse.",
  },
  {
    id: "kian-anti-aging-facial-oil",
    slug: "kian-anti-aging-facial-oil",
    name: "KIAN Anti Aging Facial Oil",
    category: "Skincare",
    price: 0,
    image: "/images/products/kian-anti-aging-facial-oil.webp",
    summary: "Restore • Rejuvenate • Renew — 2 fl oz / 60 ml dropper.",
    description:
      "KIAN Anti Aging Facial Oil is a 2 fl oz (60 ml) facial oil in amber glass with a dropper. The ritual is simple: restore, rejuvenate, renew — a few drops pressed into clean skin after toner.",
  },
  {
    id: "kian-scar-oil",
    slug: "kian-scar-oil",
    name: "KIAN Scar Oil",
    category: "Skincare",
    price: 0,
    image: "/images/products/kian-scar-oil.webp",
    summary: "Repair • Restore • Renew — 2 fl oz / 60 ml dropper.",
    description:
      "KIAN Scar Oil is a 2 fl oz (60 ml) treatment oil in amber glass with a dropper, made for targeted repair, restore, and renew rituals.\n\nApply a small amount to clean, dry skin and massage until absorbed.",
  },
  {
    id: "hair-mask",
    slug: "hair-mask",
    name: "KIAN Hair Mask",
    category: "Hair Care",
    price: 0,
    image: "/images/products/kian-hair-mask.webp",
    summary: "Nourish • Repair • Strengthen — deep conditioning for all hair types. 8.45 fl oz.",
    description:
      "KIAN Hair Mask is a deep conditioning treatment for all hair types, in an 8.45 fl oz (250 ml) jar. The ritual is nourish, repair, and strengthen — a richer step when hair needs more than a daily conditioner.\n\nApply to clean, damp hair, leave on as directed, then rinse.",
  },
  {
    id: "hair-serum",
    slug: "hair-serum",
    name: "KIAN Hair Serum",
    category: "Hair Care",
    price: 22,
    image: "/images/products/kian-hair-serum.webp",
    summary: "Nourish • Repair • Strengthen — 4 fl oz / 120 ml dropper.",
    description:
      "KIAN Hair Serum is a 4 fl oz (120 ml) leave-in treatment in amber glass with a dropper. Use it to nourish, repair, and strengthen — a few drops through damp or dry hair, concentrating on ends and areas that need more slip and shine.",
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
    id: "kian-body-oil",
    slug: "kian-body-oil",
    name: "KIAN Body Oil",
    category: "Body Care",
    price: 0,
    image: "/images/products/kian-body-oil.webp",
    summary: "Nourish • Hydrate • Glow — 8 fl oz / 240 ml pump.",
    description:
      "KIAN Body Oil is an 8 fl oz (240 ml) nourishing oil in amber glass with a pump. Smooth over damp skin after bath or shower to nourish, hydrate, and glow.",
  },
  {
    id: "kian-body-lotion",
    slug: "kian-body-lotion",
    name: "KIAN Body Lotion",
    category: "Body Care",
    price: 0,
    image: "/images/products/kian-body-lotion.webp",
    summary: "Nourish • Hydrate • Soften — 8 fl oz / 240 ml pump.",
    description:
      "KIAN Body Lotion is an 8 fl oz (240 ml) daily moisturizer in amber glass with a pump. Use morning or evening to nourish, hydrate, and soften.",
  },
  {
    id: "kian-hand-sanitizer",
    slug: "kian-hand-sanitizer",
    name: "KIAN Hand Sanitizer",
    category: "Body Care",
    price: 0,
    image: "/images/products/kian-hand-sanitizer.webp",
    summary: "Cleanse • Protect • Refresh — 2 fl oz / 60 ml spray.",
    description:
      "KIAN Hand Sanitizer is a 2 fl oz (60 ml) spray for on-the-go cleanse, protect, and refresh — the same apothecary bottle language as the rest of the line, in a travel size.",
  },
  {
    id: "kian-serenity-room-spray",
    slug: "kian-serenity-room-spray",
    name: "KIAN Serenity Room Spray",
    category: "Home",
    price: 0,
    image: "/images/products/kian-serenity-room-spray.webp",
    summary: "Calm • Refresh • Uplift — 8 fl oz / 240 ml.",
    description:
      "KIAN Serenity is an 8 fl oz (240 ml) room spray. Mist into the air or onto linens to calm, refresh, and uplift a room.",
  },
  {
    id: "kian-bliss-room-spray",
    slug: "kian-bliss-room-spray",
    name: "KIAN Bliss Room Spray",
    category: "Home",
    price: 0,
    image: "/images/products/kian-bliss-room-spray.webp",
    summary: "Calm • Refresh • Uplift — 8 fl oz / 240 ml.",
    description:
      "KIAN Bliss is an 8 fl oz (240 ml) room spray. Mist into the air or onto linens to calm, refresh, and uplift a room.",
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
    id: "payment-test-1",
    slug: "payment-test-1",
    name: "Payment Test ($1)",
    category: "Nutrients",
    price: 1,
    image: "/images/wellness.avif",
    summary: "One-dollar test item for verifying live checkout. Remove after payment testing is complete.",
    description:
      "This is a temporary $1.00 product used only to verify payment processing on KIAN Privé. It is not a wellness product — please do not leave it in the live catalog after testing.",
  },
  {
    id: "agara-coffee",
    slug: "agara-coffee",
    name: "AGARA Cafe",
    category: "Nutrients",
    price: 0,
    image: "/images/products/agara-cafe.png",
    summary: "Dark roast premium Arabica — energy, focus, mood, appetite balance, and metabolism support.",
    description:
      "AGARA Cafe is your daily brew for energy, clarity, and appetite balance. This dark roast premium Arabica blend is crafted with natural ingredients to support energy, focus, mood, appetite balance, and metabolism.\n\nNet Wt. 3.18 oz (90 g). Purchase is completed on AGARA Life — KIAN Privé does not process this order in-cart.",
    redirectUrl: "https://www.agaralife.com/Shop/Cafe/44550",
  },
  {
    id: "bac-water-10ml",
    slug: "bac-water-10ml",
    name: "BAC Water — 10 ml",
    category: "Supplies",
    price: 0,
    image: "/images/products/bac-water-10ml.jpg",
    summary: "Bacteriostatic sterile water for reconstitution — 10 ml vial.",
    description:
      "BAC Water is bacteriostatic sterile water used to reconstitute physician-prescribed peptides and compounds. This is an accessory supply, not a prescription therapy.\n\nPeptide compounds themselves are prescribed on Privé Therapeutics after clinical intake — they are not sold in this shop.",
  },
  {
    id: "pen-tips",
    slug: "pen-tips",
    name: "Pen Tips — Box of 100",
    category: "Supplies",
    price: 0,
    image: "/images/products/pen-tips.png",
    summary: "Pen needles for use with injection pens — box of 100.",
    description:
      "Pen tips (pen needles) for use with compatible injection pens. These are accessory supplies for an existing protocol — not filled peptide pens or prescription compounds.\n\nFilled peptide pens and other compound therapies are prescribed on Privé Therapeutics.",
  },
  {
    id: "pen-tips-alcohol-pad-kit",
    slug: "pen-tips-alcohol-pad-kit",
    name: "Pen Tips & Alcohol Pad Kit",
    category: "Supplies",
    price: 0,
    image: "/images/products/pen-tips-alcohol-kit.png",
    summary: "20-count kit of pen tips with alcohol pads.",
    description:
      "A 20-count kit of pen tips paired with alcohol pads for injection-site prep. Accessory supplies only — not a peptide or compound therapy.",
  },
  {
    id: "insulin-syringes",
    slug: "insulin-syringes",
    name: "Insulin Syringes — 1 mL × 31G × 8 mm",
    category: "Supplies",
    price: 0,
    image: "/images/products/insulin-syringe.png",
    summary: "Insulin syringes for reconstitution and injection protocols. Boxes of 10, 20, or 100.",
    description:
      "1 mL × 31G × 8 mm insulin syringes for use with physician-directed reconstitution and injection protocols. Accessory supplies — not prescription peptides.\n\nChoose a 10-count kit, 20-count kit, or a box of 100 individually wrapped syringes.",
    options: [
      { id: "insulin-syringes-10", label: "Box of 10", price: 0 },
      { id: "insulin-syringes-20", label: "Box of 20", price: 0 },
      { id: "insulin-syringes-100", label: "Box of 100", price: 0 },
    ],
  },
  {
    id: "alcohol-pads",
    slug: "alcohol-pads",
    name: "Alcohol Pads",
    category: "Supplies",
    price: 0,
    image: "/images/products/pen-tips-alcohol-kit.png",
    summary: "Alcohol pads for injection-site prep — boxes of 100 or 200.",
    description:
      "Alcohol pads for cleaning the vial stopper and injection site before a physician-directed protocol. Accessory supplies only.",
    options: [
      { id: "alcohol-pads-100", label: "Box of 100", price: 0 },
      { id: "alcohol-pads-200", label: "Box of 200", price: 0 },
    ],
  },
  {
    id: "professional-distribution",
    slug: "professional-distribution",
    name: "Professional",
    category: "Professional",
    price: 0,
    image: "/images/products/wellness-tech-bio-distribution.webp",
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

export function isCatalogProductPriced(product: CatalogProduct) {
  if (product.redirectUrl) return false;
  return getCatalogDisplayPrice(product) > 0;
}

/** Unpriced retail items stay visible but cannot be purchased. */
export function isCatalogProductComingSoon(product: CatalogProduct) {
  return !product.redirectUrl && !isCatalogProductPriced(product);
}

export function shopCategoryList(products: CatalogProduct[]) {
  const known = new Set<string>(shopCategories);
  const extra = [...new Set(products.map((product) => product.category).filter(Boolean))]
    .filter((category) => !known.has(category))
    .sort((a, b) => a.localeCompare(b));
  return [...shopCategories, ...extra];
}
