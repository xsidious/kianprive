import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { getCmsPageContent } from "@/lib/cms/pages";
import { ServiceCardsWithModal } from "@/components/services/ServiceCardsWithModal";

const coreServices = [
  {
    slug: "telemedicine",
    title: "Telemedicine",
    image: "/images/stock/hero-luxury-clinic.jpg",
    description:
      "Physician-led virtual consultations designed for continuity, convenience, and personalized wellness planning from wherever you are.",
    details: [
      "Board-certified providers review your goals, symptoms, labs, and treatment history.",
      "Protocols are personalized and adjusted through scheduled follow-up check-ins.",
    ],
    includes: ["Wellness planning", "Medication/protocol review", "Follow-up optimization"],
    availability: ["Virtual consultations available."],
  },
  {
    slug: "comprehensive-bloodwork",
    title: "Comprehensive Bloodwork",
    image: "/images/medicalaesthetics.avif",
    description:
      "Detailed lab analysis and physician interpretation to build your personalized care roadmap using objective, trackable health markers.",
    details: [
      "Comprehensive panels evaluate metabolic, inflammatory, nutrient, and hormone markers.",
      "Results are reviewed with your physician and mapped into your ongoing wellness plan.",
    ],
    includes: ["Baseline biomarker assessment", "Progress tracking", "Protocol calibration support"],
  },
  {
    slug: "icoone-laser",
    title: "Icoone® Laser",
    image: "/images/icoone.avif",
    description:
      "The revolutionary Icoone® Laser system uses patented Roboderm® technology with millions of micro-stimulations per session to activate the lymphatic system, stimulate collagen and elastin production, and trigger deep cellular renewal. For detoxification, it eliminates toxins and restores circulatory balance. For pain management, it relieves chronic tension and reduces inflammation. For athletes, it flushes metabolic waste, reduces recovery time, and enhances flexibility. For beauty and body contouring, Icoone® Laser delivers exceptional aesthetic results — visibly reducing cellulite, tightening and firming skin, smoothing the appearance of stretch marks, sculpting and reshaping body contours, improving skin texture and luminosity, and restoring a more youthful, toned silhouette. The multi-functional laser handpieces simultaneously deliver laser energy and mechanical stimulation, allowing treatments to be customized for the face, neck, and décolleté as well as the full body — addressing fine lines, sagging skin, and loss of facial volume alongside body contouring goals. Results are cumulative and progressive, with clients typically noticing measurable improvements in skin quality, firmness, and contour definition within the first few sessions.",
    includes: [
      "Lymphatic drainage and circulatory support",
      "Cellulite and contouring support",
      "Pain, inflammation, and recovery support",
      "Face, neck, décolleté, and full-body targeting",
    ],
    pricing: [
      "40 min single: $175",
      "40 min 5-session package: $788 (save $87)",
      "40 min 10-session package: $1,488 (save $262)",
      "50 min single: $195",
      "50 min 5-session package: $878 (save $97)",
      "50 min 10-session package: $1,658 (save $292)",
      "80 min single: $325",
      "80 min 5-session package: $1,463 (save $162)",
      "80 min 10-session package: $2,763 (save $487)",
      "Monthly 50 min (2 sessions): $356/month",
      "Monthly 50 min (4 sessions): $665/month",
      "Monthly 80 min (2 sessions): $546/month",
      "Monthly 80 min (4 sessions): $1,188/month",
    ],
    membershipNotes: [
      "Monthly plans require a one-month security deposit and a 4-month minimum commitment.",
      "Aftercare: hydration, light movement, avoid alcohol/processed foods 24h, avoid intense heat/exercise for 12h.",
      "Many clients feel lighter and more relaxed after treatment; increased urination may occur as lymphatic flow improves.",
      "Mild temporary soreness or sensitivity can happen in deeply treated areas and usually resolves within 24-48 hours.",
      "Cumulative benefits include improved contour, skin firmness, recovery support, and reduced fluid retention over time.",
    ],
    availability: ["Facility-based service (not offered in-home)."],
  },
  {
    slug: "iv-therapy",
    title: "IV Therapy",
    image: "/images/wellness.avif",
    description:
      "Physician-guided IV protocols deliver targeted nutrients and hydration to support immunity, energy, recovery, and cellular performance.",
    details: [
      "IV infusions are selected and dosed based on goals, symptoms, and clinical context.",
      "Can be paired with recovery, immunity, and performance protocols.",
    ],
    includes: ["Hydration support", "Nutrient replenishment", "Recovery and energy support"],
  },
  {
    slug: "nutrition",
    title: "Nutrition",
    image: "/images/nutrition.avif",
    description:
      "Science-based nutrition support tailored to your goals, with practical plans aligned to your clinical and lifestyle needs.",
    details: [
      "Led by certified nutrition experts in coordination with physician guidance.",
      "Supports weight optimization, gut health, inflammation, hormonal balance, and long-term habits.",
      "Cherie Johnson private virtual consultations are available.",
    ],
    pricing: ["Single session: $150", "4-session package: $500", "8-session package: $950"],
    includes: ["Meal strategy", "Lifestyle adherence support", "Nutraceutical-aligned planning"],
  },
  {
    slug: "microneedling-with-exosomes",
    title: "Microneedling with Exosomes",
    image: "/images/facial-treatments.jpg",
    description:
      "Advanced skin rejuvenation treatment that supports collagen production and visible texture improvement through regenerative signaling.",
    details: ["Microneedling combined with exosome-based regenerative support for skin renewal."],
    pricing: ["Single session: $600", "4-session package: $1,800", "5-session package: $2,700", "10-session package: $5,000"],
    includes: ["Texture refinement", "Tone support", "Fine-line and radiance improvement"],
  },
  {
    slug: "korean-organic-skincare",
    title: "Korean Organic Skincare",
    image: "/images/esthetics.avif",
    description:
      "Luxury preventive skincare protocols rooted in Korean methodology and clean organic formulations for barrier health and long-term skin quality.",
    details: ["Preventive, hydration-focused skincare philosophy designed for skin longevity and barrier integrity."],
    pricing: ["Single facial: $195", "4-session facial package: $725"],
    includes: ["Barrier support", "Hydration protocols", "Gentle clinical-luxury skincare"],
  },
  {
    slug: "facial-aesthetics",
    title: "Facial Aesthetics",
    image: "/images/medicalaesthetics.avif",
    description:
      "Precision aesthetic services focused on natural-looking refinement and skin-forward outcomes in a physician-guided setting.",
    details: ["Facial aesthetics plans are structured to preserve natural expression while improving harmony and confidence."],
    availability: ["Provider-specific scheduling through contact form."],
  },
  {
    slug: "glp1-peptides",
    title: "GLP-1s & Peptides",
    image: "/images/nutrition.avif",
    showPeptidesExperience: true,
    description:
      "Physician-supervised metabolic and peptide protocols are personalized to your goals and priced individually.",
    details: [
      "Includes injectable and sublingual pathway options based on clinical assessment.",
      "Most side effects are GI-related or injection-site related and are often managed by titration and follow-up.",
      "Pathways are supervised through valid patient-practitioner evaluation and compounding standards (503A/503B context).",
    ],
    membershipNotes: [
      "Peptides include monthly pathway options.",
      "Additional protocol add-ons are released separately.",
    ],
    availability: ["Physician-supervised protocols; route and dose selected after evaluation."],
  },
  {
    slug: "mindtap",
    title: "MindTap",
    image: "/images/beauty.avif",
    description:
      "Focused cognitive conditioning and mental performance coaching integrated into your concierge wellness plan.",
    includes: ["Focus and composure training", "Performance psychology support", "Cognitive conditioning"],
    availability: ["Different-location partner service; facility-only partner workflow."],
  },
];

