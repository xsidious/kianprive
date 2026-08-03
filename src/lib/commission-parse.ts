/**
 * Parse admin override input.
 * Empty → null (use default). "0" → 0. Invalid → null.
 */
export function parseCommissionOverride(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return n;
}
