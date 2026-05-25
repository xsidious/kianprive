import type { ServiceListingItem } from "@/lib/services/types";
import { serviceCatalog } from "@/lib/services/catalog";

function bySlug(slug: string) {
  const service = serviceCatalog.find((entry) => entry.slug === slug);
  if (!service) throw new Error(`Missing catalog service: ${slug}`);
  return service;
}

export const coreServices: ServiceListingItem[] = [
  bySlug("telemedicine"),
  bySlug("comprehensive-bloodwork"),
  bySlug("icoone-laser"),
  bySlug("iv-therapy"),
  bySlug("nutrition"),
  bySlug("microneedling-with-exosomes"),
  bySlug("korean-organic-skincare"),
  bySlug("facial-aesthetics"),
  bySlug("glp1-peptides"),
  bySlug("mindtap"),
];

export const sameLocationAddOns: ServiceListingItem[] = [
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

export const differentLocationAddOns: ServiceListingItem[] = [];

export const gymServices: ServiceListingItem[] = [
  {
    title: "Adapt",
    image: "/images/stock/service-beauty-salon.jpg",
    description: "Gym services partner focused on training support, recovery, and performance-driven movement programs.",
    includes: ["Performance movement", "Conditioning support", "Recovery integration"],
    availability: ["Partner access coordinated through contact form."],
  },
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

export const brandIntro = {
  tagline: "Luxury Wellness. Uncompromising Care. Exclusively Yours.",
  lead:
    "KIAN Privé is a concierge wellness company dedicated to delivering the finest services for a truly private wellness experience provided by dedicated professionals at your location or ours.",
  team:
    "We bring together a distinguished team of physicians, registered nurses, licensed aestheticians, certified nutrition experts, and wellness specialists to deliver a seamless fusion of clinical medicine, advanced skincare, regenerative therapies, and luxury wellness — tailored to every individual.",
};