const sameLocationAddOns = [
  {
    title: "Salt Therapy",
    image: "/images/stock/service-wellness.jpg",
    description:
      "Same-location partner add-on that supports respiratory wellness, inflammation reduction, and holistic recovery.",
    includes: ["Respiratory support", "Inflammation support", "Recovery protocol integration"],
    availability: ["Facility-based service (not offered in-home)."],
  },
  {
    title: "PEMF",
    image: "/images/stock/service-medical-aesthetics.jpg",
    description:
      "Same-location pulsed electromagnetic field sessions designed for cellular recharge, pain support, and performance recovery.",
    includes: ["Cellular recharge", "Pain support", "Performance recovery"],
    availability: ["Same-location partner add-on."],
  },
  {
    title: "Far Infrared",
    image: "/images/stock/service-esthetics.jpg",
    description:
      "Same-location infrared sessions to support circulation, detox support, deep relaxation, and recovery.",
    includes: ["Detox support", "Deep tissue warmth", "Recovery and relaxation support"],
    availability: ["Same-location partner add-on."],
  },
];

const differentLocationAddOns: Array<(typeof coreServices)[number]> = [];

const gymServices = [
  {
    title: "Adapt",
    image: "/images/stock/service-beauty-salon.jpg",
    description: "Gym services partner focused on training support, recovery, and performance-driven movement programs.",
    includes: ["Performance movement", "Conditioning support", "Recovery integration"],
    availability: ["Partner access coordinated through contact form."],
  },
];

const preferredProviders = [
  { name: "Salt", logo: "/images/providers/holistic-salt-therapy-center.png", href: "/contact" },
  { name: "PEMF", logo: "/images/providers/omg-aesthetics.png", href: "/contact" },
  { name: "Far Infrared", logo: "/images/providers/facial-design-studio.png", href: "/contact" },
  { name: "MindTap", logo: "/images/providers/mindtap.png", href: "/contact" },
  { name: "Adapt", logo: "/images/providers/vcs-vitamin-c-to-sea.png", href: "/contact" },
];

const koreanAndRecoveryPricing = [
  { service: "Korean & Organic Skincare Facial", price: "Single $195 | 4-Session $725", note: "Save $55" },
  { service: "Microneedling with Exosomes", price: "Single $600 | 4-Session $1,800", note: "Save $600" },
  { service: "Microneedling with Exosomes", price: "5-Session $2,700 | 10-Session $5,000", note: "Save up to $1,000" },
  { service: "Nutrition & Wellness Coaching", price: "Single $150 | 4-Session $500 | 8-Session $950", note: "Save up to $250" },
  {
    service: "InBody Scan — Body Composition Analysis",
    price: "Single Scan (non-member) $30",
    note: "Included monthly in all membership tiers (Tiers 1–3); 4× monthly (Tier 4). Complimentary for members as described.",
  },
  {
    service: "Power Plate — Whole-Body Vibration Therapy",
    price: "Single Session (individual / non-member) $25",
    note: "Complimentary with any active membership. Uses Precision Vibration Technology™ for rapid, multi-directional vibration.",
  },
];

