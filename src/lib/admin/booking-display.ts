const ACUITY_APPOINTMENT_RE = /Acuity appointment #(\d+)/i;

export function parseAcuityAppointmentId(notes: string | null | undefined): number | null {
  if (!notes) return null;
  const match = notes.match(ACUITY_APPOINTMENT_RE);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) ? id : null;
}

export function formatBookingDateTime(
  value: string | Date | null | undefined,
  timezone = "America/New_York",
): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatMoney(value: string | number): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
};

export function bookingStatusTone(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-[#e8f5ec] text-[#2d5c3a] border-[#9fd4ad]";
    case "PENDING":
      return "bg-[#fff6e8] text-[#8f6f3e] border-[#e8d4a8]";
    case "COMPLETED":
      return "bg-[#eef2ff] text-[#3b4a7a] border-[#b8c4ef]";
    case "CANCELED":
      return "bg-[#fdeeee] text-[#7c2c2c] border-[#e8b4b4]";
    default:
      return "bg-[#f5efe4] text-[#4f4335] border-[#d7b67666]";
  }
}
