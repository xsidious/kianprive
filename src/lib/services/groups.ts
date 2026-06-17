import type { ServiceListingItem } from "@/lib/services/types";
import { serviceCatalog } from "@/lib/services/catalog";

function bySlug(slug: string) {
  const service = serviceCatalog.find((entry) => entry.slug === slug);
  if (!service) throw new Error(`Missing catalog service: ${slug}`);
  return service;
}

/** Every catalog service with a detail page — use for full services listing. */
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
    image: "/images/stock/service-wellness.jpg",
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
    image: "/images/stock/service-medical-aesthetics.jpg",
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
    image: "/images/stock/service-esthetics.jpg",
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
