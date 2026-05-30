import type { ServiceDetail } from "@/lib/services/types";
import { icooneMediaGallery, icoonePrimaryImage } from "@/lib/media/icoone";
import { nutritionCardImage, nutritionPromoImage } from "@/lib/media/nutrition";

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
    availability: ["Virtual consultations available."],
  },
  {
    slug: "comprehensive-bloodwork",
    title: "Blood Work",
    image: "/images/blood-work.png",
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
    image: "/images/microneedling.jpg",
    description:
      "Advanced skin rejuvenation treatment that supports collagen production and visible texture improvement through regenerative signaling.",
    details: ["Microneedling combined with exosome-based regenerative support for skin renewal."],
    pricing: ["Single session: $600", "4-session package: $1,800", "5-session package: $2,700", "10-session package: $5,000"],
    includes: ["Texture refinement", "Tone support", "Fine-line and radiance improvement"],
  },
  {
    slug: "hair-restoration",
    title: "Hair Restoration",
    image: "/images/hairrestoration.jpeg",
    description:
      "Physician-guided hair restoration programs combining diagnostics and regenerative options to support healthier density and scalp vitality.",
    details: [
      "Programs are personalized based on scalp assessment, medical history, and restoration goals.",
      "Treatment planning may include regenerative pathways, protocol sequencing, and follow-up optimization.",
    ],
    includes: ["Scalp and follicle health support", "Density-focused treatment planning", "Progress tracking and follow-up care"],
    availability: ["Physician consultation required before treatment planning."],
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
  {
    slug: "beauty-hair-nails",
    title: "Beauty (Hair and Nails)",
    image: "/images/stock/service-beauty-salon.jpg",
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
    image: "/images/stock/service-wellness.jpg",
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
      "Membership-tier complimentary access",
    ],
    pricing: [
      "Single scan (non-member): $30",
      "Included monthly in membership Tiers 1–3",
      "4× monthly included in Tier 4",
    ],
    availability: ["Facility-based; coordinated with consultations and memberships."],
  },
  {
    slug: "power-plate",
    title: "Power Plate — Vibration Therapy",
    image: "/images/stock/service-esthetics.jpg",
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
      "Complimentary with active membership",
    ],
    pricing: ["Single session (non-member): $25", "Complimentary with any active membership"],
    availability: ["Facility-based; available with membership and select protocols."],
  },
];

export function getServiceBySlug(slug: string) {
  return serviceCatalog.find((service) => service.slug === slug) ?? null;
}

export function getServiceSlugs() {
  return serviceCatalog.map((service) => service.slug);
}
