export const PROGRAM_OPTIONS = [
  "Peptide Therapy",
  "GLP-1 / GLP-2 / GLP-3 Receptor Agonist Therapy",
  "Combination Protocol (Peptide + GLP)",
  "Longevity & Wellness Membership",
] as const;

export const PRIMARY_GOAL_OPTIONS = [
  "Weight loss & body composition",
  "Weight maintenance",
  "Skin rejuvenation & improved elasticity",
  "Anti-aging & cellular regeneration",
  "Muscle growth & performance optimization",
  "Injury recovery & tissue repair",
  "Hormonal balance & endocrine support",
  "Improved insulin sensitivity",
  "Diabetes / prediabetes control",
  "Cardiovascular risk reduction",
  "Fatty liver improvement",
  "Reduced inflammation",
  "Sexual health & enhancement",
  "Cognitive performance & mental clarity",
  "Immune system support",
  "Sleep optimization & stress recovery",
  "Longevity",
  "Other",
] as const;

export const WEIGHT_STRUGGLE_OPTIONS = ["< 1 year", "1 – 5 years", "5 – 10 years", "> 10 years"] as const;

export const PREVIOUS_WEIGHT_LOSS_OPTIONS = [
  "Diet modification",
  "Structured exercise program",
  "Nutritionist",
  "Weight Watchers",
  "Jenny Craig",
  "Noom",
  "Ketogenic diet",
  "Mediterranean diet",
  "Low carb",
  "Intermittent fasting",
  "Bariatric surgery",
  "Personal trainer",
  "Prescription medications",
  "Other",
] as const;

export const PREVIOUS_THERAPY_OPTIONS = [
  "Semaglutide",
  "Tirzepatide",
  "Retatrutide",
  "Liraglutide",
  "Dulaglutide",
  "Exenatide",
  "Cagrilintide",
  "Tesofensine",
  "Other peptide / injectable",
] as const;

export const MEDICAL_CONDITION_OPTIONS = [
  "Type 2 Diabetes",
  "Prediabetes",
  "Hypertension",
  "Hyperlipidemia",
  "Coronary Artery Disease",
  "Heart Failure",
  "Stroke / TIA",
  "Sleep Apnea",
  "PCOS",
  "Metabolic Syndrome",
  "Fatty Liver Disease",
  "Kidney Disease",
  "GERD",
  "Gastric Ulcer",
  "Chronic Constipation",
  "IBS",
  "Crohn's Disease",
  "Ulcerative Colitis",
  "Gallstones",
  "Gallbladder Removal",
  "Pancreatitis",
  "Thyroid Disease",
  "Hashimoto's",
  "Graves' Disease",
  "Depression",
  "Anxiety",
  "ADHD",
  "Eating Disorder",
  "Migraine",
  "Chronic Pain",
  "Cancer",
  "Hormonal Disorder",
] as const;

export const CONTRAINDICATION_OPTIONS = [
  "Medullary thyroid cancer (MTC)",
  "Multiple Endocrine Neoplasia syndrome type 2 (MEN2)",
  "Pancreatitis",
  "Gallstones",
  "Gastroparesis",
  "Severe GERD",
  "Bowel obstruction",
  "Severe kidney disease",
  "Severe liver disease",
  "None of the above",
] as const;

export const FAMILY_HISTORY_OPTIONS = [
  "Medullary thyroid cancer",
  "MEN2 syndrome",
  "Pancreatic cancer",
  "Type 2 Diabetes",
  "Obesity",
  "Heart disease",
  "Stroke",
  "None of the above",
] as const;

export const ACTIVITY_FREQUENCY_OPTIONS = [
  "Daily",
  "3–4 times per week",
  "1–2 times per week",
  "Occasionally",
  "Rarely / Never",
] as const;

export const DIET_TYPE_OPTIONS = [
  "Balanced / Mediterranean",
  "High protein / Athletic",
  "Plant-based / Vegan",
  "Ketogenic / Low-carb",
  "No specific diet",
  "Other",
] as const;

export const SMOKING_STATUS_OPTIONS = [
  "Never smoked",
  "Former smoker",
  "Current smoker",
  "Marijuana use",
] as const;

export const STRESS_LEVEL_OPTIONS = [
  "Low — generally balanced and well-rested",
  "Moderate — manageable with occasional highs",
  "High — frequently overwhelmed or fatigued",
  "Very high — chronic or severe",
] as const;

export const EATING_PATTERN_OPTIONS = [
  "Frequent sugary drinks",
  "Late-night eating",
  "Binge eating episodes",
  "Emotional eating",
  "None of the above",
] as const;

export const WOMENS_HEALTH_OPTIONS = [
  "Currently pregnant",
  "Trying to conceive",
  "Breastfeeding",
  "PCOS diagnosis",
  "Postmenopausal",
  "None of the above",
] as const;

export const RECENT_LAB_OPTIONS = [
  "Hemoglobin A1c",
  "Fasting glucose",
  "Fasting insulin",
  "Creatinine / eGFR",
  "AST / ALT",
  "Lipid panel",
  "TSH / Free T4",
  "CBC",
  "Vitamin D",
  "Vitamin B12",
  "None on file",
] as const;

export const SYMPTOM_OPTIONS = [
  "Fatigue",
  "Food cravings",
  "Sugar cravings",
  "Brain fog",
  "Joint pain",
  "Snoring",
  "Daytime sleepiness",
  "Shortness of breath",
  "Swelling",
  "Depression",
  "Anxiety",
  "Constipation",
  "Diarrhea",
  "Nausea",
  "Vomiting",
  "Reflux",
  "Abdominal pain",
  "None of the above",
] as const;

export const ACKNOWLEDGMENT_STATEMENTS = [
  "Weight loss and treatment outcomes vary by individual and are not guaranteed.",
  "Lifestyle changes, including nutrition and exercise, are required to support optimal results.",
  "Peptide and GLP receptor agonist therapy may require long-term or maintenance use.",
  "Muscle preservation requires adequate protein intake and resistance exercise during treatment.",
  "Routine follow-up appointments and laboratory monitoring may be required throughout treatment.",
  "Dose adjustments may be needed based on clinical response and tolerability.",
  "Insurance approval and coverage, where applicable, are not guaranteed.",
] as const;

export const REFERRAL_SOURCE_OPTIONS = [
  "Referral from physician or healthcare provider",
  "Referral from a friend or family member",
  "Social media (Instagram, Facebook, etc.)",
  "Web search",
  "Hotel or resort partnership",
  "Other",
] as const;

export const INTAKE_STEPS = [
  { id: "patient", title: "Patient Information", section: "01" },
  { id: "program-goals", title: "Program & Goals", section: "02–03" },
  { id: "weight-metabolic", title: "Weight & Metabolic History", section: "04" },
  { id: "medical-safety", title: "Medical History & Safety", section: "05–06" },
  { id: "family-meds", title: "Family & Medications", section: "07–08" },
  { id: "lifestyle", title: "Lifestyle & Nutrition", section: "09–11" },
  { id: "labs-symptoms", title: "Labs & Symptoms", section: "12–13" },
  { id: "consent", title: "Consent & Signature", section: "14–15" },
] as const;
