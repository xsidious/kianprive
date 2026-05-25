import { getAcuityApiBase, getAcuityCredentials } from "@/lib/acuity/config";

export class AcuityApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "AcuityApiError";
    this.status = status;
    this.body = body;
  }
}

export async function acuityRequest<T>(
  path: string,
  init?: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    searchParams?: Record<string, string | number | undefined>;
    body?: Record<string, unknown>;
  },
): Promise<T> {
  const credentials = getAcuityCredentials();
  if (!credentials) {
    throw new AcuityApiError("Acuity is not configured.", 503, null);
  }

  const url = new URL(`${getAcuityApiBase()}${path.startsWith("/") ? path : `/${path}`}`);
  if (init?.searchParams) {
    for (const [key, value] of Object.entries(init.searchParams)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  const auth = Buffer.from(`${credentials.userId}:${credentials.apiKey}`).toString("base64");
  const res = await fetch(url, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Acuity API error (${res.status})`;
    throw new AcuityApiError(message, res.status, data);
  }

  return data as T;
}
