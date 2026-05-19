import {
  DEFAULT_TIMEZONE,
  SLOT_INTERVAL_MINUTES,
  WORKDAY_END_HOUR,
  WORKDAY_START_HOUR,
} from "@/lib/scheduling/config";
import {
  addCalendarDays,
  getZonedParts,
  minutesInTimezone,
  zonedDateTimeToUtc,
} from "@/lib/scheduling/timezone";

export type TimeSlot = {
  id: string;
  start: string;
  end: string;
  label: string;
};

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

function isWeekday(year: number, month: number, day: number, timezone: string) {
  const noon = zonedDateTimeToUtc(year, month, day, 12, 0, timezone);
  const weekday = getZonedParts(noon, timezone).weekday;
  return weekday !== "Sat" && weekday !== "Sun";
}

const OPEN_MINUTES = WORKDAY_START_HOUR * 60;
const CLOSE_MINUTES = WORKDAY_END_HOUR * 60;

export function isWithinBusinessHours(start: Date, durationMinutes: number, timezone: string) {
  const startMinutes = minutesInTimezone(start, timezone);
  const endMinutes = minutesInTimezone(
    new Date(start.getTime() + durationMinutes * 60_000),
    timezone,
  );

  if (startMinutes < OPEN_MINUTES || startMinutes >= CLOSE_MINUTES) return false;
  if (endMinutes > CLOSE_MINUTES) return false;

  const { year, month, day } = getZonedParts(start, timezone);
  return isWeekday(year, month, day, timezone);
}

export function generateAvailableSlots(input: {
  fromDate: Date;
  days?: number;
  durationMinutes: number;
  timezone?: string;
  bookedStarts?: Date[];
}) {
  const timezone = input.timezone ?? DEFAULT_TIMEZONE;
  const days = input.days ?? 21;
  const durationMinutes = input.durationMinutes;
  const slots: TimeSlot[] = [];
  const booked = new Set((input.bookedStarts ?? []).map((date) => date.toISOString()));

  const today = getZonedParts(input.fromDate, timezone);

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const { year, month, day } = addCalendarDays(today.year, today.month, today.day, dayOffset);

    if (!isWeekday(year, month, day, timezone)) continue;

    for (
      let slotMinutes = OPEN_MINUTES;
      slotMinutes + durationMinutes <= CLOSE_MINUTES;
      slotMinutes += SLOT_INTERVAL_MINUTES
    ) {
      const hour = Math.floor(slotMinutes / 60);
      const minute = slotMinutes % 60;
      const start = zonedDateTimeToUtc(year, month, day, hour, minute, timezone);

      if (start.getTime() <= Date.now()) continue;
      if (booked.has(start.toISOString())) continue;

      const end = new Date(start.getTime() + durationMinutes * 60_000);

      slots.push({
        id: start.toISOString(),
        start: start.toISOString(),
        end: end.toISOString(),
        label: formatSlotLabel(start, end, timezone),
      });
    }
  }

  return slots;
}

export function parseSlotId(slotId: string) {
  const start = new Date(slotId);
  if (Number.isNaN(start.getTime())) return null;
  return start;
}

export function computeSlotEnd(start: Date, durationMinutes: number) {
  return new Date(start.getTime() + durationMinutes * 60_000);
}

export function isSlotAvailable(
  slotId: string,
  bookedStarts: Date[],
  durationMinutes?: number,
  timezone?: string,
) {
  const start = parseSlotId(slotId);
  if (!start || start.getTime() <= Date.now()) return false;

  if (durationMinutes !== undefined) {
    const tz = timezone ?? DEFAULT_TIMEZONE;
    if (!isWithinBusinessHours(start, durationMinutes, tz)) return false;
  }

  return !bookedStarts.some((booked) => booked.toISOString() === start.toISOString());
}
