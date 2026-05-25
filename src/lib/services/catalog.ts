import type { ServiceDetail } from "@/lib/services/types";
import { icooneMediaGallery, icoonePrimaryImage } from "@/lib/media/icoone";
import { nutritionPromoImage } from "@/lib/media/nutrition";

export type { ServiceDetail, ServiceContentSection, ServiceMediaItem } from "@/lib/services/types";

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
    image: nutritionPromoImage,
    description:
      "Cherie Johnson, Certified Nutritionist & Wellness Educator, brings over 30 years of experience in holistic, culturally aware nutrition—private virtual consultations available.",
    details: [
      "Personalized consultations that honor your health history, goals, and dietary needs—not one-size-fits-all plans.",
      "Practical meal guidance and sustainable habit-building designed for long-term wellness, not quick fixes.",
      "Coordination with KIAN Privé physician-led care when your wellness plan benefits from clinical alignment.",
    ],
    includes: [
      "One-on-one personalized consultations",
      "Individualized wellness and meal planning support",
      "Holistic and realistic nutrition guidance",
      "Sustainable lifestyle recommendations",
      "Compassionate accountability and encouragement",
      "A judgment-free wellness experience",
    ],
    pricing: [
      "Initial Nutrition Consultation & Meal Plan — wellness assessment, personalized recommendations, customized meal guidance, lifestyle support",
      "Follow-up session: $150",
      "4-session package: $500",
      "8-session package: $950",
    ],
    contentSections: [
      {
        title: "Our Approach",
        paragraphs: [
          "We believe wellness starts with nourishment, balance, and realistic lifestyle changes that fit your everyday life. Our approach is rooted in holistic nutrition, compassionate support, and culturally aware guidance designed specifically for women and families.",
          "Whether you are navigating hormonal changes, digestive concerns, blood sugar management, or simply looking to feel healthier and more energized, we provide personalized nutrition support tailored to your unique needs and goals.",
        ],
      },
      {
        title: "Meet Cherie Johnson",
        paragraphs: [
          "Cherie Johnson is a certified nutritionist, wellness educator, actress, producer, and entrepreneur with over 30 years in nutrition. She brings a refined, holistic approach rooted in organic living, sustainable habits, and lifelong vitality.",
          "Through practical nutrition education and individualized support, Cherie helps women and families build sustainable habits—not quick fixes—in a safe, judgment-free space.",
          "Private virtual consultations available. Nourish your body. Support your wellness. Elevate your future.",
        ],
      },
      {
        title: "Our Nutritional Consultation Services",
        paragraphs: [
          "Every body is different. During your consultation, we take the time to understand your health history, lifestyle, wellness goals, and dietary needs to create a customized plan designed specifically for you.",
        ],
        bullets: [
          "Personalized Nutrition Consultations — health history, lifestyle, and goal-based planning",
          "Meal Planning Support — realistic guidance tailored to your schedule and healing goals",
          "Women's Wellness Nutrition — hormone balance, PCOS, blood sugar, weight, gut health, energy, pre- and post-pregnancy wellness",
          "Family Nutrition Guidance — balanced routines and practical strategies for busy households",
        ],
      },
      {
        title: "Areas of Nutritional Support",
        bullets: [
          "Blood pressure balance",
          "Inflammation and autoimmune wellness",
          "Diabetes-conscious nutrition",
          "Fibromyalgia support",
          "Digestive and gut balance",
          "Heart-focused living",
          "Gentle detox lifestyle guidance",
          "Pre-pregnancy and post-pregnancy nutrition",
          "Weight management and hormone balance",
        ],
      },
      {
        title: "Why Choose Cherie Johnson Nutrition Services?",
        bullets: [
          "Holistic and culturally aware approach",
          "Realistic nutrition plans for real life",
          "Focus on sustainable lifestyle changes",
          "Supportive coaching and wellness guidance",
          "Personalized attention for every client",
          "Passionate about empowering women and families",
        ],
      },
      {
        title: "Begin Your Wellness Journey",
        paragraphs: [
          "Your health journey deserves support, compassion, and a plan designed specifically for you. Let Cherie Johnson Nutrition Services help you create healthier habits that nourish your body and support your overall wellness.",
        ],
      },
    ],
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
