export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string;
};

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    weekday: parts.find((part) => part.type === "weekday")?.value ?? "",
  };
}

/** Wall-clock time in `timeZone` → UTC instant. */
export function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  let utcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const desired = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const zoned = getZonedParts(new Date(utcMs), timeZone);
    const actual = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, 0, 0);
    const diffMs = desired - actual;
    if (diffMs === 0) return new Date(utcMs);
    utcMs += diffMs;
  }

  for (let ms = utcMs - 2 * 3_600_000; ms <= utcMs + 2 * 3_600_000; ms += 60_000) {
    const parts = getZonedParts(new Date(ms), timeZone);
    if (
      parts.year === year &&
      parts.month === month &&
      parts.day === day &&
      parts.hour === hour &&
      parts.minute === minute
    ) {
      return new Date(ms);
    }
  }

  throw new Error(`Could not resolve ${year}-${month}-${day} ${hour}:${minute} in ${timeZone}`);
}

export function addCalendarDays(year: number, month: number, day: number, days: number) {
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

export function minutesInTimezone(date: Date, timeZone: string) {
  const { hour, minute } = getZonedParts(date, timeZone);
  return hour * 60 + minute;
}
