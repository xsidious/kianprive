import type { ServiceHighlight } from "@/lib/services/types";
import { getServiceBySlug } from "@/lib/services/catalog";

function highlightFromService(
  slug: string,
  overrides: Partial<ServiceHighlight> & { title?: string; description?: string },
): ServiceHighlight {
  const service = getServiceBySlug(slug);
  if (!service) throw new Error(`Missing service highlight source: ${slug}`);
  return {
    title: overrides.title ?? service.title,
    description: overrides.description ?? service.description,
    image: overrides.image ?? service.image,
    href: overrides.href ?? `/services/${slug}`,
  };
}

export const serviceHighlights: ServiceHighlight[] = [
  highlightFromService("telemedicine", {
    title: "Concierge and Telemedicine",
    description:
      "Physician-led virtual and in-home concierge care with personalized protocols, follow-ups, and continuity—without the waiting room.",
  }),
  highlightFromService("comprehensive-bloodwork", {
    title: "Blood Work",
    description:
      "Comprehensive blood work and physician interpretation to build your personalized wellness and performance roadmap.",
  }),
  highlightFromService("icoone-laser", {
    title: "Icoone® Lymphatic Drainage",
    description:
      "Advanced Icoone® lymphatic drainage for detox support, contouring, recovery, inflammation reduction, and skin quality.",
  }),
  highlightFromService("glp1-peptides", {
    title: "GLP-1s & Peptides",
    description:
      "Start online intake, receive approval or physician review, then book or purchase your personalized GLP-1 and peptide pathway.",
  }),
  highlightFromService("hair-restoration", {
    title: "Hair Restoration",
    description:
      "Physician-guided hair restoration programs with personalized diagnostics and regenerative pathways for healthier scalp and hair density support.",
  }),
  highlightFromService("microneedling-with-exosomes", {
    title: "Microneedling with Exosomes",
    description:
      "Advanced regenerative skin treatment designed to support collagen production, texture refinement, and visibly smoother, brighter skin.",
  }),
  highlightFromService("nutrition", {
    title: "Nutrition Services",
    description:
      "Cherie Johnson, Certified Nutritionist—30+ years of holistic wellness support with private virtual consultations.",
  }),
  highlightFromService("iv-therapy", {}),
  highlightFromService("korean-organic-skincare", {
    title: "Luxury Skincare",
    description:
      "Premium preventive skincare featuring Korean methodology, clean formulations, and barrier-forward luxury facials.",
  }),
  highlightFromService("facial-aesthetics", {
    title: "Medical Aesthetics",
    description:
      "Precision aesthetic services from licensed professionals—injectables, resurfacing, peels, and skin-forward clinical outcomes.",
  }),
  highlightFromService("beauty-hair-nails", {
    title: "Beauty (Hair and Nails)",
    description:
      "Salon-partner beauty services including hair, nails, lashes, and skincare in a coordinated luxury setting.",
  }),
];
