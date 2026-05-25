/** Acuity returns datetimes like 2026-06-01T10:00:00-0400 — keep this format for booking. */
export function isAcuityDatetimeString(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{4}$/.test(value);
}

export function resolveBookingDatetime(slotId: string): { acuityDatetime: string; start: Date } | null {
  const trimmed = slotId.trim();
  if (isAcuityDatetimeString(trimmed)) {
    const start = new Date(trimmed);
    if (Number.isNaN(start.getTime())) return null;
    return { acuityDatetime: trimmed, start };
  }

  const start = new Date(trimmed);
  if (Number.isNaN(start.getTime())) return null;
  return { acuityDatetime: trimmed, start };
}
