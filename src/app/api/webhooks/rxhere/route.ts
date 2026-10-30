import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { applyDistributionFulfillmentUpdate } from "@/lib/rxhere/apply-fulfillment-update";

/**
 * Rx Here distributor webhooks (order.shipped, order.delivered, intake.reviewed, …).
 * Register this URL with Rx Here and store RXHERE_WEBHOOK_SECRET.
 */
function validSignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signatureHeader.replace(/^sha256=/i, "").trim();
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(received, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const secret = process.env.RXHERE_WEBHOOK_SECRET?.trim() || "";
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");

  if (!secret) {
    return NextResponse.json({ ok: false, error: "RXHERE_WEBHOOK_SECRET is not configured." }, { status: 503 });
  }
  if (!validSignature(rawBody, signature, secret)) {
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 401 });
  }

  const event = request.headers.get("x-webhook-event") || "";
  const payload = JSON.parse(rawBody || "{}") as {
    type?: string;
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
      escript_id?: string;
      patient_id?: string;
    };
  };

  const order = payload.data?.order;
  const type = payload.type || event;
  const externalRef = order?.reference || order?.order_number || order?.id;
  if (!externalRef) {
    // intake.reviewed etc. — acknowledge without order update
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
    trackingNumber: order?.fulfillment?.tracking_number,
    carrier: order?.fulfillment?.tracking_carrier,
    trackingUrl: order?.fulfillment?.tracking_url,
    event: type,
    rxhereOrderId: order?.id,
    distributionStatus: order?.status || statusFromEvent,
  });

  if (!result.ok && result.error === "Order not found.") {
    // Acknowledge so Rx Here does not retry forever for unknown refs
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
