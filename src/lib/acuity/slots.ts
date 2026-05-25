import { acuityRequest } from "@/lib/acuity/client";
import { getAcuityAppointmentTypeId } from "@/lib/acuity/map";
import type { TimeSlot } from "@/lib/scheduling/slots";
import { DEFAULT_TIMEZONE } from "@/lib/scheduling/config";
import { computeSlotEnd } from "@/lib/scheduling/slots";

type AcuityDate = { date: string };
type AcuityTime = { time: string; slotsAvailable?: number };

function monthKey(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${year}-${month}`;
}

function formatSlotLabel(start: Date, end: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatter.format(start)} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
}

async function fetchAvailableDates(appointmentTypeID: number, month: string, timezone: string) {
  return acuityRequest<AcuityDate[]>("/availability/dates", {
    searchParams: {
      appointmentTypeID,
      month,
      timezone,
    },
  });
}

async function fetchAvailableTimes(
  appointmentTypeID: number,
  date: string,
  timezone: string,
) {
  return acuityRequest<AcuityTime[]>("/availability/times", {
    searchParams: {
      appointmentTypeID,
      date,
      timezone,
    },
  });
}

export async function fetchAcuitySlots(input: {
  serviceId: string;
  durationMinutes: number;
  timezone?: string;
  maxDays?: number;
}): Promise<TimeSlot[]> {
  const timezone = input.timezone ?? DEFAULT_TIMEZONE;
  const appointmentTypeID = getAcuityAppointmentTypeId(input.serviceId);
  if (!appointmentTypeID) {
    throw new Error(`No Acuity appointment type for "${input.serviceId}".`);
  }

  const now = new Date();
  const months = [monthKey(now, timezone), monthKey(new Date(now.getFullYear(), now.getMonth() + 1, 1), timezone)];
  const uniqueMonths = [...new Set(months)];

  const dateLists = await Promise.all(
    uniqueMonths.map((month) => fetchAvailableDates(appointmentTypeID, month, timezone)),
  );

  const dates = [...new Set(dateLists.flat().map((entry) => entry.date))]
    .sort()
    .slice(0, input.maxDays ?? 28);

  const timeResults = await Promise.all(
    dates.map(async (date) => {
      try {
        const times = await fetchAvailableTimes(appointmentTypeID, date, timezone);
        return times.map((entry) => ({ date, time: entry.time }));
      } catch {
        return [];
      }
    }),
  );

  const slots: TimeSlot[] = [];
  for (const entry of timeResults.flat()) {
    const acuityDatetime = entry.time;
    const start = new Date(acuityDatetime);
    if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) continue;
    const end = computeSlotEnd(start, input.durationMinutes);
    slots.push({
      id: acuityDatetime,
      start: start.toISOString(),
      end: end.toISOString(),
      label: formatSlotLabel(start, end, timezone),
    });
  }

  slots.sort((a, b) => a.start.localeCompare(b.start));
  return slots;
}
