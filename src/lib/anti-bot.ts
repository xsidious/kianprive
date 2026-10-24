type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();

export function clientIp(req: Request | { headers: Headers }) {
  const h = "headers" in req ? req.headers : (req as Request).headers;
  const fwd = h.get("x-forwarded-for") || h.get("x-real-ip") || "";
  return fwd.split(",")[0]?.trim() || "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key) || { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    return { ok: false as const };
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { ok: true as const };
}

export function honeypotTripped(formData: FormData | Record<string, unknown>, field = "company_website") {
  const value =
    formData instanceof FormData
      ? String(formData.get(field) || "").trim()
      : String((formData as Record<string, unknown>)[field] || "").trim();
  return value.length > 0;
}

export function applySecurityHeaders(headers: Headers) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("X-XSS-Protection", "1; mode=block");
}

export async function verifyTurnstile(token: string, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true as const, skipped: true };
  if (!token) return { ok: false as const, error: "Bot check failed." };
  try {
    const body = new URLSearchParams({
      secret,
      response: token,
      ...(ip && ip !== "unknown" ? { remoteip: ip } : {}),
    });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success ? { ok: true as const } : { ok: false as const, error: "Bot check failed." };
  } catch {
    return { ok: false as const, error: "Bot check unavailable." };
  }
}
