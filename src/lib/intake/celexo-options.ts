export const CELEXO_INTAKE_STEPS = [
  "Patient",
  "Protocol",
  "Skin profile",
  "Medical history",
  "Screening",
  "Lifestyle",
  "Consent",
] as const;

export const CELEXO_PROTOCOLS = [
  "CELEXO — Plant-Based",
  "CELEXO BLACK LABEL — Adipose",
] as const;

export const CELEXO_DELIVERY_METHODS = [
  "Topical Application",
  "Microneedling + Celexo",
] as const;

export const CELEXO_TREATMENT_AREAS = [
  "Full Face",
  "Forehead & Brows",
  "Under Eye / Periorbital",
  "Neck & Décolleté",
  "Cheeks & Nasolabial",
  "Lips & Perioral",
  "Scalp / Hairline",
  "Hands / Arms",
] as const;

export const CELEXO_GOAL_OPTIONS = [
  "Anti-Aging / Fine Lines",
  "Skin Brightening & Glow",
  "Acne Scarring / Texture",
  "Hyperpigmentation / Melasma",
  "Redness / Rosacea",
  "Pore Refinement",
  "Barrier Repair",
  "Hair Loss / Thinning",
  "Post-Procedure Healing",
  "Overall Skin Health",
  "Other",
] as const;

export const CELEXO_SKIN_TYPES = ["Dry", "Oily", "Combination", "Normal", "Sensitive"] as const;

export const CELEXO_FITZPATRICK = [
  "Type I (Fair)",
  "Type II–III",
  "Type IV",
  "Type V",
  "Type VI (Deep)",
] as const;

export const CELEXO_PRIMARY_CONCERNS = [
  "Aging / Wrinkles",
  "Pigmentation",
  "Acne/Scarring",
  "Dullness",
  "Sensitivity",
] as const;

export const CELEXO_REGIMENS = [
  "Minimal / None",
  "OTC Products",
  "Medical-Grade",
  "Professional Treatments",
] as const;

export const CELEXO_ACTIVE_CONDITIONS = [
  "Active Acne (inflammatory)",
  "Rosacea",
  "Eczema / Dermatitis",
  "Psoriasis",
  "Keloid / Hypertrophic Scarring",
  "Melasma / PIH",
  "Cold Sore / HSV History",
  "None / Other",
] as const;

export const CELEXO_RECENT_TREATMENTS = [
  "Retinol / Tretinoin",
  "Chemical Peel",
  "Laser / IPL",
  "Injectable (Botox/Filler)",
  "Microneedling",
  "None",
] as const;

export const CELEXO_MEDICAL_CONDITIONS = [
  "Autoimmune Disorder",
  "Active Cancer / History",
  "Diabetes",
  "Thyroid Condition",
  "Hormonal Imbalance / PCOS",
  "Cardiovascular Condition",
  "Immunosuppressed State",
  "Pregnancy / Breastfeeding",
  "None of the above",
] as const;

export const CELEXO_ALLERGIES = [
  "Plant / Botanical Extracts",
  "Citrus / Grapefruit",
  "Oils",
  "Latex",
  "Egg / Animal Proteins",
  "Topical Anesthetics",
  "None Known",
] as const;

export const CELEXO_SCREENING_QUESTIONS = [
  {
    key: "pregnantBreastfeeding",
    label: "Are you pregnant, breastfeeding, or planning pregnancy?",
  },
  {
    key: "activeInfection",
    label: "Do you have an active infection, open wound, or fever today?",
  },
  {
    key: "accutane",
    label: "Have you used Accutane (isotretinoin) within the past 12 months?",
  },
  {
    key: "bloodThinners",
    label: "Are you currently on blood thinners or anticoagulant medication?",
  },
  {
    key: "keloidHistory",
    label: "Do you have a history of keloid or hypertrophic scarring?",
  },
  {
    key: "recentInjectables",
    label: "Have you received injectables (Botox/filler) within the last 2 weeks?",
  },
  {
    key: "recentLaserPeel",
    label: "Have you had laser, peel, or ablative treatment within 30 days?",
  },
  {
    key: "hsvHistory",
    label: "Do you have a history of cold sores (HSV) in the treatment area?",
  },
  {
    key: "chemoRadiation",
    label: "Are you currently undergoing chemotherapy or radiation therapy?",
  },
  {
    key: "autoimmuneFlare",
    label: "Do you have an active autoimmune flare or use immunosuppressants?",
  },
  {
    key: "priorExosomeReaction",
    label: "Have you previously experienced an adverse reaction to a biologic or exosome product?",
  },
  {
    key: "firstMicroneedling",
    label: "Are you a first-time microneedling client?",
  },
] as const;

export const CELEXO_CONSENT_STATEMENTS = [
  "I have provided accurate, complete, and truthful information on this intake form.",
  "I understand Celexo and Celexo Black Label are professional-grade exosome products by ABio Materials Korea.",
  "I consent to the Celexo treatment protocol selected above (topical and/or microneedling).",
  "I understand that microneedling involves controlled skin micro-channels and mild transient redness.",
  "I acknowledge that results vary and no specific outcome has been guaranteed.",
  "I have disclosed all relevant medical history, medications, and allergies.",
  "I authorize KIAN Privé to retain this intake form as part of my confidential wellness record.",
  "I understand I may withdraw consent at any time prior to treatment commencement.",
  "I have been informed of the exosome source for my selected protocol (plant-based and/or human adipose-derived) and consent to proceeding.",
] as const;

export const CELEXO_SUN_EXPOSURE = ["Minimal / Indoor", "Moderate", "High / Outdoor Daily"] as const;
export const CELEXO_SPF = ["Never", "Occasionally", "Daily SPF 30+", "Daily SPF 50+"] as const;
export const CELEXO_DIET = ["Standard", "Whole Food / Organic", "Vegan / Plant-Based", "Keto / Low-Carb"] as const;
export const CELEXO_WATER = ["Low (<4 glasses)", "Moderate (4–6)", "Good (7–8+)"] as const;
export const CELEXO_STRESS = ["Low", "Moderate", "High", "Chronic"] as const;
export const CELEXO_SLEEP = ["Poor", "Fair (5–6 hrs)", "Good (7–8 hrs)", "Excellent"] as const;
export const CELEXO_EXERCISE = ["Sedentary", "1–2x/week", "3–4x/week", "Daily"] as const;
export const CELEXO_SMOKING = ["Never", "Former", "Occasional", "Regular"] as const;
export const CELEXO_ALCOHOL = ["None", "Occasional", "Moderate", "Regular"] as const;

export const CELEXO_AFTERCARE_SUMMARY = {
  first24: [
    "Do not wash the face — avoid all cleansing; if needed, use a gentle cleanser with deep hydration moisturizer",
    "Avoid heavy exfoliation of any kind",
    "No sweating: avoid gym, steam room, sauna, or heat exposure",
    "No active serums, makeup, or fragranced products",
  ],
  days1to3: [
    "Use gentle, pH-balanced cleanser only (no actives)",
    "Apply Celexo Aftercare Cream morning & evening, or whenever skin feels dry",
    "Use Celexo Hydrogel sheet mask (cold) as needed — clean hands only",
    "No sweating, retinol, Vitamin C, AHAs/BHAs, acids, or scrubs",
    "Continue daily SPF 30+",
  ],
  days4to7: [
    "Resume normal hydration and moisturizer routine",
    "Continue daily SPF 30+",
    "Gradually reintroduce non-irritating serums",
  ],
} as const;
