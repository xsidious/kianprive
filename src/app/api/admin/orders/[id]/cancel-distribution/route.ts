import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";
import { applyDistributionFulfillmentUpdate } from "@/lib/eventide/apply-fulfillment-update";

type Params = { params: Promise<{ id: string }> };

/**
 * Ask Wellness Tech to cancel the VitaRelay order before ship, then mirror cancel on KIAN.
 */
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
      eventideOrderId: true,
      status: true,
      fulfillmentStatus: true,
    },
  });
  if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  if (order.status === "DELIVERED" || order.fulfillmentStatus === "DELIVERED") {
    return NextResponse.json({ ok: false, error: "Delivered orders cannot be cancelled." }, { status: 400 });
  }

  const base = (process.env.WT_API_URL || process.env.WELLNESS_TECH_API_URL || "").replace(/\/$/, "");
  const secret = process.env.WT_PARTNER_ORDER_SECRET?.trim();
  if (!base || !secret || !order.distributionOrderId) {
    return NextResponse.json(
      { ok: false, error: "Missing WT config or distribution order id." },
      { status: 400 },
    );
  }

  const res = await fetch(`${base}/api/partner/orders/${encodeURIComponent(order.distributionOrderId)}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wt-partner-secret": secret,
      "x-wt-partner-site": "kian-prive",
    },
    body: "{}",
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; status?: string };

  if (!res.ok || !data.ok) {
    return NextResponse.json(
      { ok: false, error: data.error || `Cancel failed (${res.status}).` },
      { status: 502 },
    );
  }

  const applied = await applyDistributionFulfillmentUpdate({
    externalRef: order.orderNumber,
    status: "cancelled",
    event: "order.cancelled",
    distributionStatus: "cancelled",
    eventideOrderId: order.eventideOrderId || undefined,
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "commerce.order.cancel_distribution",
    entityType: "Order",
    entityId: order.id,
    metadata: { orderNumber: order.orderNumber, data, applied },
  });

  return NextResponse.json({ ok: true, applied, remote: data });
}