const membershipPolicyHighlights = [
  "A one (1) month security deposit is required upon signing for all memberships.",
  "All memberships are for a minimum 4-month period and will automatically renew on a monthly basis thereafter.",
  "All membership services are fully customizable and interchangeable with services of equal pricing to suit your individual needs.",
  "Unused services roll over to the following month.",
  "Memberships automatically renew monthly until cancelled in writing.",
  "A failed payment of more than two consecutive months will result in immediate cancellation of membership and the remaining balance in full will become due.",
  "No-show and late cancellation fees apply. Please review our cancellation policy at time of enrollment.",
];

const serviceAccessNotes = [
  "In-home and on-location services are available for most treatments, bringing the full KIAN Privé experience directly to you.",
  "Icoone® Laser, Holistic Salt Therapy, and MINDTAP coaching sessions are available at our facility only and are not offered as in-home services.",
];

const compoundedRxReference = {
  title: "503A & 503B Compounded Rx",
  subtitle: "Product Information, Nature Classification & Side Effect Reference",
  natureLegend: [
    {
      code: "NATURAL",
      label: "Natural/Bioidentical",
      detail: "identical or derived from naturally occurring compounds",
    },
    {
      code: "SEMI-SYN",
      label: "Semi-Synthetic",
      detail: "structurally modified analog of a natural compound",
    },
    {
      code: "SYNTHETIC",
      label: "Synthetic",
      detail: "fully laboratory-synthesized; no direct natural counterpart",
    },
  ],
  sideEffectsNote:
    "Side Effects Column — Lists the most commonly reported adverse effects. This is a clinical reference, not an exhaustive list. Individual responses vary. Always conduct a full patient assessment before prescribing.",
  understanding503A: {
    title: "503A — Traditional Patient-Specific",
    lead:
      "Requires a valid individual patient prescription. Regulated by state pharmacy boards. Must comply with USP <795>/<797> standards.",
    bullets: [
      "Patient-specific Rx required",
      "State pharmacy board oversight",
      "Custom dose & formulation",
      "No FDA batch approval",
    ],
  },
  understanding503B: {
    title: "503B — FDA-Registered Outsourcing",
    lead:
      "Federally registered under FDA oversight. May produce large batches for healthcare facilities without individual Rx. Operates under CGMP standards.",
    bullets: [
      "FDA-registered & inspected",
      "CGMP manufacturing standards",
      "Can supply facilities without Rx",
      "Consistent batch quality controls",
    ],
  },
  glp1Intro:
    "GLP-1 & Metabolic Agents — Semaglutide and Tirzepatide are fully synthetic incretin mimetics. Most side effects are GI-related and dose-dependent, typically improving with titration.",
  sublingualIntro:
    "Sublingual Formulations — Needle-free delivery. GI side effects may be milder than injectable forms due to lower peak plasma concentrations.",
  peptideIntro:
    "Peptide & Regenerative Agents — Peptides range from bioidentical to fully synthetic. Side effects are generally mild; most commonly injection site reactions and transient GI or neurological symptoms.",
  combinationIntro:
    "Combination Peptide Protocols — Side effects reflect the combined profile of each component. Additive GI or CNS effects are possible. Start at lower frequencies when introducing combination protocols.",
  importantNotice:
    "IMPORTANT NOTICE: This document is intended for licensed healthcare practitioners only. All compounded medications require a valid patient-practitioner relationship and appropriate clinical evaluation. Side effects listed are the most commonly reported; this is not an exhaustive safety profile. These products have not been evaluated or approved by the FDA for the specific indications listed. 503A products require individual patient prescriptions. 503B products may be distributed to registered healthcare facilities per federal guidelines. 'Natural' classifications refer to structural origin only and do not imply greater safety or efficacy. For professional use only — not for retail distribution.",
};

