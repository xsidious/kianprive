import type { TherapyBillingInterval } from "@prisma/client";

export const THERAPY_INTERVAL_OPTIONS = [
  { value: "ONE_TIME" as const, label: "One-time (no refill)", days: 0 },
  { value: "WEEKLY" as const, label: "Every week", days: 7 },
  { value: "EVERY_2_WEEKS" as const, label: "Every 2 weeks", days: 14 },
  { value: "EVERY_4_WEEKS" as const, label: "Every 4 weeks", days: 28 },
  { value: "MONTHLY" as const, label: "Every month (30 days)", days: 30 },
  { value: "EVERY_6_WEEKS" as const, label: "Every 6 weeks", days: 42 },
  { value: "EVERY_8_WEEKS" as const, label: "Every 8 weeks", days: 56 },
  { value: "CUSTOM" as const, label: "Custom interval", days: 0 },
];

export function resolveIntervalDays(
  interval: TherapyBillingInterval,
  customDays?: number | null,
) {
  if (interval === "ONE_TIME") return 0;
  if (interval === "CUSTOM") {
    const days = Math.floor(Number(customDays));
    if (!Number.isFinite(days) || days < 1 || days > 365) {
      throw new Error("Custom billing interval must be between 1 and 365 days.");
    }
    return days;
  }
  const found = THERAPY_INTERVAL_OPTIONS.find((option) => option.value === interval);
  if (!found || found.days < 1) {
    throw new Error("Choose a refill interval.");
  }
  return found.days;
}

export function intervalLabel(interval: TherapyBillingInterval, days: number) {
  if (interval === "ONE_TIME") return "one-time";
  if (interval === "CUSTOM") return `every ${days} day${days === 1 ? "" : "s"}`;
  const found = THERAPY_INTERVAL_OPTIONS.find((option) => option.value === interval);
  return found?.label.replace(/^Every /i, "every ").toLowerCase() ?? `every ${days} days`;
}

export function addUtcDays(from: Date, days: number) {
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function formatChargeDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
