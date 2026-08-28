import type { ServiceListingItem } from "@/lib/services/types";
import { serviceCatalog } from "@/lib/services/catalog";

function bySlug(slug: string) {
  const service = serviceCatalog.find((entry) => entry.slug === slug);
  if (!service) throw new Error(`Missing catalog service: ${slug}`);
  return service;
}

/** Slugs omitted from the public services menu (shown under partner add-ons or retired). */
export const hiddenServiceMenuSlugs = new Set([
  "inbody-scan",
  "power-plate",
  "mindtap",
  "beauty-hair-nails",
]);

export type ServiceMenuCategory = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  slugs: string[];
};

export const serviceMenuCategories: ServiceMenuCategory[] = [
  {
    id: "face-body-wellness",
    eyebrow: "FACE, BODY & WELLNESS",
    title: "Face, Body & Wellness",
    description:
      "Aesthetic, skincare, body contouring, nutrition, and restorative treatments designed for visible refinement and whole-body wellness.",
    slugs: [
      "icoone-laser",
      "korean-organic-skincare",
      "microneedling-with-exosomes",
      "facial-aesthetics",
      "hair-restoration",
      "nutrition",
    ],
  },
  {
    id: "physician",
    eyebrow: "PHYSICIAN SERVICES",
    title: "Physician Services",
    description:
      "Physician-led telemedicine, diagnostics, and clinical wellness pathways—including blood work review and IV therapy planning.",
    slugs: [
      "telemedicine",
      "physician-visit",
      "comprehensive-bloodwork",
      "lab-panel-essential",
      "lab-panel-metabolic",
      "lab-panel-hormone",
      "lab-panel-longevity",
      "lab-panel-executive",
      "lab-panel-brain",
      "lab-panel-weight",
      "lab-panel-hormone-optimization",
      "lab-panel-cardio",
      "iv-therapy",
    ],
  },
  {
    id: "compounding-peptides",
    eyebrow: "COMPOUNDING & PEPTIDES",
    title: "Compound Therapy",
    description:
      "Physician-supervised compound therapy spanning GLP-1, peptide, and compounded wellness protocols with intake, approval, and personalized treatment planning.",
    slugs: ["glp1-peptides"],
  },
];

export function servicesForMenuCategory(category: ServiceMenuCategory): ServiceListingItem[] {
  return category.slugs.map((slug) => bySlug(slug));
}

export const categorizedMenuServices: ServiceListingItem[] = serviceMenuCategories.flatMap((category) =>
  servicesForMenuCategory(category),
);

export const allCatalogServices: ServiceListingItem[] = serviceCatalog.map((entry) => entry);

export const coreServices: ServiceListingItem[] = [
  bySlug("telemedicine"),
  bySlug("physician-visit"),
  bySlug("comprehensive-bloodwork"),
  bySlug("lab-panel-essential"),
  bySlug("lab-panel-metabolic"),
  bySlug("lab-panel-hormone"),
  bySlug("lab-panel-longevity"),
  bySlug("lab-panel-executive"),
  bySlug("lab-panel-brain"),
  bySlug("lab-panel-weight"),
  bySlug("lab-panel-hormone-optimization"),
  bySlug("lab-panel-cardio"),
  bySlug("icoone-laser"),
  bySlug("iv-therapy"),
  bySlug("nutrition"),
  bySlug("microneedling-with-exosomes"),
  bySlug("hair-restoration"),
  bySlug("korean-organic-skincare"),
  bySlug("facial-aesthetics"),
  bySlug("glp1-peptides"),
  bySlug("inbody-scan"),
  bySlug("power-plate"),
];

export const wellnessTechnologyServices: ServiceListingItem[] = [
  bySlug("inbody-scan"),
  bySlug("power-plate"),
];

export const sameLocationAddOns: ServiceListingItem[] = [
  {
    ...bySlug("holistic-salt-therapy"),
    partnerName: "Holistic Salt Therapy Center",
    partnerLogo: "/images/providers/holistic-salt-therapy-center.png",
    externalBookingUrl: "/contact",
    isPartnerService: true,
  },
];

export const differentLocationAddOns: ServiceListingItem[] = [];

export const gymServices: ServiceListingItem[] = [];

export const partnerAddOnServices: ServiceListingItem[] = [
  { ...bySlug("mindtap"), partnerName: "MindTap", partnerLogo: "/images/providers/mindtap.png", externalBookingUrl: "/contact", isPartnerService: true },
  {
    ...bySlug("beauty-hair-nails"),
    partnerName: "Coiffure and Coffee",
    partnerLogo: "/images/providers/coiffure-and-coffee.png",
    externalBookingUrl: "/contact",
    isPartnerService: true,
  },
  ...sameLocationAddOns,
  ...gymServices,
  ...differentLocationAddOns,
];

export const serviceAccessNotes = [
  "In-home and on-location services are available for most treatments, bringing the full KIAN Privé experience directly to you.",
  "Icoone® Lymphatic Drainage, Holistic Salt Therapy, and MINDTAP coaching sessions are available at our facility only and are not offered as in-home services.",
];

export const preferredProviders = [
  { name: "Holistic Salt Therapy", logo: "/images/providers/holistic-salt-therapy-center.png", href: "/services/holistic-salt-therapy" },
  { name: "MindTap", logo: "/images/providers/mindtap.png", href: "/contact" },
];

export const featuredProviderLogos = [
  { name: "Bloodwork", logo: "/images/Bloodwork.jpeg" },
  { name: "Medical Aesthetics", logo: "/images/MedicalAestheticss.jpeg" },
  { name: "Hair Removal", logo: "/images/HairReatorationpicture.jpeg" },
];

export const brandIntro = {
  tagline: "Luxury Wellness. Uncompromising Care. Exclusively Yours.",
  lead:
    "KIAN Privé is a concierge wellness company dedicated to delivering the finest services for a truly private wellness experience provided by dedicated professionals at your location or ours.",
  team:
    "We bring together a distinguished team of physicians, registered nurses, licensed aestheticians, certified nutrition experts, and wellness specialists to deliver a seamless fusion of clinical medicine, advanced skincare, regenerative therapies, and luxury wellness — tailored to every individual.",
};
