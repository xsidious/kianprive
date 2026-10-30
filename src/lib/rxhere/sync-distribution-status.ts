import { prisma } from "@/lib/prisma";
import { applyDistributionFulfillmentUpdate } from "@/lib/rxhere/apply-fulfillment-update";
import { fetchRxHereOrder } from "@/lib/rxhere/client";

type WtOrderStatus = {
  ok?: boolean;
  orderId?: string;
  status?: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  trackingUrl?: string | null;
  rxhereOrderId?: string | null;
  fulfillment?: {
    status?: string;
    trackingNumber?: string | null;
    carrier?: string | null;
    trackingUrl?: string | null;
  };
  error?: string;
};

async function fetchWellnessTechOrderStatus(distributionOrderId: string): Promise<WtOrderStatus | null> {
  const base = (process.env.WT_API_URL || process.env.WELLNESS_TECH_API_URL || "").replace(/\/$/, "");
  const secret = process.env.WT_PARTNER_ORDER_SECRET?.trim();
  if (!base || !secret) return null;

  const urls = [
    `${base}/api/partner/orders/${encodeURIComponent(distributionOrderId)}`,
    `${base}/api/partner/orders/status?id=${encodeURIComponent(distributionOrderId)}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "x-wt-partner-secret": secret,
          "x-wt-partner-site": "kian-prive",
        },
        cache: "no-store",
      });
      if (res.status === 404) continue;
      if (!res.ok) continue;
      const data = (await res.json().catch(() => null)) as WtOrderStatus | null;
      if (data) return data;
    } catch {
      /* try next */
    }
  }
  return null;
}

/**
 * Poll Wellness Tech (and Rx Here when we have an Rx Here order id) for open distribution orders.
 */
export async function syncOpenDistributionStatuses(limit = 40) {
  const open = await prisma.order.findMany({
    where: {
      distributionOrderId: { not: null },
      status: { in: ["PENDING", "PROCESSING", "FULFILLED"] },
      paymentStatus: "PAID",
      NOT: { status: "DELIVERED" },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      distributionOrderId: true,
      rxhereOrderId: true,
      status: true,
    },
  });

  const results: Array<{
    orderNumber: string;
    ok: boolean;
    source?: string;
    error?: string;
    status?: string;
    trackingNumber?: string | null;
  }> = [];

  for (const order of open) {
    const distId = order.distributionOrderId!;
    let applied = false;

    const wt = await fetchWellnessTechOrderStatus(distId);
    if (wt && (wt.status || wt.trackingNumber || wt.fulfillment)) {
      const update = await applyDistributionFulfillmentUpdate({
        externalRef: order.orderNumber,
        status: wt.status || wt.fulfillment?.status,
        trackingNumber: wt.trackingNumber || wt.fulfillment?.trackingNumber,
        carrier: wt.carrier || wt.fulfillment?.carrier,
        trackingUrl: wt.trackingUrl || wt.fulfillment?.trackingUrl,
        rxhereOrderId: wt.rxhereOrderId || undefined,
        distributionStatus: wt.status || undefined,
      });
      results.push({
        orderNumber: order.orderNumber,
        ok: update.ok,
        source: "wellness-tech",
        error: update.ok ? undefined : update.error,
        status: update.ok ? update.status : undefined,
        trackingNumber: update.ok ? update.trackingNumber : null,
      });
      applied = true;
    }

    const rxId = order.rxhereOrderId || wt?.rxhereOrderId;
    if (rxId) {
      const rx = await fetchRxHereOrder(rxId);
      if (rx.ok) {
        const payload = ("data" in (rx.data as object) ? (rx.data as { data: unknown }).data : rx.data) as {
          status?: string;
          fulfillment?: {
            tracking_number?: string | null;
            tracking_carrier?: string | null;
            tracking_url?: string | null;
            status?: string | null;
          } | null;
          id?: string;
        };
        const update = await applyDistributionFulfillmentUpdate({
          externalRef: order.orderNumber,
          status: payload.status || payload.fulfillment?.status,
          trackingNumber: payload.fulfillment?.tracking_number,
          carrier: payload.fulfillment?.tracking_carrier,
          trackingUrl: payload.fulfillment?.tracking_url,
          rxhereOrderId: payload.id || rxId,
          distributionStatus: payload.status,
        });
        results.push({
          orderNumber: order.orderNumber,
          ok: update.ok,
          source: "rxhere",
          error: update.ok ? undefined : update.error,
          status: update.ok ? update.status : undefined,
          trackingNumber: update.ok ? update.trackingNumber : null,
        });
        applied = true;
      }
    }

    if (!applied) {
      results.push({
        orderNumber: order.orderNumber,
        ok: false,
        error: "No status endpoint responded yet (WT poll and/or Rx Here order id).",
      });
    }
  }

  return {
    checked: open.length,
    updated: results.filter((r) => r.ok).length,
    results,
  };
}
