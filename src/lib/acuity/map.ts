import type { BookingServiceOption } from "@/lib/services/types";

/**
 * Maps site booking slugs → Acuity appointment type IDs.
 * Override any mapping with env, e.g. ACUITY_TYPE_NUTRITION=19112766
 */
const DEFAULT_ACUITY_APPOINTMENT_TYPES: Record<string, number> = {
  telemedicine: 74887377, // General Consultation
  "icoone-laser": 67869650, // Icoone Wellness - Lymphatic drain
  "facial-aesthetics": 78612009, // Aesthetics
  nutrition: 19112766, // Nutritional Consultation
  "iv-therapy": 31078433, // Vitamin Injection
  "comprehensive-bloodwork": 74887377, // General Consultation
  "beauty-hair-nails": 78612009, // Aesthetics
  "inbody-scan": 74887377,
  "power-plate": 74887377,
  "microneedling-with-exosomes": 86507329, // Deluxe Micro-Needling
  "korean-organic-skincare": 51056087, // Organic Facial
};

function envTypeId(slug: string) {
  const key = `ACUITY_TYPE_${slug.replace(/-/g, "_").toUpperCase()}`;
  const raw = process.env[key]?.trim();
  if (!raw) return undefined;
  const id = Number(raw);
  return Number.isFinite(id) ? id : undefined;
}

export function getAcuityAppointmentTypeId(serviceSlug: string): number | null {
  const fromEnv = envTypeId(serviceSlug);
  if (fromEnv) return fromEnv;
  return DEFAULT_ACUITY_APPOINTMENT_TYPES[serviceSlug] ?? null;
}

export function buildAcuitySchedulerUrl(
  serviceSlug: string,
  params?: { firstName?: string; lastName?: string; email?: string; datetime?: string },
) {
  const typeId = getAcuityAppointmentTypeId(serviceSlug);
  const base =
    process.env.ACUITY_SCHEDULER_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://Keepingitallnatural.as.me";
  const url = new URL(base);
  if (typeId) url.searchParams.set("appointmentType", String(typeId));
  if (params?.firstName) url.searchParams.set("firstName", params.firstName);
  if (params?.lastName) url.searchParams.set("lastName", params.lastName);
  if (params?.email) url.searchParams.set("email", params.email);
  if (params?.datetime) url.searchParams.set("datetime", params.datetime);
  return url.toString();
}

export function assertAcuityMapped(service: Pick<BookingServiceOption, "id">) {
  const typeId = getAcuityAppointmentTypeId(service.id);
  if (!typeId) {
    throw new Error(`No Acuity appointment type mapped for service "${service.id}".`);
  }
  return typeId;
}
