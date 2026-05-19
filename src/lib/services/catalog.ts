import type { ServiceDetail } from "@/lib/services/types";

export type { ServiceDetail, ServiceContentSection } from "@/lib/services/types";

export const serviceCatalog: ServiceDetail[] = [
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
      "Advanced Roboderm micro-stimulation to activate lymphatic flow, stimulate collagen and elastin, and support contouring, recovery, and skin quality.",
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
    requiresLogin: true,
    showPeptidesExperience: true,
    description:
      "Physician-supervised metabolic and peptide protocols are personalized to your goals and priced individually.",
    details: [
      "Includes injectable and sublingual pathway options based on clinical assessment.",
      "Most side effects are GI-related or injection-site related and are often managed by titration and follow-up.",
    ],
    membershipNotes: [
      "Peptides include monthly pathway options.",
      "Additional protocol add-ons are released separately.",
    ],
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
    image: "/images/beauty.avif",
    description:
      "Focused cognitive conditioning and mental performance coaching integrated into your concierge wellness plan.",
    includes: ["Focus and composure training", "Performance psychology support", "Cognitive conditioning"],
    availability: ["Different-location partner service; facility-only partner workflow."],
  },
];

export function getServiceBySlug(slug: string) {
  return serviceCatalog.find((service) => service.slug === slug) ?? null;
}

export function getServiceSlugs() {
  return serviceCatalog.map((service) => service.slug);
}
