import { Decimal } from "@prisma/client/runtime/library";

export { parseCommissionOverride } from "@/lib/commission-parse";

export function toCommissionNumber(value: Decimal | number | string) {
  return typeof value === "number" ? value : Number(value);
}

/**
 * Resolve effective commission %.
 * Explicit assignment override (including 0) wins; otherwise person default.
 */
export function resolveCommissionPct(
  override: Decimal | number | string | null | undefined,
  fallback: Decimal | number | string,
): number {
  if (override === null || override === undefined) {
    return toCommissionNumber(fallback);
  }
  return toCommissionNumber(override);
}

export function roundCommissionAmount(gross: number, pct: number) {
  return Math.round(((gross * pct) / 100) * 100) / 100;
}
