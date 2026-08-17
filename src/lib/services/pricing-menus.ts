/** Published service menus from KIAN Privé IV pricing and Wellness Tech clinical sheets. */

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Standard KIAN member rate: 20% off guest retail (matches IV 4×/month column). */
export function memberFromGuest(guest: number) {
  return Math.round(guest * 0.8);
}

export type PricedMenuItem = {
  name: string;
  guest: number;
  member: number;
  note?: string;
  slug?: string;
};

export type IvDripItem = {
  name: string;
  retail: number;
  save10: number;
  save15: number;
  save20: number;
};

export const ivDripMenu: IvDripItem[] = [
  { name: "Immunity", retail: 230, save10: 207, save15: 196, save20: 184 },
  { name: "Hydration", retail: 230, save10: 207, save15: 196, save20: 184 },
  { name: "Recovery", retail: 260, save10: 234, save15: 221, save20: 208 },
  { name: "Hangover", retail: 220, save10: 198, save15: 187, save20: 176 },
  { name: "Myers' Cocktail", retail: 280, save10: 252, save15: 238, save20: 224 },
  { name: "Energy Boost", retail: 180, save10: 162, save15: 153, save20: 144 },
  { name: "NAD+ (100mg)", retail: 260, save10: 234, save15: 221, save20: 208 },
  { name: "NAD+ (250mg)", retail: 500, save10: 450, save15: 425, save20: 400 },
];

export const ivInjectionMenu: IvDripItem[] = [
  { name: "Vitamin B12 (IV, SQ, IM)", retail: 25, save10: 23, save15: 21, save20: 20 },
  { name: "Glutathione (IV, IM)", retail: 35, save10: 32, save15: 30, save20: 28 },
  { name: "NAD+ (SQ)", retail: 75, save10: 68, save15: 64, save20: 60 },
  { name: "Lipo-Mino (IM)", retail: 65, save10: 59, save15: 55, save20: 52 },
];

export const ivAddOnMenu: IvDripItem[] = [
  { name: "Vitamin C (IV)", retail: 30, save10: 27, save15: 26, save20: 24 },
  { name: "Immune Boost (IV)", retail: 80, save10: 72, save15: 68, save20: 64 },
  { name: "Zofran (IV)", retail: 30, save10: 27, save15: 26, save20: 24 },
];

export const ivMembershipTiers = [
  { label: "Non-member", detail: "Full retail" },
  { label: "2× / month · $49/mo", detail: "Save 10%" },
  { label: "3× / month · $74/mo", detail: "Save 15%" },
  { label: "4× / month · $99/mo", detail: "Save 20%" },
];

export const ivMemberBenefits = [
  "One free B12 shot with each 2 IV services",
  "One free B12 shot with each 3 IV services",
  "One free add-on with each 3 IV services",
  "One free B12 shot with each 4 IV services",
  "One free injection with each 4 IV services",
];

export type LabPanelMenuItem = PricedMenuItem & {
  slug: string;
  tests: string;
  purpose: string;
};

export const coreLabPanels: LabPanelMenuItem[] = [
  {
    slug: "lab-panel-essential",
    name: "Essential Wellness Panel",
    guest: 224,
    member: 179,
    tests: "CBC with Differential, CMP, Lipid Panel, Hemoglobin A1C, TSH, Urinalysis with Microscopy",
    purpose: "General health screening, diabetes, kidney/liver function, cholesterol, thyroid, infection screening",
  },
  {
    slug: "lab-panel-metabolic",
    name: "Metabolic Health Panel",
    guest: 324,
    member: 259,
    tests: "Everything in Essential Wellness plus Fasting Insulin, Ferritin, Magnesium, hs-CRP, Homocysteine",
    purpose: "Detect insulin resistance, inflammation, cardiovascular risk, nutritional deficiencies",
  },
  {
    slug: "lab-panel-hormone",
    name: "Hormone Balance Panel",
    guest: 449,
    member: 359,
    tests: "CBC, CMP, TSH, Free T3, Free T4, TPO Antibodies, Thyroglobulin, Estradiol, Total Testosterone, SHBG, Ferritin",
    purpose: "Thyroid optimization, menopause/andropause evaluation, fatigue, hormone replacement monitoring",
  },
  {
    slug: "lab-panel-longevity",
    name: "Longevity Panel",
    guest: 599,
    member: 479,
    tests: "Metabolic Health Panel plus Vitamin D, Vitamin B12, Magnesium, Homocysteine, hs-CRP",
    purpose: "Healthy aging, immune function, cardiovascular risk reduction, nutritional optimization",
  },
  {
    slug: "lab-panel-executive",
    name: "Executive Brain & Longevity Panel",
    guest: 1099,
    member: 879,
    tests:
      "CBC, CMP, Lipid Panel, A1C, Insulin, TSH, Free T3, Free T4, TPO, Thyroglobulin, Vitamin D, Vitamin B12, Ferritin, Magnesium, hs-CRP, ESR, Homocysteine, Estradiol, Testosterone, SHBG, Urinalysis",
    purpose: "Comprehensive executive assessment for cardiovascular, metabolic, endocrine, inflammatory, nutritional, and brain health",
  },
];

