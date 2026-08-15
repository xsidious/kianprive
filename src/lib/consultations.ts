/** Service slugs treated as practitioner consultations / telemedicine for tracking & pay. */
export const CONSULTATION_SERVICE_SLUGS = [
  "telemedicine",
  "nutrition",
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
  "physician-visit",
] as const;

/** Prescription / compound pathways — providers do not earn commission on these. */
export const PRESCRIPTION_SERVICE_SLUGS = ["glp1-peptides"] as const;

export type ConsultationServiceSlug = (typeof CONSULTATION_SERVICE_SLUGS)[number];

export function isConsultationService(slug: string) {
  return (CONSULTATION_SERVICE_SLUGS as readonly string[]).includes(slug);
}

export function isPrescriptionService(slug: string) {
  return (PRESCRIPTION_SERVICE_SLUGS as readonly string[]).includes(slug);
}

export function bookingHasConsultation(serviceIds: string[]) {
  return serviceIds.some((id) => isConsultationService(id));
}

export function bookingHasTelemedicine(serviceIds: string[]) {
  return serviceIds.includes("telemedicine");
}

export function bookingHasPrescriptionService(serviceIds: string[]) {
  return serviceIds.some((id) => isPrescriptionService(id));
}

/**
 * Providers/practitioners earn visit pay on consultations & telemedicine (and other
 * assigned clinical visits), but never on prescription/compound service pathways.
 */
export function isProviderPayableService(slug: string) {
  if (isPrescriptionService(slug)) return false;
  return true;
}

export function providerPayableServiceIds(serviceIds: string[]) {
  return serviceIds.filter((id) => isProviderPayableService(id));
}