const glp1MetabolicRows = [
  {
    product: "Semaglutide + Glycine (2.5mg)",
    concentration: "2.5mg/5mg/mL",
    vial: "1 mL",
    nature: "SYNTHETIC",
    sideEffects: "Nausea, vomiting, diarrhea, constipation, injection site reaction",
    notes: "Starter dose; weekly SC. Glycine is a natural amino acid",
  },
  {
    product: "Semaglutide + Glycine (5mg)",
    concentration: "2.5mg/5mg/mL",
    vial: "2 mL",
    nature: "SYNTHETIC",
    sideEffects: "Nausea, fatigue, reduced appetite, GI discomfort",
    notes: "Standard maintenance dose",
  },
  {
    product: "Semaglutide + Glycine (12.5mg)",
    concentration: "2.5mg/5mg/mL",
    vial: "5 mL",
    nature: "SYNTHETIC",
    sideEffects: "GI upset, pancreatitis risk (rare), headache",
    notes: "Higher-dose / longer supply",
  },
  {
    product: "Semaglutide + B12 (2.5mg)",
    concentration: "1.25mg/0.5mg/mL",
    vial: "2 mL",
    nature: "SYNTHETIC",
    sideEffects: "Nausea, injection site pain; B12 generally well tolerated",
    notes: "B12 supports energy & tolerability",
  },
  {
    product: "Semaglutide + B12 (5mg)",
    concentration: "2.5mg/0.5mg/mL",
    vial: "2 mL",
    nature: "SYNTHETIC",
    sideEffects: "GI symptoms, decreased appetite, mild dizziness",
    notes: "Common titration step",
  },
  {
    product: "Semaglutide + B12 (12.5mg)",
    concentration: "3.125mg/0.5mg/mL",
    vial: "4 mL",
    nature: "SYNTHETIC",
    sideEffects: "Nausea, vomiting, gallbladder issues (long-term)",
    notes: "Extended supply",
  },
  {
    product: "Tirzepatide (18mg)",
    concentration: "9mg/mL",
    vial: "2 mL",
    nature: "SYNTHETIC",
    sideEffects: "Nausea, diarrhea, vomiting, decreased appetite, fatigue",
    notes: "Dual GIP/GLP-1; potent metabolic",
  },
  {
    product: "Tirzepatide (36mg)",
    concentration: "18mg/mL",
    vial: "2 mL",
    nature: "SYNTHETIC",
    sideEffects: "GI upset, injection site reactions, hypoglycemia risk",
    notes: "Mid-range maintenance",
  },
  {
    product: "Tirzepatide (72mg)",
    concentration: "18mg/mL",
    vial: "4 mL",
    nature: "SYNTHETIC",
    sideEffects: "Nausea, constipation, pancreatitis risk (rare), hair loss",
    notes: "High-dose / 4-week supply",
  },
  {
    product: "Tirzepatide + B12 (17mg)",
    concentration: "8.5mg/0.5mg/mL",
    vial: "2 mL",
    nature: "SYNTHETIC",
    sideEffects: "GI symptoms, injection site irritation",
    notes: "Enhanced energy support",
  },
  {
    product: "Tirzepatide + B12 (34mg)",
    concentration: "17mg/0.5mg/mL",
    vial: "2 mL",
    nature: "SYNTHETIC",
    sideEffects: "Nausea, diarrhea, reduced appetite",
    notes: "Mid-dose with B12",
  },
  {
    product: "Tirzepatide + B12 (68mg)",
    concentration: "17mg/0.5mg/mL",
    vial: "4 mL",
    nature: "SYNTHETIC",
    sideEffects: "GI effects, gallbladder disease risk (long-term)",
    notes: "High-dose long-acting",
  },
];

const sublingualRows = [
  {
    product: "Sublingual Tirzepatide + NAD+",
    strength: "5–17.5mg/100mg",
    volume: "8 mL",
    nature: "SYNTHETIC",
    sideEffects: "Nausea, oral mucosal irritation, mild flushing (NAD+)",
    benefit: "Synthetic GLP-1 + bioidentical NAD+ (6 strengths)",
  },
  {
    product: "Sublingual Semaglutide",
    strength: "2–10mg",
    volume: "8 mL",
    nature: "SYNTHETIC",
    sideEffects: "Nausea, taste disturbance, dry mouth, mild GI upset",
    benefit: "Needle-free GLP-1; 5 strengths",
  },
  {
    product: "Sublingual Tirzepatide",
    strength: "5–30mg",
    volume: "8 mL",
    nature: "SYNTHETIC",
    sideEffects: "Nausea, reduced appetite, oral irritation, headache",
    benefit: "Needle-free dual agonist; 6 strengths",
  },
];

