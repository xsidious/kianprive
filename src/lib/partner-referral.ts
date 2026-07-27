const COOKIE_NAME = "kian_partner";
const MAX_AGE_DAYS = 30;

export function normalizePartnerCode(raw: string | null | undefined) {
  if (!raw) return null;
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return code.length >= 3 ? code : null;
}

/** Client-side: persist partner referral from URL/cookie. */
export function capturePartnerReferralFromUrl(searchParams: URLSearchParams | { get: (k: string) => string | null }) {
  if (typeof document === "undefined") return null;
  const fromUrl = normalizePartnerCode(
    searchParams.get("partner") || searchParams.get("ref") || searchParams.get("ambassador"),
  );
  if (fromUrl) {
    document.cookie = `${COOKIE_NAME}=${fromUrl}; path=/; max-age=${MAX_AGE_DAYS * 24 * 60 * 60}; samesite=lax`;
    try {
      window.localStorage.setItem(COOKIE_NAME, fromUrl);
    } catch {
      /* ignore */
    }
    return fromUrl;
  }
  return readPartnerReferralClient();
}

export function readPartnerReferralClient() {
  if (typeof document === "undefined") return null;
  try {
    const fromStorage = normalizePartnerCode(window.localStorage.getItem(COOKIE_NAME));
    if (fromStorage) return fromStorage;
  } catch {
    /* ignore */
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return normalizePartnerCode(match?.[1] ? decodeURIComponent(match[1]) : null);
}

export function readPartnerReferralFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return normalizePartnerCode(match?.[1] ? decodeURIComponent(match[1]) : null);
}

export { COOKIE_NAME as PARTNER_REFERRAL_COOKIE };
