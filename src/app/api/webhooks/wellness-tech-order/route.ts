import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { notifyPartnerOrderUpdated } from "@/lib/intake/partner-status-sync";

function secretOk(header: string | null) {
  const expected =
    process.env.WT_PARTNER_ORDER_SECRET?.trim() ||
    process.env.KIAN_PARTNER_SECRET?.trim() ||
    "";
  if (!expected || !header) return false;
  const left = Buffer.from(header);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

const STATUS_MAP: Record<string, { order?: "PROCESSING" | "FULFILLED" | "DELIVERED" | "CANCELED"; fulfillment?: "PROCESSING" | "FULFILLED" | "DELIVERED" }> = {
  received: { order: "PROCESSING", fulfillment: "PROCESSING" },
  submitted: { order: "PROCESSING", fulfillment: "PROCESSING" },
  verified: { order: "PROCESSING", fulfillment: "PROCESSING" },
  compounding: { order: "PROCESSING", fulfillment: "PROCESSING" },
  shipped: { order: "FULFILLED", fulfillment: "FULFILLED" },
  delivered: { order: "DELIVERED", fulfillment: "DELIVERED" },
  cancelled: { order: "CANCELED" },
  on_hold: { order: "PROCESSING", fulfillment: "PROCESSING" },
  delayed: { order: "PROCESSING", fulfillment: "PROCESSING" },
};

export async function POST(request: Request) {
  if (!secretOk(request.headers.get("x-wt-partner-secret"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    externalRef?: string;
    status?: string;
    trackingNumber?: string;
    carrier?: string;
    event?: string;
    reason?: string;
  } | null;

  if (!body?.externalRef) {
    return NextResponse.json({ ok: false, error: "externalRef is required." }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ orderNumber: body.externalRef }, { distributionOrderId: body.externalRef }],
    },
    include: { fulfillments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  }

  const mapped = STATUS_MAP[String(body.status || "").toLowerCase()] || {};
  if (mapped.order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: mapped.order,
        fulfillmentStatus: mapped.fulfillment || order.fulfillmentStatus,
        distributionSyncError: body.reason || null,
      },
    });
  }

  if (body.trackingNumber || mapped.fulfillment) {
    const existing = order.fulfillments[0];
    const trackingUrl = body.trackingNumber
      ? `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(body.trackingNumber)}`
      : existing?.trackingUrl;
    if (existing) {
      await prisma.fulfillment.update({
        where: { id: existing.id },
        data: {
          status: mapped.fulfillment || existing.status,
          carrier: body.carrier || existing.carrier || "FedEx",
          trackingNumber: body.trackingNumber || existing.trackingNumber,
          trackingUrl: trackingUrl || undefined,
          shippedAt: body.status === "shipped" || body.event === "SHIPPED" ? new Date() : existing.shippedAt,
          deliveredAt: body.status === "delivered" || body.event === "DELIVERED" ? new Date() : existing.deliveredAt,
          notes: [existing.notes, body.event ? `RxHere ${body.event}` : "", body.reason || ""].filter(Boolean).join(" · ") || null,
        },
      });
    } else {
      await prisma.fulfillment.create({
        data: {
          orderId: order.id,
          status: mapped.fulfillment || "PROCESSING",
          carrier: body.carrier || "FedEx",
          trackingNumber: body.trackingNumber || null,
          trackingUrl: trackingUrl || null,
          shippedAt: body.status === "shipped" || body.event === "SHIPPED" ? new Date() : null,
          deliveredAt: body.status === "delivered" || body.event === "DELIVERED" ? new Date() : null,
          notes: [body.event ? `RxHere ${body.event}` : "", body.reason || ""].filter(Boolean).join(" · ") || null,
        },
      });
    }
  }

  if (order.intakeSubmissionId) {
    await notifyPartnerOrderUpdated({
      orderId: order.id,
      status: mapped.order || order.status,
      fulfillment: {
        status: mapped.fulfillment || order.fulfillmentStatus,
        carrier: body.carrier || order.fulfillments[0]?.carrier || null,
        trackingNumber: body.trackingNumber || order.fulfillments[0]?.trackingNumber || null,
        trackingUrl: body.trackingNumber
          ? `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(body.trackingNumber)}`
          : order.fulfillments[0]?.trackingUrl || null,
      },
    });
  }

  return NextResponse.json({ ok: true, orderId: order.id });
}
