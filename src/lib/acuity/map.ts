import type { BookingServiceOption } from "@/lib/services/types";
import { ACUITY_CALENDAR } from "@/lib/acuity/calendar-ids";

/**
 * Maps site booking slugs → Acuity appointment type IDs.
 * Override any mapping with env, e.g. ACUITY_TYPE_NUTRITION=19112766
 *
 * Calendar columns (schedule grid headers):
 * - Facial Design Studio → ACUITY_CALENDAR.FACIAL_DESIGN
 * - KIAN Beauty & Spa Treatments → ACUITY_CALENDAR.SPA
 * - KIAN Beauty & Wellness @ Adapt → ACUITY_CALENDAR.ADAPT
 * - KIAN Beauty & Wellness w Nancy → ACUITY_CALENDAR.NANCY
 * - KIAN Total Body Wellness → ACUITY_CALENDAR.TOTAL_BODY
 * - Reiki Therapy → ACUITY_CALENDAR.REIKI
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
  "glp1-peptides": 74887377,
  mindtap: 74887377,
};

/**
 * Which Acuity calendar column each site service books into.
 * Override with env, e.g. ACUITY_CALENDAR_NUTRITION=4897308
 */
const DEFAULT_ACUITY_CALENDARS: Record<string, number> = {
  telemedicine: ACUITY_CALENDAR.TOTAL_BODY,
  "icoone-laser": ACUITY_CALENDAR.ADAPT,
  "facial-aesthetics": ACUITY_CALENDAR.FACIAL_DESIGN,
  nutrition: ACUITY_CALENDAR.TOTAL_BODY,
  "iv-therapy": ACUITY_CALENDAR.ADAPT,
  "comprehensive-bloodwork": ACUITY_CALENDAR.TOTAL_BODY,
  "beauty-hair-nails": ACUITY_CALENDAR.SPA,
  "inbody-scan": ACUITY_CALENDAR.TOTAL_BODY,
  "power-plate": ACUITY_CALENDAR.TOTAL_BODY,
  "microneedling-with-exosomes": ACUITY_CALENDAR.ADAPT,
  "korean-organic-skincare": ACUITY_CALENDAR.SPA,
  "glp1-peptides": ACUITY_CALENDAR.TOTAL_BODY,
  mindtap: ACUITY_CALENDAR.TOTAL_BODY,
};

function envTypeId(slug: string) {
  const key = `ACUITY_TYPE_${slug.replace(/-/g, "_").toUpperCase()}`;
  const raw = process.env[key]?.trim();
  if (!raw) return undefined;
  const id = Number(raw);
  return Number.isFinite(id) ? id : undefined;
}

function envCalendarId(slug: string) {
  const key = `ACUITY_CALENDAR_${slug.replace(/-/g, "_").toUpperCase()}`;
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

export function getAcuityCalendarId(serviceSlug: string): number | null {
  const fromEnv = envCalendarId(serviceSlug);
  if (fromEnv) return fromEnv;
  return DEFAULT_ACUITY_CALENDARS[serviceSlug] ?? null;
}

export function buildAcuitySchedulerUrl(
  serviceSlug: string,
  params?: { firstName?: string; lastName?: string; email?: string; datetime?: string },
) {
  const typeId = getAcuityAppointmentTypeId(serviceSlug);
  const calendarId = getAcuityCalendarId(serviceSlug);
  const base =
    process.env.ACUITY_SCHEDULER_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://Keepingitallnatural.as.me";
  const url = new URL(base);
  if (typeId) url.searchParams.set("appointmentType", String(typeId));
  if (calendarId) url.searchParams.set("calendar", String(calendarId));
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
