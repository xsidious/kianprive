import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";
import { applyDistributionFulfillmentUpdate } from "@/lib/rxhere/apply-fulfillment-update";

type Params = { params: Promise<{ id: string }> };

/** Poll Wellness Tech (and VitaRelay via WT) for one order's fulfillment status. */
export async function POST(_: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      distributionOrderId: true,
      rxhereOrderId: true,
    },
  });
  if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

  const base = (process.env.WT_API_URL || process.env.WELLNESS_TECH_API_URL || "").replace(/\/$/, "");
  const secret = process.env.WT_PARTNER_ORDER_SECRET?.trim();
  if (!base || !secret) {
    return NextResponse.json({ ok: false, error: "WT_API_URL / WT_PARTNER_ORDER_SECRET not configured." }, { status: 500 });
  }

  const lookup = order.distributionOrderId || order.orderNumber;
  const res = await fetch(`${base}/api/partner/orders/${encodeURIComponent(lookup)}`, {
    headers: {
      Accept: "application/json",
      "x-wt-partner-secret": secret,
      "x-wt-partner-site": "kian-prive",
    },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    status?: string;
    trackingNumber?: string | null;
    carrier?: string | null;
    trackingUrl?: string | null;
    rxhereOrderId?: string | null;
    error?: string;
  };
  if (!res.ok || !data.ok) {
    return NextResponse.json(
      { ok: false, error: data.error || `Wellness Tech status failed (${res.status}).` },
      { status: 502 },
    );
  }

  const applied = await applyDistributionFulfillmentUpdate({
    externalRef: order.orderNumber,
    status: data.status,
    trackingNumber: data.trackingNumber,
    carrier: data.carrier,
    trackingUrl: data.trackingUrl,
    rxhereOrderId: data.rxhereOrderId || undefined,
    distributionStatus: data.status,
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "commerce.order.refresh_distribution",
    entityType: "Order",
    entityId: order.id,
    metadata: { orderNumber: order.orderNumber, data, applied },
  });

  return NextResponse.json({ ok: true, applied, remote: data });
}