export const addOnLabPanels: LabPanelMenuItem[] = [
  {
    slug: "lab-panel-brain",
    name: "Brain Health Panel",
    guest: 449,
    member: 359,
    tests: "Vitamin D, Vitamin B12, Homocysteine, Ferritin, hs-CRP, Magnesium, TSH, Free T4, Free T3, TPO, Thyroglobulin",
    purpose: "Cognitive concerns, concussion history, migraines, mood disorders, or neurological symptoms",
  },
  {
    slug: "lab-panel-weight",
    name: "Weight Management Panel",
    guest: 349,
    member: 279,
    tests: "CBC, CMP, Lipid Panel, A1C, Fasting Insulin, TSH, Free T4, Free T3, Vitamin D, Ferritin",
    purpose: "Useful before starting GLP-1 or other weight management therapies",
  },
  {
    slug: "lab-panel-hormone-optimization",
    name: "Hormone Optimization Panel",
    guest: 399,
    member: 319,
    tests: "Estradiol, Total Testosterone, SHBG, TSH, Free T3, Free T4, TPO, Thyroglobulin, Ferritin, Vitamin D",
    purpose: "Designed for patients undergoing hormone replacement therapy",
    note: "Source sheet did not list a retail range; priced in line with the Hormone Balance panel.",
  },
  {
    slug: "lab-panel-cardio",
    name: "Cardiovascular Risk Panel",
    guest: 349,
    member: 279,
    tests: "Lipid Panel, hs-CRP, Homocysteine, A1C, Fasting Insulin, Magnesium, Troponin",
    purpose: "Cardiovascular risk screening. Troponin only when clinically indicated, not as routine screening.",
    note: "Source sheet did not list a retail range; priced in line with similarly sized targeted panels.",
  },
];

export const providerVisitMenu = {
  inPerson: [
    { name: "New Patient Consult", guest: 350, member: memberFromGuest(350) },
    { name: "Follow-up", guest: 175, member: memberFromGuest(175) },
  ] satisfies PricedMenuItem[],
  telemedicine: [
    { name: "New Patient", guest: 300, member: memberFromGuest(300) },
    { name: "Follow-up", guest: 150, member: memberFromGuest(150) },
  ] satisfies PricedMenuItem[],
  async: [{ name: "Asynchronous Consult", guest: 50, member: memberFromGuest(50) }] satisfies PricedMenuItem[],
  nurse: [
    { name: "Blood Pressure, Vitals & Medication Review", guest: 100, member: memberFromGuest(100) },
    { name: "Lab Draw Only", guest: 50, member: memberFromGuest(50), note: "Plus lab processing and handling fee" },
    { name: "Combined Nurse Visit", guest: 150, member: memberFromGuest(150), note: "Plus lab processing and handling fee" },
  ] satisfies PricedMenuItem[],
  peptide: [{ name: "Peptide Optimization Consultation", guest: 100, member: memberFromGuest(100) }] satisfies PricedMenuItem[],
};

export const icoonePricedMenu = {
  packages40: [
    { name: "Single session — 40 min", guest: 175, member: memberFromGuest(175) },
    { name: "5-session package — 40 min", guest: 788, member: memberFromGuest(788) },
    { name: "10-session package — 40 min", guest: 1488, member: memberFromGuest(1488) },
  ] satisfies PricedMenuItem[],
  packages50: [
    { name: "Single session — 50 min", guest: 195, member: memberFromGuest(195) },
    { name: "5-session package — 50 min", guest: 878, member: memberFromGuest(878) },
    { name: "10-session package — 50 min", guest: 1658, member: memberFromGuest(1658) },
    { name: "Monthly 2 × 50 min", guest: 356, member: 356, note: "Per month" },
    { name: "Monthly 4 × 50 min", guest: 665, member: 665, note: "Per month" },
  ] satisfies PricedMenuItem[],
  packages80: [
    { name: "Single session — 80 min", guest: 325, member: memberFromGuest(325) },
    { name: "5-session package — 80 min", guest: 1463, member: memberFromGuest(1463) },
    { name: "10-session package — 80 min", guest: 2763, member: memberFromGuest(2763) },
    { name: "Monthly 2 × 80 min", guest: 546, member: 546, note: "Per month" },
    { name: "Monthly 4 × 80 min", guest: 1188, member: 1188, note: "Per month" },
  ] satisfies PricedMenuItem[],
};

export function labPanelPricingLines(panel: Pick<LabPanelMenuItem, "guest" | "member">) {
  return [formatUsd(panel.guest)];
}

export function pricedMenuLines(items: PricedMenuItem[]) {
  return items.map((item) => {
    const note = item.note ? ` (${item.note})` : "";
    return `${item.name}: ${formatUsd(item.guest)}${note}`;
  });
}

export function ivPricingLines() {
  return [
    ...ivDripMenu.map((item) => `${item.name}: ${formatUsd(item.retail)}`),
    ...ivInjectionMenu.map((item) => `${item.name}: ${formatUsd(item.retail)}`),
    ...ivAddOnMenu.map((item) => `Add-on · ${item.name}: ${formatUsd(item.retail)}`),
  ];
}
