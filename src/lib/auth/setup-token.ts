import crypto from "crypto";

export function hashSetupToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createSetupToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, hash: hashSetupToken(token) };
}

export function digitsOnly(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}

export function phonesMatch(onFile: string | null | undefined, provided: string | null | undefined) {
  const stored = digitsOnly(onFile);
  const input = digitsOnly(provided);
  if (!stored || !input) return false;
  if (stored === input) return true;
  if (input.length >= 4 && stored.endsWith(input)) return true;
  if (stored.length >= 4 && input.endsWith(stored.slice(-4)) && input.length === 4) return true;
  const stored10 = stored.slice(-10);
  const input10 = input.slice(-10);
  return stored10.length === 10 && stored10 === input10;
}

export const SETUP_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;