const peptideRegenerativeRows = [
  {
    peptide: "AOD-9604",
    concentration: "1.2mg/mL • 5mL",
    nature: "SEMI-SYN",
    sideEffects: "Injection site redness, nausea (rare), headache",
    action: "Modified GH fragment; fat lipolysis; no IGF-1 effects",
  },
  {
    peptide: "BPC-157",
    concentration: "3mg/mL • 5mL",
    nature: "SEMI-SYN",
    sideEffects: "Mild nausea, dizziness, transient fatigue",
    action: "Gut & tissue repair; anti-inflammatory; tendon healing",
  },
  {
    peptide: "DSIP",
    concentration: "1mg/mL • 5mL",
    nature: "NATURAL",
    sideEffects: "Excessive drowsiness, headache, mild hypotension",
    action: "Natural brain peptide; sleep architecture & stress",
  },
  {
    peptide: "EPITHALON",
    concentration: "2mg/mL • 5mL",
    nature: "SYNTHETIC",
    sideEffects: "Injection site reactions, transient fatigue, vivid dreams",
    action: "Telomerase activation; anti-aging; pineal regulation",
  },
  {
    peptide: "GHK-Cu",
    concentration: "10mg/mL • 5mL",
    nature: "NATURAL",
    sideEffects: "Skin flushing (topical), mild injection site irritation",
    action: "Copper peptide; collagen synthesis; wound & skin healing",
  },
  {
    peptide: "GONADORELIN",
    concentration: "1mg/mL • 5mL",
    nature: "NATURAL",
    sideEffects: "Hot flashes, headache, mood changes, testicular ache",
    action: "Bioidentical GnRH; LH/FSH support; TRT adjunct",
  },
  {
    peptide: "IGF-LR3",
    concentration: "200mcg/mL • 5mL",
    nature: "SEMI-SYN",
    sideEffects: "Hypoglycemia, headache, joint pain, fluid retention",
    action: "Long-arg3 analog; muscle growth; anabolic signaling",
  },
  {
    peptide: "Kisspeptin",
    concentration: "1mg/mL • 5mL",
    nature: "NATURAL",
    sideEffects: "Flushing, mild GnRH-related hormonal shifts",
    action: "Endogenous neuropeptide; reproductive hormone regulation",
  },
  {
    peptide: "MOTS-C",
    concentration: "2mg/mL • 5mL",
    nature: "NATURAL",
    sideEffects: "Injection site reactions, mild GI upset (rare)",
    action: "Mitochondrial peptide; metabolic flexibility; exercise",
  },
  {
    peptide: "NAD+",
    concentration: "100mg/mL • 10mL",
    nature: "NATURAL",
    sideEffects: "Flushing, nausea, headache, chest tightness (IV rapid)",
    action: "Bioidentical coenzyme; cellular energy & DNA repair",
  },
  {
    peptide: "PT-141",
    concentration: "2mg/mL • 5mL",
    nature: "SEMI-SYN",
    sideEffects: "Nausea, flushing, headache, transient hypertension",
    action: "Melanocortin analog; CNS-mediated libido enhancement",
  },
  {
    peptide: "Sermorelin",
    concentration: "3mg/mL • 5mL",
    nature: "SEMI-SYN",
    sideEffects: "Injection site pain, flushing, dizziness, headache",
    action: "Synthetic GHRH analog (1-29); stimulates GH release",
  },
  {
    peptide: "Tesamorelin",
    concentration: "3mg/mL • 5mL",
    nature: "SEMI-SYN",
    sideEffects: "Injection site reactions, fluid retention, joint pain",
    action: "FDA-approved GHRH; visceral fat reduction; IGF-1 stimulation",
  },
  {
    peptide: "Thymosin A-1",
    concentration: "1mg/mL • 5mL",
    nature: "NATURAL",
    sideEffects: "Generally well tolerated; mild injection site reactions",
    action: "Immune modulation; anti-viral; autoimmune support",
  },
  {
    peptide: "Lipo-B",
    concentration: "50/50/25/1mg/mL",
    nature: "SYNTHETIC",
    sideEffects: "Injection site pain, urinary odor, mild GI effects",
    action: "MIC + B12; lipotropic; liver detox support",
  },
  {
    peptide: "Glutathione",
    concentration: "200mg/mL • 10mL",
    nature: "NATURAL",
    sideEffects: "Skin lightening (with frequent use), mild GI, cramping",
    action: "Master antioxidant; detoxification; skin brightening",
  },
];

const combinationPeptideRows = [
  {
    combination: "AOD-9604 + MOTS-C",
    dosePerMl: "1.2/2mg",
    nature: "SEMI-SYN",
    sideEffects: "Injection site reaction, mild nausea (rare)",
    goal: "Fat oxidation + mitochondrial metabolism",
  },
  {
    combination: "AOD-9604 + MOTS-C + Tesamorelin",
    dosePerMl: "1.2/2/3mg",
    nature: "SEMI-SYN",
    sideEffects: "Fluid retention, joint pain, injection site effects",
    goal: "Full body recomposition stack",
  },
  {
    combination: "BPC-157 + TB-500",
    dosePerMl: "3/3mg",
    nature: "SEMI-SYN",
    sideEffects: "Mild fatigue, dizziness, transient headache",
    goal: "Accelerated tissue & injury repair",
  },
  {
    combination: "BPC-157 + KPV + TB-500",
    dosePerMl: "3/3/3mg",
    nature: "SEMI-SYN",
    sideEffects: "Nausea, mild lethargy, injection site reactions",
    goal: "Repair + gut inflammation + healing",
  },
  {
    combination: "BPC-157 + GHK-Cu + KPV + TB-500",
    dosePerMl: "3/10/3/3mg",
    nature: "SEMI-SYN",
    sideEffects: "Flushing, injection site irritation, mild fatigue",
    goal: "Full-spectrum regenerative protocol",
  },
  {
    combination: "CJC-1295 + Ipamorelin",
    dosePerMl: "1.2/2mg",
    nature: "SYNTHETIC",
    sideEffects: "Water retention, tingling, mild hunger, headache",
    goal: "GH pulse optimization; body composition",
  },
  {
    combination: "Tesamorelin + Ipamorelin",
    dosePerMl: "3/2mg",
    nature: "SEMI-SYN",
    sideEffects: "Fluid retention, joint pain, injection site pain",
    goal: "Visceral fat + GH secretagogue synergy",
  },
  {
    combination: "DSIP + BPC-157 + CJC-1295",
    dosePerMl: "1/2/2mg",
    nature: "SEMI-SYN",
    sideEffects: "Drowsiness, headache, mild fluid retention",
    goal: "Sleep, repair & GH — recovery stack",
  },
  {
    combination: "GHK-Cu + Epithalon",
    dosePerMl: "10/2mg",
    nature: "SEMI-SYN",
    sideEffects: "Injection site reactions, transient fatigue",
    goal: "Skin rejuvenation + telomere anti-aging",
  },
  {
    combination: "SEMAX + SELANK",
    dosePerMl: "1/1mg",
    nature: "SEMI-SYN",
    sideEffects: "Mild headache, nasal irritation (intranasal), fatigue",
    goal: "Cognitive clarity + anxiolytic balance",
  },
  {
    combination: "Pinealon + PE22-28 + SELANK",
    dosePerMl: "2/2/2mg",
    nature: "SYNTHETIC",
    sideEffects: "Transient headache, dizziness, drowsiness",
    goal: "Neuroprotection + memory + calm focus",
  },
];

