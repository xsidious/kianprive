/** Map RxHere formulary category / product image → public image path. */

const CATEGORY_SLUGS = {
  "appetite suppressant": "appetite-suppressant",
  "fat loss & metabolic": "fat-loss-metabolic",
  "fat loss and metabolic": "fat-loss-metabolic",
  "anti-aging": "anti-aging",
  "tissue repair & recovery": "tissue-repair",
  "tissue repair and recovery": "tissue-repair",
  longevity: "longevity",
  "sleep / circadian rhythm": "sleep",
  sleep: "sleep",
  "growth hormone optimization": "growth-hormone",
  "immune support": "immune",
  "cognitive & mood": "cognitive",
  "cognitive and mood": "cognitive",
  "hormone replacement therapy": "hrt",
  "sexual health": "sexual-health",
  dermatology: "dermatology",
  "skin & hair care": "skin-hair",
  "skin and hair care": "skin-hair",
  wellness: "wellness",
  peptides: "peptides",
  "peptide stacks": "peptide-stacks",
  addiction: "addiction",
  anesthetic: "anesthetic",
};

export function formularyImageForCategory(category) {
  const key = String(category || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  const slug = CATEGORY_SLUGS[key] || "compounded";
  return `/images/formulary/${slug}.svg`;
}

/** Prefer pulled RxHere product photo; fall back to category SVG. */
export function formularyImageForRow(row) {
  if (row?.image && String(row.image).startsWith("/images/")) {
    return String(row.image);
  }
  if (row?.imageId) {
    return `/images/formulary/rxhere/${row.imageId}.webp`;
  }
  return formularyImageForCategory(row?.category);
}
