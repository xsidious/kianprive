/**
 * Canonical referral / visit / shop commission rates for KIAN Privé.
 * Applied via scripts/apply-commission-rates.mjs and used as documentation for admin.
 */
export const SERVICE_COMMISSION_POLICY = {
  /** Everyone with a partner/referral code */
  everyone: {
    "icoone-laser": 10,
    "comprehensive-bloodwork": 10,
    "lab-panel-essential": 10,
    "lab-panel-metabolic": 10,
    "lab-panel-hormone": 10,
    "lab-panel-longevity": 10,
    "lab-panel-executive": 10,
    "lab-panel-brain": 10,
    "lab-panel-weight": 10,
    "lab-panel-hormone-optimization": 10,
    "lab-panel-cardio": 10,
    "iv-therapy": 10,
    /** Peptide / GLP pathway referral sales */
    "glp1-peptides": 10,
  } as Record<string, number>,
  /** Shane Shuckerow + Jennifer Fenner consultation split (them 75 / house 25) */
  consultationSpecialists: {
    codes: ["SHANESHUCK", "JENNFENNER"] as const,
    /** Services treated as “consultations” for the 75% rate */
    services: {
      telemedicine: 75,
      nutrition: 75,
    } as Record<string, number>,
  },
} as const;

/** Shop product referral default (skincare, hair, nutrients, etc.) + peptide shop items */
export const PRODUCT_COMMISSION_POLICY = {
  /** Person-level default for all non-overridden shop products */
  defaultProductCommissionPct: 10,
  /** Explicit rate for prescription / peptide catalog items when assigned */
  peptideProductCommissionPct: 10,
} as const;
