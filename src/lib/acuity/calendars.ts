import { acuityRequest } from "@/lib/acuity/client";
import {
  getAcuityAppointmentTypeId,
  getAcuityCalendarId,
} from "@/lib/acuity/map";

export { ACUITY_CALENDAR, ACUITY_CALENDAR_LABELS } from "@/lib/acuity/calendar-ids";

type AcuityAppointmentType = {
  id: number;
  calendarIDs?: number[];
};

const typeCalendarsCache = new Map<number, number[]>();

async function loadTypeCalendars(): Promise<void> {
  if (typeCalendarsCache.size > 0) return;
  const types = await acuityRequest<AcuityAppointmentType[]>("/appointment-types");
  for (const type of types) {
    if (type.calendarIDs?.length) {
      typeCalendarsCache.set(type.id, type.calendarIDs);
    }
  }
}

export async function getAppointmentTypeCalendarIds(
  appointmentTypeID: number,
): Promise<number[]> {
  await loadTypeCalendars();
  return typeCalendarsCache.get(appointmentTypeID) ?? [];
}

/**
 * Picks the calendar column for a booking: site slug mapping first, then must be
 * allowed on the Acuity appointment type (falls back to first allowed calendar).
 */
export async function resolveAcuityCalendarId(serviceSlug: string): Promise<number | null> {
  const appointmentTypeID = getAcuityAppointmentTypeId(serviceSlug);
  if (!appointmentTypeID) return null;

  const preferred = getAcuityCalendarId(serviceSlug);
  if (!preferred) return null;

  const allowed = await getAppointmentTypeCalendarIds(appointmentTypeID);
  if (!allowed.length) return preferred;
  if (allowed.includes(preferred)) return preferred;

  return allowed[0] ?? preferred;
}