const oralCapsuleRows = [
  {
    product: "BPC-157",
    dose: "500mcg capsule",
    nature: "SEMI-SYN",
    sideEffects: "Mild nausea, GI discomfort (rare at oral doses)",
    indication: "Gut healing & systemic anti-inflammatory",
  },
  {
    product: "Ondansetron",
    dose: "4mg tablet",
    nature: "SYNTHETIC",
    sideEffects: "Headache, constipation, QT prolongation (rare)",
    indication: "Anti-nausea; GLP-1 side-effect management",
  },
  {
    product: "SLU-PP 332",
    dose: "250mcg capsule",
    nature: "SYNTHETIC",
    sideEffects: "Limited human data; potential GI upset, insomnia",
    indication: "Exercise mimetic; mitochondrial biogenesis",
  },
  {
    product: "5-Amino (5-AMP)",
    dose: "50mg capsule",
    nature: "NATURAL",
    sideEffects: "Mild GI upset, fatigue at higher doses",
    indication: "AMPK activator; metabolic & cellular energy",
  },
  {
    product: "Ibutamoren (MK-677)",
    dose: "25mg capsule",
    nature: "SYNTHETIC",
    sideEffects: "Increased appetite, water retention, fatigue, numbness",
    indication: "Oral GH secretagogue; deep sleep; recovery",
  },
  {
    product: "Dihexa",
    dose: "5mg capsule",
    nature: "SYNTHETIC",
    sideEffects: "Headache, irritability, vivid dreams (limited human data)",
    indication: "Nootropic; synaptic formation; memory & learning",
  },
  {
    product: "SLU-PP 332 + BAM",
    dose: "100mcg/15mg",
    nature: "SYNTHETIC",
    sideEffects: "GI discomfort, potential CNS stimulation",
    indication: "Dual metabolic activator combo",
  },
  {
    product: "Dihexa + Tesofensine",
    dose: "5mg/500mcg",
    nature: "SYNTHETIC",
    sideEffects: "Elevated HR/BP, dry mouth, insomnia, nausea",
    indication: "Cognitive + appetite control synergy",
  },
];

const ancillaryAgentRows = [
  {
    agent: "NAD+ (1200mg)",
    concentration: "200mg/mL • 6mL",
    nature: "NATURAL",
    sideEffects: "Flushing, nausea, chest tightness, headache (rate-dependent)",
    application: "IV/IM; bioidentical coenzyme; energy, detox, longevity",
  },
  {
    agent: "Glutathione (2000mg)",
    concentration: "200mg/mL • 10mL",
    nature: "NATURAL",
    sideEffects: "Skin lightening with frequent IV use, abdominal cramping",
    application: "IV push antioxidant; liver, immune, skin brightening",
  },
  {
    agent: "Methylcobalamin B12 (10mg)",
    concentration: "1mg/mL • 10mL",
    nature: "NATURAL",
    sideEffects: "Generally very well tolerated; rare acne, mild diarrhea",
    application: "Bioidentical active B12; neuro support; methylation",
  },
  {
    agent: "Sermorelin (15mg)",
    concentration: "2.5mg/mL • 6mL",
    nature: "SEMI-SYN",
    sideEffects: "Injection site pain, flushing, headache, fluid retention",
    application: "Synthetic GHRH analog; anti-aging; GH stimulation",
  },
];

const paymentPolicyDetails = [
  "Gratuity is not included in any service, package, or membership pricing. We kindly ask that you compensate our staff directly for their care and expertise.",
  "Financing available through Cherry. Ask our team about flexible payment plans.",
  "PPO members — some services may be super-billed to your insurance provider. Please inquire at time of service.",
  "PPO Insurance — Medical Treatment Policy: Members with PPO insurance must have a consultation with a KIAN Privé physician for evaluation and receive physician approval prior to receiving medical treatment with the Icoone Laser Med.",
  "We encourage all clients to check with their insurance company to see if they cover related expenses for wellness treatments.",
  "Itemized invoices provided upon request.",
  "All major credit cards accepted — a 3% processing fee applies.",
  "Zelle accepted with no additional fee.",
  "PayPal, Venmo and Cash App accepted — a 3% processing fee applies.",
  "FSA and HSA cards accepted.",
];

const brandIntro = {
  tagline: "Luxury Wellness. Uncompromising Care. Exclusively Yours.",
  lead:
    "KIAN Privé is a concierge wellness company dedicated to delivering the finest services for a truly private wellness experience provided by dedicated professionals at your location or ours. No busy waiting rooms, no hustle or bustle. Just uninterrupted, personalized care in a serene and intimate setting. In-home and on-location services are available for most treatments, bringing the full KIAN Privé experience directly to you.",
  team:
    "We bring together a distinguished team of physicians, registered nurses, licensed aestheticians, certified nutrition experts, and wellness specialists to deliver a seamless fusion of clinical medicine, advanced skincare, regenerative therapies, and luxury wellness — tailored to every individual. From the moment you engage with KIAN Privé, our professionals work in concert to assess and elevate every dimension of your wellness, inside and out.",
};

const koreanSkincareIntro =
  "KIAN Privé is a concierge wellness company dedicated to delivering the finest services for a truly private wellness experience — provided by dedicated professionals at your location or ours. No busy waiting rooms, no hustle or bustle. Just uninterrupted, personalized care in a serene and intimate setting. In-home and on-location services are available for most treatments, bringing the full KIAN Privé experience directly to you. Please note that Icoone® Laser, Holistic Salt Therapy, and MINDTAP coaching sessions are available at our facility only and are not offered as in-home services.";

