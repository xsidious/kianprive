import { acuityRequest } from "@/lib/acuity/client";

type AcuityAppointmentType = {
  id: number;
  calendarIDs?: number[];
};

const calendarCache = new Map<number, number>();

export async function getAcuityCalendarIdForType(appointmentTypeID: number): Promise<number | null> {
  const cached = calendarCache.get(appointmentTypeID);
  if (cached) return cached;

  const types = await acuityRequest<AcuityAppointmentType[]>("/appointment-types");
  for (const type of types) {
    const calendarId = type.calendarIDs?.[0];
    if (calendarId) calendarCache.set(type.id, calendarId);
  }

  return calendarCache.get(appointmentTypeID) ?? null;
}
