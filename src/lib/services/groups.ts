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
    slugs: ["telemedicine", "comprehensive-bloodwork", "iv-therapy"],
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
  bySlug("comprehensive-bloodwork"),
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
    slug: "salt-therapy",
    title: "Salt Therapy",
    image: "/images/holistic-salt-therapy/photo-1.jpg",
    gallery: [
      {
        src: "/images/holistic-salt-therapy/photo-3.jpg",
        alt: "Holistic Salt Therapy Center kids halotherapy play room",
      },
      {
        src: "/images/holistic-salt-therapy/photo-7.jpg",
        alt: "Holistic Salt Therapy Center halotherapy wellness information",
      },
      {
        src: "/images/holistic-salt-therapy/photo-2.jpg",
        alt: "Holistic Salt Therapy Center reception and waiting area",
      },
    ],
    partnerName: "Holistic Therapy Place",
    partnerLogo: "/images/providers/holistic-salt-therapy-center.png",
    externalBookingUrl: "/contact",
    isPartnerService: true,
    description:
      "Partner add-on from Holistic Therapy Place for respiratory wellness, inflammation support, and holistic recovery.",
    includes: ["Respiratory support", "Inflammation support", "Recovery protocol integration", "+15% partner discount (pending confirmation)"],
    availability: ["Facility-based service (not offered in-home)."],
  },
  {
    slug: "pemf",
    title: "PEMF",
    image: "/images/holistic-salt-therapy/photo-6.jpg",
    gallery: [
      {
        src: "/images/holistic-salt-therapy/photo-4.jpg",
        alt: "Holistic Salt Therapy Center infrared sauna and PEMF session room",
      },
      {
        src: "/images/holistic-salt-therapy/photo-5.jpg",
        alt: "Holistic Salt Therapy Center wellness facility interior",
      },
    ],
    partnerName: "Holistic Therapy Place",
    partnerLogo: "/images/providers/holistic-salt-therapy-center.png",
    externalBookingUrl: "/contact",
    isPartnerService: true,
    description:
      "Partner add-on from Holistic Therapy Place designed for cellular recharge, pain support, and performance recovery.",
    includes: ["Cellular recharge", "Pain support", "Performance recovery", "+15% partner discount (pending confirmation)"],
    availability: ["Same-location partner add-on."],
  },
  {
    slug: "far-infrared",
    title: "Far Infrared",
    image: "/images/holistic-salt-therapy/photo-4.jpg",
    gallery: [
      {
        src: "/images/holistic-salt-therapy/photo-6.jpg",
        alt: "Holistic Salt Therapy Center far infrared sauna interior",
      },
      {
        src: "/images/holistic-salt-therapy/photo-2.jpg",
        alt: "Holistic Salt Therapy Center reception and waiting area",
      },
    ],
    partnerName: "Holistic Therapy Place",
    partnerLogo: "/images/providers/holistic-salt-therapy-center.png",
    externalBookingUrl: "/contact",
    isPartnerService: true,
    description:
      "Partner add-on from Holistic Therapy Place with infrared sessions to support circulation, detox support, and deep relaxation.",
    includes: ["Detox support", "Deep tissue warmth", "Recovery and relaxation support", "+15% partner discount (pending confirmation)"],
    availability: ["Same-location partner add-on."],
  },
];

export const differentLocationAddOns: ServiceListingItem[] = [];

export const gymServices: ServiceListingItem[] = [
  {
    slug: "adapt-fitness",
    title: "Adapt",
    image: "/images/stock/service-beauty-salon.jpg",
    partnerName: "Adapt",
    partnerLogo: "/images/providers/vcs-vitamin-c-to-sea.png",
    externalBookingUrl: "/contact",
    isPartnerService: true,
    description: "Gym services partner focused on training support, recovery, and performance-driven movement programs.",
    includes: ["Performance movement", "Conditioning support", "Recovery integration"],
    availability: ["Partner access coordinated through contact form."],
  },
];

export const partnerAddOnServices: ServiceListingItem[] = [
  { ...bySlug("mindtap"), partnerName: "MindTap", partnerLogo: "/images/providers/mindtap.png", externalBookingUrl: "/contact", isPartnerService: true },
  {
    ...bySlug("beauty-hair-nails"),
    partnerName: "Beauty Partner",
    partnerLogo: "/images/providers/facial-design-studio.png",
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
  { name: "Salt", logo: "/images/providers/holistic-salt-therapy-center.png", href: "/contact" },
  { name: "PEMF", logo: "/images/providers/omg-aesthetics.png", href: "/contact" },
  { name: "Far Infrared", logo: "/images/providers/facial-design-studio.png", href: "/contact" },
  { name: "MindTap", logo: "/images/providers/mindtap.png", href: "/contact" },
  { name: "Adapt", logo: "/images/providers/vcs-vitamin-c-to-sea.png", href: "/contact" },
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
