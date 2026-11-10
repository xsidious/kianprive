import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { applyDistributionFulfillmentUpdate } from "@/lib/rxhere/apply-fulfillment-update";

/**
 * Eventide Wellness Collective (VitaRelay) outbound webhooks.
 * Register this URL in the Eventide / VitaRelay org Webhooks panel:
 *   https://YOUR_DOMAIN/api/webhooks/eventide
 * Store the signing secret as EVENTIDE_WEBHOOK_SECRET.
 */
function timingSafeEqualString(a: string, b: string) {
  try {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function hmacHex(secret: string | Buffer, payload: string) {
  return crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

function hmacBase64(secret: string | Buffer, payload: string) {
  return crypto.createHmac("sha256", secret).update(payload, "utf8").digest("base64");
}

/** Accept VitaRelay (`sha256=` / hex / base64) and Stripe-style `whsec_` secrets. */
function validSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  timestampHeader?: string | null,
) {
  if (!signatureHeader || !secret) return false;
  const received = signatureHeader
    .replace(/^sha256=/i, "")
    .replace(/^v1=/i, "")
    .trim();

  const keyCandidates: Array<string | Buffer> = [secret];
  if (secret.startsWith("whsec_")) {
    const rest = secret.slice("whsec_".length);
    keyCandidates.push(rest);
    try {
      keyCandidates.push(Buffer.from(rest, "base64"));
    } catch {
      // ignore invalid base64
    }
  }

  const payloads = [rawBody];
  if (timestampHeader?.trim()) {
    payloads.push(`${timestampHeader.trim()}.${rawBody}`);
  }

  for (const key of keyCandidates) {
    for (const payload of payloads) {
      const hex = hmacHex(key, payload);
      const b64 = hmacBase64(key, payload);
      if (timingSafeEqualString(hex, received) || timingSafeEqualString(b64, received)) {
        return true;
      }
      // Stripe-style header may contain multiple `v1=` / `t=` parts
      if (signatureHeader.includes(hex) || signatureHeader.includes(b64)) {
        return true;
      }
    }
  }
  return false;
}

function webhookSecret() {
  return (
    process.env.EVENTIDE_WEBHOOK_SECRET?.trim() ||
    process.env.VITARELAY_WEBHOOK_SECRET?.trim() ||
    process.env.RXHERE_WEBHOOK_SECRET?.trim() ||
    ""
  );
}

export async function POST(request: Request) {
  const secret = webhookSecret();
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-vitarelay-signature") ||
    request.headers.get("x-webhook-signature") ||
    request.headers.get("x-eventide-signature") ||
    request.headers.get("stripe-signature");
  const timestamp =
    request.headers.get("x-vitarelay-timestamp") ||
    request.headers.get("x-webhook-timestamp") ||
    null;

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "EVENTIDE_WEBHOOK_SECRET is not configured." },
      { status: 503 },
    );
  }
  if (!validSignature(rawBody, signature, secret, timestamp)) {
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 401 });
  }

  const event =
    request.headers.get("x-vitarelay-event") ||
    request.headers.get("x-webhook-event") ||
    request.headers.get("x-eventide-event") ||
    "";
  const payload = JSON.parse(rawBody || "{}") as {
    type?: string;
    event?: string;
    data?: {
      order?: {
        id?: string;
        order_number?: string;
        status?: string;
        reference?: string | null;
        fulfillment?: {
          tracking_number?: string | null;
          tracking_carrier?: string | null;
          tracking_url?: string | null;
        };
      };
      order_id?: string;
      reference?: string;
      tracking_number?: string;
      tracking_carrier?: string;
      tracking_url?: string;
      escript_id?: string;
      patient_id?: string;
    };
  };

  const order = payload.data?.order;
  const type = payload.type || payload.event || event;
  const externalRef =
    order?.reference ||
    order?.order_number ||
    order?.id ||
    payload.data?.reference ||
    payload.data?.order_id;
  if (!externalRef) {
    return NextResponse.json({ ok: true, ignored: true, type });
  }

  const statusFromEvent =
    type.includes("delivered")
      ? "delivered"
      : type.includes("shipped")
        ? "shipped"
        : type.includes("fulfilled")
          ? "fulfilled"
          : type.includes("cancelled") || type.includes("canceled")
            ? "cancelled"
            : order?.status;

  const result = await applyDistributionFulfillmentUpdate({
    externalRef,
    status: statusFromEvent,
    trackingNumber: order?.fulfillment?.tracking_number || payload.data?.tracking_number,
    carrier: order?.fulfillment?.tracking_carrier || payload.data?.tracking_carrier,
    trackingUrl: order?.fulfillment?.tracking_url || payload.data?.tracking_url,
    event: type,
    rxhereOrderId: order?.id || payload.data?.order_id,
    distributionStatus: order?.status || statusFromEvent,
  });

  if (!result.ok && result.error === "Order not found.") {
    return NextResponse.json({ ok: true, unmatched: true, externalRef });
  }

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    trackingUrl: result.trackingUrl,
  });
}
