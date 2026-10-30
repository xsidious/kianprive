/**
 * Rx Here / VitaRelay public practice API client.
 * Catalog reads work with a practice key. Distributor order writes need a distributor-scoped key.
 */

const PRACTICE_BASE =
  process.env.RXHERE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://portal.rxhere.com/api/public/practice/v1";

const VITARELAY_BASE =
  process.env.VITARELAY_API_BASE_URL?.replace(/\/$/, "") || "https://vitarelay.com/api/public/v1";

export type RxHereCatalogProduct = {
  id: string;
  slug?: string | null;
  name: string;
  description?: string | null;
  type?: "503a" | "503b" | "rnd" | string | null;
  requires_prescription?: boolean;
  controlled_substance?: boolean;
  category?: string | null;
  category_label?: string | null;
  image_urls?: string[];
  dosage_form?: string | null;
  strengths?: string[];
  volume?: string | null;
  price_cents?: number | null;
};

type CatalogPage = {
  data: RxHereCatalogProduct[];
  page?: number;
  limit?: number;
  total?: number;
};

function apiKey() {
  return (
    process.env.RXHERE_API_KEY?.trim() ||
    process.env.RXHERE_LIVE_API_KEY?.trim() ||
    process.env.VITARELAY_API_KEY?.trim() ||
    ""
  );
}

export function rxhereConfigured() {
  return Boolean(apiKey());
}

async function getJson<T>(url: string): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const key = apiKey();
  if (!key) return { ok: false, status: 0, error: "RXHERE_API_KEY is not configured." };

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const body = (await res.json().catch(() => ({}))) as {
      data?: T;
      error?: { code?: string; message?: string } | string;
      message?: string;
    };
    if (!res.ok) {
      const msg =
        typeof body.error === "string"
          ? body.error
          : body.error?.message || body.message || `HTTP ${res.status}`;
      return { ok: false, status: res.status, error: msg };
    }
    return { ok: true, data: (body.data !== undefined ? body : body) as T };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "Network error talking to Rx Here.",
    };
  }
}

export function absoluteAssetUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const host = (process.env.RXHERE_ASSET_BASE_URL || "https://vitarelay.com").replace(/\/$/, "");
  return `${host}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** Paginate the full practice formulary (503A / 503B / RUO). */
export async function fetchAllCatalog(options?: {
  type?: string;
  limit?: number;
  maxPages?: number;
}): Promise<{ ok: true; products: RxHereCatalogProduct[]; total: number } | { ok: false; error: string }> {
  const limit = Math.min(options?.limit ?? 100, 100);
  const maxPages = options?.maxPages ?? 50;
  const products: RxHereCatalogProduct[] = [];
  let page = 1;
  let total = 0;

  while (page <= maxPages) {
    const qs = new URLSearchParams({ limit: String(limit), page: String(page) });
    if (options?.type) qs.set("type", options.type);
    const result = await getJson<CatalogPage>(`${PRACTICE_BASE}/catalog?${qs}`);
    if (!result.ok) return { ok: false, error: result.error };

    const pagePayload = result.data as CatalogPage;
    const rows = Array.isArray(pagePayload.data) ? pagePayload.data : [];
    total = typeof pagePayload.total === "number" ? pagePayload.total : total;
    products.push(...rows);

    if (!rows.length || products.length >= total) break;
    page += 1;
  }

  return { ok: true, products, total: total || products.length };
}

/** RUO / display catalog with price_cents when available via VitaRelay. */
export async function fetchPricedCatalogPage(limit = 100, page = 1) {
  return getJson<CatalogPage>(`${VITARELAY_BASE}/catalog?limit=${limit}&page=${page}`);
}

export type RxHereOrderStatus = {
  id?: string;
  order_number?: string;
  status?: string;
  payment_status?: string;
  reference?: string | null;
  fulfillment?: {
    status?: string | null;
    tracking_number?: string | null;
    tracking_carrier?: string | null;
    tracking_url?: string | null;
    shipped_at?: string | null;
  } | null;
  items?: unknown[];
};

export async function fetchRxHereOrder(orderId: string) {
  return getJson<{ data: RxHereOrderStatus } | RxHereOrderStatus>(`${PRACTICE_BASE}/orders/${orderId}`);
}
