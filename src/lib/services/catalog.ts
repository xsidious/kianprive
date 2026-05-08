export type ServiceDetail = {
  slug: string;
  title: string;
  image: string;
  description: string;
  requiresLogin?: boolean;
  details?: string[];
  includes?: string[];
  pricing?: string[];
  availability?: string[];
  contentSections?: Array<{
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }>;
};

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
  },
  {
    slug: "comprehensive-bloodwork",
    title: "Comprehensive Bloodwork",
    image: "/images/medicalaesthetics.avif",
    description: "Detailed lab analysis and physician interpretation to build your personalized care roadmap.",
    includes: ["Baseline biomarker assessment", "Progress tracking", "Protocol calibration support"],
  },
  {
    slug: "icoone-laser",
    title: "Icoone® Laser",
    image: "/images/icoone.avif",
    description:
      "Advanced Roboderm micro-stimulation to support lymphatic flow, contouring, recovery, and skin quality.",
    pricing: [
      "40 min single: $175",
      "50 min single: $195",
      "80 min single: $325",
      "40 min 10-session package: $1,488",
      "50 min 10-session package: $1,658",
      "80 min 10-session package: $2,763",
    ],
    availability: ["Facility-based service (not offered in-home)."],
  },
  {
    slug: "iv-therapy",
    title: "IV Therapy",
    image: "/images/wellness.avif",
    description:
      "Physician-guided IV protocols deliver targeted nutrients and hydration to support immunity, energy, and recovery.",
    includes: ["Hydration support", "Nutrient replenishment", "Recovery and energy support"],
  },
  {
    slug: "nutrition",
    title: "Nutrition",
    image: "/images/nutrition.avif",
    description: "Science-based nutrition support tailored to your goals with practical, sustainable planning.",
    pricing: ["Single session: $150", "4-session package: $500", "8-session package: $950"],
  },
  {
    slug: "microneedling-with-exosomes",
    title: "Microneedling with Exosomes",
    image: "/images/facial-treatments.jpg",
    description: "Advanced skin rejuvenation supporting collagen production and visible texture improvement.",
    pricing: ["Single session: $600", "4-session package: $1,800", "10-session package: $5,000"],
  },
  {
    slug: "korean-organic-skincare",
    title: "Korean Organic Skincare",
    image: "/images/esthetics.avif",
    description: "Luxury preventive skincare rooted in Korean methodology and clean formulations.",
    pricing: ["Single facial: $195", "4-session facial package: $725"],
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
    description: "Precision aesthetic services focused on natural-looking refinement and skin-forward outcomes.",
  },
  {
    slug: "glp1-peptides",
    title: "GLP-1s & Peptides",
    image: "/images/nutrition.avif",
    requiresLogin: true,
    description:
      "Physician-supervised metabolic and peptide protocols are personalized to your goals and clinical context.",
    contentSections: [
      {
        title: "GLP-1 & Metabolic Agents",
        paragraphs: [
          "Semaglutide and tirzepatide pathways are structured with physician supervision, dose titration, and periodic progress review.",
          "Most side effects are gastrointestinal and dose-dependent; protocol pacing is adjusted for tolerability.",
        ],
      },
      {
        title: "Sublingual Formulations",
        paragraphs: [
          "Needle-free formulation options are available for selected protocols.",
          "Lower peak exposure may improve tolerability for some clients while maintaining program adherence.",
        ],
      },
      {
        title: "Peptide & Regenerative Pathways",
        paragraphs: [
          "Programs can include recovery-focused, performance-oriented, and skin-support peptide strategies based on clinical fit.",
          "Each pathway is reviewed against contraindications, treatment goals, and timeline expectations.",
        ],
      },
      {
        title: "Combination Protocols",
        paragraphs: [
          "Combination pathways are introduced carefully due to additive effects and sensitivity differences.",
          "Start-low and monitor-close strategy is used for safety and measurable outcomes.",
        ],
      },
      {
        title: "Important Notice",
        paragraphs: [
          "For professional and prescribed use only under an active patient-practitioner relationship.",
          "All formulations and recommendations are individualized after qualified evaluation.",
        ],
      },
    ],
  },
  {
    slug: "mindtap",
    title: "MindTap",
    image: "/images/beauty.avif",
    description: "Cognitive conditioning and mental performance coaching integrated into your wellness plan.",
    availability: ["Different-location partner service; facility-only partner workflow."],
  },
];

export function getServiceBySlug(slug: string) {
  return serviceCatalog.find((service) => service.slug === slug) ?? null;
}