const inBodyDescription =
  "The InBody Scan provides a comprehensive, non-invasive assessment of your body composition — measuring muscle mass, body fat percentage, visceral fat, hydration levels, and metabolic rate with clinical precision. Included monthly in all membership tiers, your InBody results are reviewed alongside your physician's wellness roadmap to track progress, adjust protocols, and optimize every dimension of your transformation.";

const nutritionDescription =
  "Our certified nutrition specialists work alongside physicians to design individualized nutrition plans rooted in science and lifestyle. Whether your goals are weight optimization, gut health, hormonal balance, anti-aging, or sustained energy, we create strategies that work in harmony with your body — from guided meal planning to nutraceutical recommendations.";

const powerPlateDescription =
  "The Power Plate uses advanced Precision Vibration Technology™ to deliver rapid, multi-directional vibrations throughout the entire body — stimulating muscles to contract and relax up to 50 times per second. Power Plate therapy accelerates muscle recovery, enhances circulation and lymphatic flow, improves balance and neuromuscular function, increases bone density, and promotes fat metabolism. Complimentary with any active membership.";

const medicalDisclaimerParagraphs = [
  "Important Notice Regarding Health & Wellness Services",
  "The services, treatments, and programs offered by KIAN Privé are intended for general wellness, recovery support, and lifestyle optimization. They are not intended to diagnose, treat, cure, or prevent any medical condition or disease.",
  "The wellness services provided by KIAN Privé do not replace the care, advice, diagnosis, or treatment provided by your Primary Care Physician or any licensed medical professional. We strongly encourage all clients to consult with their Primary Care Physician or a qualified healthcare provider before beginning any new wellness program, treatment protocol, or service — particularly if you have a pre-existing medical condition, are pregnant, nursing, or currently taking prescription medications.",
  "Results from wellness services vary by individual and are not guaranteed.",
  "If you are experiencing a medical emergency, please call 911 or go to your nearest emergency room immediately.",
];

