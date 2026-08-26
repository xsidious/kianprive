import type { ServiceDetail } from "@/lib/services/types";
import { icooneMediaGallery, icoonePrimaryImage } from "@/lib/media/icoone";
import { nutritionCardImage, nutritionPromoImage } from "@/lib/media/nutrition";
import {
  addOnLabPanels,
  coreLabPanels,
  ivPricingLines,
  labPanelPricingLines,
  pricedMenuLines,
  providerVisitMenu,
} from "@/lib/services/pricing-menus";

export type { ServiceDetail, ServiceContentSection, ServiceMediaItem } from "@/lib/services/types";

export const serviceCatalog: ServiceDetail[] = [
  {
    slug: "telemedicine",
    title: "Telemedicine",
    image: "/images/ConciergeHomevisit.jpeg",
    description:
      "Physician-led virtual consultations designed for continuity, convenience, and personalized wellness planning from wherever you are.",
    details: [
      "Board-certified providers review your goals, symptoms, labs, and treatment history.",
      "Protocols are personalized and adjusted through scheduled follow-up check-ins.",
    ],
    includes: ["Wellness planning", "Medication/protocol review", "Follow-up optimization"],
    guestPrice: 300,
    memberPrice: 240,
    pricing: [
      "Physician visits — in person",
      ...pricedMenuLines(providerVisitMenu.inPerson),
      "Physician visits — telemedicine",
      ...pricedMenuLines(providerVisitMenu.telemedicine),
      "Physician review: $50",
      "Nurse visits",
      ...pricedMenuLines(providerVisitMenu.nurse),
    ],
    availability: ["Virtual consultations available. In-person visits scheduled at the clinic."],
  },
  {
    slug: "comprehensive-bloodwork",
    title: "Blood Work",
    image: "/images/blood-work.webp",
    description:
      "Comprehensive blood work with physician interpretation—objective lab markers to guide your wellness, performance, and treatment plan with clarity you can track over time.",
    details: [
      "Panels evaluate metabolic, inflammatory, nutrient, hormone, and recovery-related markers based on your goals.",
      "Samples are collected in a professional lab setting; results are reviewed with your KIAN Privé physician.",
      "Findings are mapped into your ongoing protocol—nutrition, peptides, IV therapy, aesthetics, and recovery support.",
    ],
    includes: [
      "Comprehensive biomarker panels",
      "Physician review and interpretation",
      "Baseline assessment and progress tracking",
      "Protocol calibration support",
    ],
    guestPrice: 224,
    memberPrice: 179,
    pricing: ["Custom panels from $224. See named Wellness Tech panels for included tests."],
  },
  {
    slug: "lab-panel-essential",
    title: "Essential Wellness Panel",
    image: "/images/blood-work.webp",
    description:
      "Core diagnostic panel for general health screening—diabetes, kidney/liver function, cholesterol, thyroid, and infection markers.",
    details: [
      "Includes CBC with Differential, CMP, Lipid Panel, Hemoglobin A1C, TSH, and Urinalysis with Microscopy.",
      "Ideal baseline screening for wellness planning and early risk detection.",
      "Physician interpretation with protocol recommendations through KIAN Privé.",
    ],
    includes: [
      "CBC with Differential",
      "Comprehensive Metabolic Panel (CMP)",
      "Lipid Panel",
      "Hemoglobin A1C",
      "TSH",
      "Urinalysis with Microscopy",
      "Physician review",
    ],
    guestPrice: 224,
    memberPrice: 179,
    pricing: labPanelPricingLines(coreLabPanels[0]!),
  },
  {
    slug: "lab-panel-metabolic",
    title: "Metabolic Health Panel",
    image: "/images/blood-work.webp",
    description:
      "Essential Wellness markers plus insulin resistance, inflammation, cardiovascular risk, and nutritional deficiency screening.",
    details: [
      "Includes everything in Essential Wellness plus Fasting Insulin, Ferritin, Magnesium, hs-CRP, and Homocysteine.",
      "Designed to detect metabolic dysfunction and inflammatory burden earlier.",
    ],
    includes: [
      "All Essential Wellness tests",
      "Fasting Insulin",
      "Ferritin",
      "Magnesium",
      "High-Sensitivity CRP (hs-CRP)",
      "Homocysteine",
      "Physician review",
    ],
    guestPrice: 324,
    memberPrice: 259,
    pricing: labPanelPricingLines(coreLabPanels[1]!),
  },
  {
    slug: "lab-panel-hormone",
    title: "Hormone Balance Panel",
    image: "/images/blood-work.webp",
    description:
      "Thyroid optimization, menopause/andropause evaluation, fatigue workup, and hormone replacement monitoring.",
    details: [
      "Includes CBC, CMP, TSH, Free T3, Free T4, TPO Antibodies, Thyroglobulin, Estradiol, Total Testosterone, SHBG, and Ferritin.",
      "Supports hormone therapy planning and ongoing clinical monitoring.",
    ],
    includes: [
      "CBC & CMP",
      "TSH, Free T3, Free T4",
      "TPO Antibodies & Thyroglobulin",
      "Estradiol",
      "Total Testosterone & SHBG",
      "Ferritin",
      "Physician review",
    ],
    guestPrice: 449,
    memberPrice: 359,
    pricing: labPanelPricingLines(coreLabPanels[2]!),
  },
  {
    slug: "lab-panel-longevity",
    title: "Longevity Panel",
    image: "/images/blood-work.webp",
    description:
      "Metabolic Health foundation plus vitamin and nutrient markers for healthy aging, immune function, and cardiovascular risk reduction.",
    details: [
      "Includes Metabolic Health Panel plus Vitamin D, Vitamin B12, Magnesium, Homocysteine, and hs-CRP coverage for longevity optimization.",
    ],
    includes: [
      "All Metabolic Health Panel tests",
      "Vitamin D",
      "Vitamin B12",
      "Magnesium",
      "Homocysteine",
      "hs-CRP",
      "Physician review",
    ],
    guestPrice: 599,
    memberPrice: 479,
    pricing: labPanelPricingLines(coreLabPanels[3]!),
  },
  {
    slug: "lab-panel-executive",
    title: "Executive Brain & Longevity Panel",
    image: "/images/blood-work.webp",
    description:
      "Comprehensive executive assessment spanning cardiovascular, metabolic, endocrine, inflammatory, nutritional, and brain-health markers.",
    details: [
      "Full suite including CBC, CMP, lipids, A1C, insulin, thyroid panel with antibodies, vitamins, ferritin, magnesium, hs-CRP, ESR, homocysteine, estradiol, testosterone, SHBG, and urinalysis.",
      "Built for high-performance clients who want a complete clinical baseline.",
    ],
    includes: [
      "CBC, CMP, Lipid Panel, A1C, Insulin",
      "TSH, Free T3, Free T4, TPO, Thyroglobulin",
      "Vitamin D & B12, Ferritin, Magnesium",
      "hs-CRP, ESR, Homocysteine",
      "Estradiol, Testosterone, SHBG",
      "Urinalysis",
      "Physician review",
    ],
    guestPrice: 1099,
    memberPrice: 879,
    pricing: labPanelPricingLines(coreLabPanels[4]!),
  },
  {
    slug: "lab-panel-brain",
    title: "Brain Health Panel",
    image: "/images/blood-work.webp",
    description:
      "Targeted panel for cognitive concerns, concussion history, migraines, mood disorders, or neurological symptoms.",
    details: [
      addOnLabPanels[0]!.tests,
      addOnLabPanels[0]!.purpose,
      "Physician interpretation with protocol recommendations through KIAN Privé.",
    ],
    includes: addOnLabPanels[0]!.tests.split(", "),
    guestPrice: addOnLabPanels[0]!.guest,
    memberPrice: addOnLabPanels[0]!.member,
    pricing: labPanelPricingLines(addOnLabPanels[0]!),
  },
  {
    slug: "lab-panel-weight",
    title: "Weight Management Panel",
    image: "/images/blood-work.webp",
    description: "Metabolic and thyroid baseline useful before starting GLP-1 or other weight management therapies.",
    details: [addOnLabPanels[1]!.tests, addOnLabPanels[1]!.purpose],
    includes: addOnLabPanels[1]!.tests.split(", "),
    guestPrice: addOnLabPanels[1]!.guest,
    memberPrice: addOnLabPanels[1]!.member,
    pricing: labPanelPricingLines(addOnLabPanels[1]!),
  },
  {
    slug: "lab-panel-hormone-optimization",
    title: "Hormone Optimization Panel",
    image: "/images/blood-work.webp",
    description: "Focused hormone and thyroid markers designed for patients undergoing hormone replacement therapy.",
    details: [addOnLabPanels[2]!.tests, addOnLabPanels[2]!.purpose, addOnLabPanels[2]!.note ?? ""],
    includes: addOnLabPanels[2]!.tests.split(", "),
    guestPrice: addOnLabPanels[2]!.guest,
    memberPrice: addOnLabPanels[2]!.member,
    pricing: labPanelPricingLines(addOnLabPanels[2]!),
  },
  {
    slug: "lab-panel-cardio",
    title: "Cardiovascular Risk Panel",
    image: "/images/blood-work.webp",
    description:
      "Targeted cardiovascular risk screening. Troponin is included only when clinically indicated, not as routine screening.",
    details: [addOnLabPanels[3]!.tests, addOnLabPanels[3]!.purpose, addOnLabPanels[3]!.note ?? ""],
    includes: addOnLabPanels[3]!.tests.split(", "),
    guestPrice: addOnLabPanels[3]!.guest,
    memberPrice: addOnLabPanels[3]!.member,
    pricing: labPanelPricingLines(addOnLabPanels[3]!),
  },
  {
    slug: "icoone-laser",
    title: "Icoone® Lymphatic Drainage",
    image: icoonePrimaryImage,
    gallery: icooneMediaGallery,
    description:
      "Physician-guided Icoone® lymphatic drainage using Roboderm® microstimulation to support detox, circulation, and recovery—while helping reduce puffiness, refine contour, and improve skin quality.",
    details: [
      "Robotic microstimulation activates superficial and deep lymphatic pathways for fluid balance and tissue comfort.",
      "Sessions are performed in a compression body suit for precise, full-body or targeted face, neck, décolleté, and body protocols.",
      "Ideal for swelling support, post-travel recovery, contour refinement, and inflammation reduction within your wellness plan.",
    ],
    includes: [
      "Lymphatic drainage and circulatory support",
      "Detox, puffiness, and fluid-retention support",
      "Cellulite and contouring support",
      "Pain, inflammation, and recovery support",
      "Face, neck, décolleté, and full-body targeting",
    ],
    guestPrice: 195,
    memberPrice: 156,
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
    ],
    availability: ["Facility-based service (not offered in-home)."],
  },
  {
    slug: "iv-therapy",
    title: "IV Therapy",
    image: "/images/heroes/iv-hero.jpg",
    description:
      "Physician-guided IV protocols deliver targeted nutrients and hydration to support immunity, energy, recovery, and cellular performance.",
    details: [
      "IV infusions are selected and dosed based on goals, symptoms, and clinical context.",
      "Can be paired with recovery, immunity, and performance protocols.",
    ],
    includes: ["Hydration support", "Nutrient replenishment", "Recovery and energy support"],
    guestPrice: 230,
    memberPrice: 184,
    pricing: ivPricingLines(),
  },
  {
    slug: "nutrition",
    title: "Nutrition Services",
    image: nutritionCardImage,
    promoImage: nutritionPromoImage,
    description:
      "With over 30 years in nutrition, Cherie Johnson brings a refined, holistic approach to modern wellness. Organic living. Sustainable habits. Lifelong vitality.",
    details: [
      "Certified Nutritionist · Wellness Educator — Cherie Johnson",
      "Private Virtual Consultations Available",
      "Nourish your body. Support your wellness. Elevate your future.",
    ],
    includes: [
      "Blood pressure balance",
      "Inflammation & autoimmune wellness",
      "Diabetes-conscious nutrition",
      "Fibromyalgia support",
      "Digestive & gut balance",
      "Heart-focused living",
      "Gentle detox lifestyle guidance",
    ],
    pricing: [
      "Initial Nutrition Consultation & Meal Plan — wellness assessment, personalized recommendations, customized meal guidance, lifestyle support",
      "Follow-up session: $150",
      "4-session package: $500",
      "8-session package: $950",
    ],
    guestPrice: 150,
    memberPrice: 120,
    contentSections: [
      {
        title: "Elevate Your Wellness",
        paragraphs: [
          "With over 30 years in nutrition, Cherie Johnson brings a refined, holistic approach to modern wellness.",
          "Organic living. Sustainable habits. Lifelong vitality.",
        ],
      },
      {
        title: "Personalized wellness support for",
        bullets: [
          "Blood pressure balance",
          "Inflammation & autoimmune wellness",
          "Diabetes-conscious nutrition",
          "Fibromyalgia support",
          "Digestive & gut balance",
          "Heart-focused living",
          "Gentle detox lifestyle guidance",
        ],
      },
      {
        title: "Private Virtual Consultations Available",
        paragraphs: [
          "Nourish your body. Support your wellness. Elevate your future.",
        ],
      },
      {
        title: "Our Nutritional Consultation Services",
        paragraphs: [
          "Holistic, culturally aware nutrition support for women and families—personalized consultations, meal planning, and sustainable wellness habits coordinated with your KIAN Privé care team when needed.",
        ],
        bullets: [
          "Personalized nutrition consultations",
          "Meal planning support",
          "Women's wellness nutrition",
          "Family nutrition guidance",
        ],
      },
    ],
  },
  {
    slug: "microneedling-with-exosomes",
    title: "Microneedling with Exosomes",
    image: "/images/microneedlingg.webp",
    description:
      "Advanced skin rejuvenation treatment that supports collagen production and visible texture improvement through regenerative signaling.",
    details: ["Microneedling combined with exosome-based regenerative support for skin renewal."],
    pricing: ["Single session: $600", "4-session package: $1,800", "5-session package: $2,700", "10-session package: $5,000"],
    guestPrice: 600,
    memberPrice: 480,
    includes: ["Texture refinement", "Tone support", "Fine-line and radiance improvement"],
  },
  {
    slug: "hair-restoration",
    title: "Hair Restoration",
    image: "/images/HairReatorationpicture.jpeg",
    description:
      "Physician-guided hair restoration programs combining diagnostics and regenerative options to support healthier density and scalp vitality.",
    details: [
      "Programs are personalized based on scalp assessment, medical history, and restoration goals.",
      "Treatment planning may include regenerative pathways, protocol sequencing, and follow-up optimization.",
    ],
    includes: ["Scalp and follicle health support", "Density-focused treatment planning", "Progress tracking and follow-up care"],
    availability: ["Physician consultation required before treatment planning."],
    gallery: [
      {
        src: "/images/results/hair-before-after.webp",
        alt: "Hair restoration before and after — lymphatic drainage and exosomes",
        caption: "Lymphatic drainage and exosomes — noticeable growth and thickness after 4 days.",
      },
    ],
  },
  {
    slug: "korean-organic-skincare",
    title: "Korean Organic Skincare",
    image: "/images/facial-treatments.jpg",
    description:
      "Luxury preventive skincare protocols rooted in Korean methodology and clean organic formulations for barrier health and long-term skin quality.",
    details: ["Preventive, hydration-focused skincare philosophy designed for skin longevity and barrier integrity."],
    pricing: ["Single facial: $195", "4-session facial package: $725"],
    guestPrice: 195,
    memberPrice: 156,
    includes: ["Barrier support", "Hydration protocols", "Gentle clinical-luxury skincare"],
    contentSections: [
      {
        title: "Approach",
        paragraphs: [
          "Preventive, hydration-focused skincare philosophy designed for skin longevity and barrier integrity.",
          "Protocols are coordinated with clinical guidance to align skin goals with inflammation, recovery, and lifestyle factors.",
        ],
      },
      {
        title: "What This Program Supports",
        bullets: ["Barrier support", "Hydration protocols", "Gentle clinical-luxury skincare"],
      },
    ],
  },
  {
    slug: "facial-aesthetics",
    title: "Medical Aesthetics",
    image: "/images/MedicalAestheticss.jpeg",
    description:
      "Precision aesthetic services focused on natural-looking refinement and skin-forward outcomes in a physician-guided setting.",
    details: ["Facial aesthetics plans are structured to preserve natural expression while improving harmony and confidence."],
    guestPrice: 310,
    memberPrice: 248,
    pricing: ["From $310"],
    availability: ["Book online or request provider-specific scheduling through concierge."],
  },
  {
    slug: "glp1-peptides",
    title: "Compound Therapy",
    image: "/images/Peptidesandexosomes.jpeg",
    showPeptidesExperience: true,
    description:
      "Physician-prescribed compound therapy with GLP-1 and peptide protocols. Browse the catalog on Privé Therapeutics. These therapies are not sold in the KIAN retail shop—they are prescribed as part of a wellness plan, including the first order and every refill.",
    details: [
      "Complete secure intake for physician review of your history, labs, and goals.",
      "If clinically indicated, a KIAN Privé physician prescribes a personalized protocol.",
      "Initial orders and refills are fulfilled only under an active prescription as part of your wellness plan.",
    ],
    membershipNotes: [
      "Includes monthly pathway options and follow-up optimization.",
      "Additional protocol add-ons are available after clinical review.",
    ],
    guestPrice: 100,
    memberPrice: 80,
    pricing: pricedMenuLines(providerVisitMenu.peptide),
    availability: ["Physician-supervised protocols; route and dose selected after evaluation."],
    contentSections: [
      {
        title: "GLP-1 & Metabolic Agents",
        paragraphs: [
          "Semaglutide and tirzepatide pathways are structured with physician supervision, dose titration, and periodic progress review.",
        ],
      },
      {
        title: "Important Notice",
        paragraphs: [
          "For professional and prescribed use only under an active patient-practitioner relationship.",
        ],
      },
    ],
  },
  {
    slug: "mindtap",
    title: "MindTap",
    image: "/images/heroes/meditation.jpg",
    description:
      "Focused cognitive conditioning and mental performance coaching integrated into your concierge wellness plan.",
    includes: ["Focus and composure training", "Performance psychology support", "Cognitive conditioning"],
    availability: ["Different-location partner service; facility-only partner workflow."],
  },
  {
    slug: "beauty-hair-nails",
    title: "Beauty (Hair and Nails)",
    image: "/images/salonpics/salon-reception.png",
    gallery: [
      {
        src: "/images/salonpics/salon-reception.png",
        alt: "Beauty salon reception lounge with marble island and pendant lights",
      },
      {
        src: "/images/salonpics/salon-styling.png",
        alt: "Salon styling floor with marble vanity and service stations",
      },
      {
        src: "/images/salonpics/salon-manicure.png",
        alt: "Manicure suite overlooking the salon floor",
      },
      {
        src: "/images/salonpics/salon-pedicure.png",
        alt: "Pedicure station with luxury chair and towel cart",
      },
    ],
    description:
      "Salon-partner beauty services including hair, nails, lashes, and skincare in a coordinated luxury setting with your KIAN Privé care team.",
    details: [
      "Coordinated with your wellness and aesthetics plan for a unified luxury experience.",
      "Hair, nail, lash, and skincare services through trusted salon partners.",
    ],
    includes: ["Hair services", "Nails and lashes", "Skincare coordination", "Luxury salon partner access"],
    availability: ["Partner scheduling coordinated through KIAN Privé concierge."],
  },
  {
    slug: "inbody-scan",
    title: "InBody Scan — Body Composition",
    image: "/images/heroes/spa-massage.jpg",
    description:
      "Comprehensive, non-invasive body composition analysis—muscle mass, body fat, visceral fat, hydration, and metabolic insights reviewed with your physician.",
    details: [
      "Clinical-precision scan measuring muscle, fat distribution, visceral fat, and hydration.",
      "Results integrated into your physician wellness roadmap and membership progress tracking.",
    ],
    includes: [
      "Body composition report",
      "Physician roadmap integration",
      "Progress tracking over time",
    ],
    pricing: ["Single scan: $30"],
    guestPrice: 30,
    memberPrice: 0,
    availability: ["Facility-based; coordinated with consultations and memberships."],
  },
  {
    slug: "power-plate",
    title: "Power Plate — Vibration Therapy",
    image: "/images/heroes/spa-treatment-room.jpg",
    description:
      "Whole-body vibration therapy using Precision Vibration Technology™ to support recovery, circulation, balance, and metabolic performance.",
    details: [
      "Muscles contract and relax up to 50 times per second for rapid recovery support.",
      "Enhances circulation, lymphatic flow, balance, bone density, and fat metabolism.",
    ],
    includes: [
      "Whole-body vibration session",
      "Recovery and circulation support",
      "Balance and neuromuscular support",
    ],
    pricing: ["Single session: $25"],
    guestPrice: 25,
    memberPrice: 0,
    availability: ["Facility-based; available with membership and select protocols."],
  },
  {
    slug: "physician-visit",
    title: "Physician Visit",
    image: "/images/ConciergeHomevisit.jpeg",
    description:
      "In-person physician consultation for new patients and follow-ups—labs, protocols, and concierge care planning at the clinic.",
    details: [
      "New patient visits include history, goals, and treatment planning with your KIAN Privé physician.",
      "Follow-ups refine protocols, review labs, and adjust medications or wellness plans.",
    ],
    includes: ["Clinical evaluation", "Protocol planning", "Lab and medication review"],
    guestPrice: 350,
    memberPrice: 280,
    pricing: pricedMenuLines(providerVisitMenu.inPerson),
    availability: ["In-clinic physician visits. Virtual options available under Telemedicine."],
  },
];

export function getServiceBySlug(slug: string) {
  return serviceCatalog.find((service) => service.slug === slug) ?? null;
}

export function getServiceSlugs() {
  return serviceCatalog.map((service) => service.slug);
}
