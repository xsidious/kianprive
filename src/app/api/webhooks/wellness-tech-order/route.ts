import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { applyDistributionFulfillmentUpdate } from "@/lib/rxhere/apply-fulfillment-update";

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

export async function POST(request: Request) {
  if (!secretOk(request.headers.get("x-wt-partner-secret"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    externalRef?: string;
    status?: string;
    trackingNumber?: string;
    carrier?: string;
    trackingUrl?: string;
    event?: string;
    reason?: string;
    rxhereOrderId?: string;
    orderId?: string;
  } | null;

  if (!body?.externalRef) {
    return NextResponse.json({ ok: false, error: "externalRef is required." }, { status: 400 });
  }

  const result = await applyDistributionFulfillmentUpdate({
    externalRef: body.externalRef,
    status: body.status,
    trackingNumber: body.trackingNumber,
    carrier: body.carrier,
    trackingUrl: body.trackingUrl,
    event: body.event,
    reason: body.reason,
    rxhereOrderId: body.rxhereOrderId || body.orderId,
    distributionStatus: body.status,
  });

  if (!result.ok) {
    const status = result.error === "Order not found." ? 404 : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({
    ok: true,
    orderId: result.orderId,
    trackingUrl: result.trackingUrl,
  });
}