export default async function ServicesPage() {
  const cms = await getCmsPageContent("services");

  const scrollTable = (header: ReactNode, body: ReactNode) => (
    <div className="overflow-x-auto rounded-3xl border border-[#b78d4b2d] bg-white shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)]">
      <div className="min-w-[720px]">
        {header}
        {body}
      </div>
    </div>
  );

  return (
    <div>
      <SectionWrapper className="pt-18">
        <div className="grid items-center gap-10 rounded-3xl border border-[#b78d4b2e] bg-white p-8 shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)] lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">{cms.eyebrow ?? "PRIVÉ SERVICES"}</p>
            <h1 className="mt-4 text-4xl text-[#1f1a15] md:text-5xl">{cms.title}</h1>
            <p className="mt-5 max-w-2xl text-[#6f6251]">
              {cms.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/book-online" className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
                Book Services
              </Link>
              <Link href="/pricing" className="rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-5 py-2 text-sm text-[#3b3024]">
                View Membership
              </Link>
            </div>
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-3xl border border-[#b78d4b36]">
            <Image src="/images/wellness.avif" alt="KIAN Privé services overview" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">{brandIntro.tagline}</p>
        <h2 className="mt-3 text-3xl text-[#1f1a15] md:text-4xl">Luxury Wellness Services Designed Around Your Personal needs &amp; Goals</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-[#6f6251]">
          Clinically grounded, hospitality-led, and designed for measurable transformation.
        </p>
        <p className="mt-4 max-w-3xl leading-relaxed text-[#6f6251]">{brandIntro.team}</p>
      </SectionWrapper>

      <SectionWrapper>
        <div className="rounded-2xl border border-[#1f7a7a4f] bg-[#eef8f8] p-4">
          <p className="text-xs tracking-[0.2em] text-[#1b6568]">PRIVATE MEMBERS UPDATE</p>
          <p className="mt-2 text-sm text-[#28585a]">
            Additional add-ons will be released separately. Retreats start in September. Events begin June 7, with additional information to follow.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Core Services</h2>
        <p className="mb-6 max-w-3xl text-[#6f6251]">
          Your primary care suite at KIAN Privé, delivered in one integrated experience.
        </p>
        <ServiceCardsWithModal services={coreServices} label="SERVICE" />
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Add-Ons (Same Location)</h2>
        <p className="mb-6 max-w-3xl text-[#6f6251]">
          These add-ons are available at the same location as your core KIAN Privé services.
        </p>
        <p className="mb-6 inline-flex rounded-full border border-[#1f7a7a5c] bg-[#e9f7f7] px-4 py-2 text-xs tracking-[0.18em] text-[#1b6568]">
          HIGH-DEMAND ENHANCEMENTS
        </p>
        <ServiceCardsWithModal services={sameLocationAddOns} label="SAME-LOCATION" />
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Add-Ons (Different Location)</h2>
        <p className="mb-6 max-w-3xl text-[#6f6251]">
          Partner services available at a different location.
        </p>
        <ServiceCardsWithModal services={differentLocationAddOns} label="OFF-SITE" />
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Gym Services</h2>
        <p className="mb-6 max-w-3xl text-[#6f6251]">
          Performance and conditioning support through our gym partner network.
        </p>
        <ServiceCardsWithModal services={gymServices} label="GYM" />
      </SectionWrapper>


      <SectionWrapper>
        <div className="rounded-2xl border border-[#1f7a7a40] bg-[linear-gradient(120deg,#0f3a44_0%,#14505a_65%,#1f7a7a_100%)] p-4 text-white shadow-[0_20px_45px_-35px_rgba(15,58,68,0.8)]">
          <p className="text-xs tracking-[0.2em] text-[#bce9e8]">DETAILED SERVICE LIBRARY</p>
          <p className="mt-2 text-sm leading-relaxed text-[#eef8f8]">
            Korean skincare, GLP-1/metabolic pathways, and advanced protocol details are now organized in each dedicated service page.
            Open any service card and select <strong>Service Page</strong> to view full information.
          </p>
        </div>
      </SectionWrapper>


      <SectionWrapper>
        <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">{brandIntro.tagline}</p>
        <h2 className="mb-2 mt-3 text-3xl text-[#1f1a15] md:text-4xl">Payment & Policies</h2>
        <div className="rounded-3xl border border-[#b78d4b2d] bg-white p-6 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)]">
          <h3 className="text-lg text-[#2b2218]">Membership Policy Summary</h3>
          <ul className="mt-3 space-y-2">
            {membershipPolicyHighlights.map((rule) => (
              <li key={rule} className="text-[#5f5344]">
                {rule}
              </li>
            ))}
          </ul>
          <h3 className="mt-8 text-lg text-[#2b2218]">Gratuity</h3>
          <p className="mt-2 text-sm text-[#5f5344]">{paymentPolicyDetails[0]}</p>
          <h3 className="mt-8 text-lg text-[#2b2218]">Financing & Insurance</h3>
          <ul className="mt-3 space-y-2">
            {paymentPolicyDetails.slice(1, 6).map((item) => (
              <li key={item} className="text-sm text-[#5f5344]">
                {item}
              </li>
            ))}
          </ul>
          <h3 className="mt-8 text-lg text-[#2b2218]">Accepted Forms of Payment</h3>
          <ul className="mt-3 space-y-2">
            {paymentPolicyDetails.slice(6).map((item) => (
              <li key={item} className="text-sm text-[#5f5344]">
                {item}
              </li>
            ))}
          </ul>
          <h3 className="mt-8 text-lg text-[#2b2218]">Medical Disclaimer</h3>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#5f5344]">
            {medicalDisclaimerParagraphs.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
          <p className="mt-6 text-sm font-medium text-[#2b2218]">
            KIAN Privé — Your health. Your sanctuary. Your KIAN Privé.
          </p>
          <p className="mt-2 text-sm text-[#6f6251]">
            All medical services supervised by KIAN Privé board-certified physician. Packages expire after 1 year. Gift cards available.
          </p>
        </div>
        <div className="mt-6 rounded-2xl border border-[#1f7a7a42] bg-[linear-gradient(120deg,#eff9f9_0%,#e4f4f4_100%)] p-4">
          <p className="text-xs tracking-[0.18em] text-[#1b6568]">READY TO START</p>
          <p className="mt-2 text-sm text-[#28585a]">
            New and current members can begin with a physician-led consultation to match services, add-ons, and protocol intensity to your goals.
          </p>
          <Link href="/book-online" className="mt-3 inline-flex rounded-full bg-gradient-to-r from-[#1f7a7a] to-[#174f63] px-5 py-2 text-sm text-white">
            Start Membership Journey
          </Link>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Service Availability</h2>
        <p className="mb-6 max-w-3xl text-[#6f6251]">
          Availability notes extracted from your service menu so clients understand which services are in-home eligible.
        </p>
        <div className="rounded-3xl border border-[#b78d4b2d] bg-white p-6 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)]">
          <ul className="space-y-2">
            {serviceAccessNotes.map((note) => (
              <li key={note} className="text-[#5f5344]">
                {note}
              </li>
            ))}
          </ul>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Preferred Providers</h2>
        <p className="mb-6 max-w-3xl text-[#6f6251]">
          Trusted preferred providers integrated into the KIAN Privé care experience.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {preferredProviders.map((provider) => (
            <article key={provider.name} className="rounded-2xl border border-[#1f7a7a33] bg-[linear-gradient(160deg,#ffffff_20%,#f3fbfb_100%)] p-5 shadow-[0_18px_45px_-35px_rgba(20,58,58,0.45)]">
              <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">PROVIDER</p>
              <h3 className="mt-2 text-xl text-[#2b2218]">{provider.name}</h3>
              <div className="mt-4 rounded-xl border border-[#1f7a7a2e] bg-white p-3 shadow-[inset_0_0_0_1px_rgba(31,122,122,0.06)]">
                <div className="relative h-28 w-full overflow-hidden rounded-lg bg-[#f8fcfc]">
                {provider.logo ? (
                    <Image
                      src={provider.logo}
                      alt={`${provider.name} logo`}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-3"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs tracking-[0.18em] text-[#8f6f3e]">LOGO COMING SOON</span>
                    </div>
                )}
                </div>
              </div>
              <Link
                href={provider.href}
                className="mt-4 inline-flex rounded-full border border-[#1f7a7a66] bg-[#e9f7f7] px-4 py-2 text-xs tracking-[0.14em] text-[#1f6f75] transition hover:bg-[#dff3f2]"
              >
                Contact for Provider Details
              </Link>
            </article>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
