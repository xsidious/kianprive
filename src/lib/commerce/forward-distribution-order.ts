import { prisma } from "@/lib/prisma";

type ShipAddress = Record<string, string | null | undefined>;

function shipTo(address: unknown) {
  if (!address || typeof address !== "object") return undefined;
  const ship = address as ShipAddress;
  const street1 = ship.line1 || ship.address || ship.street1 || undefined;
  const payload = {
    name: ship.name || ship.fullName || undefined,
    street1: street1 || undefined,
    street2: ship.line2 || ship.street2 || undefined,
    city: ship.city || undefined,
    state: ship.state || undefined,
    zip: ship.postal || ship.zip || ship.zipCode || undefined,
  };
  return Object.values(payload).some(Boolean) ? payload : undefined;
}

/**
 * After KIAN collects payment, place the same product lines on Wellness Tech Distribution.
 * That site splits the order into pharmacy sub-orders. Payment on KIAN is not rolled back if this fails.
 */
export async function forwardPaidOrderToWellnessTech(orderId: string) {
  const base = (process.env.WT_API_URL || process.env.WELLNESS_TECH_API_URL || "").replace(/\/$/, "");
  const secret = process.env.WT_PARTNER_ORDER_SECRET?.trim();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: { select: { sku: true } } },
      },
    },
  });
  if (!order) return { ok: false as const, error: "Order not found." };
  if (order.distributionOrderId) {
    return { ok: true as const, orderId: order.distributionOrderId, duplicate: true };
  }
  if (!order.items.length) {
    return { ok: false as const, skipped: true, error: "No product lines." };
  }

  const email = order.email?.trim();
  const lines = order.items
    .map((item) => ({
      sku: (item.sku || item.product.sku || "").trim(),
      qty: item.quantity,
      title: item.title,
    }))
    .filter((line) => line.qty > 0);

  const missingSku = lines.filter((line) => !line.sku).map((line) => line.title);
  const sendable = lines.filter((line) => line.sku);

  if (!base || !secret) {
    const error = "WT_API_URL / WT_PARTNER_ORDER_SECRET is not configured.";
    await prisma.order.update({ where: { id: order.id }, data: { distributionSyncError: error } });
    return { ok: false as const, error };
  }
  if (!email) {
    const error = "Order has no customer email, so it was not sent to Wellness Tech.";
    await prisma.order.update({ where: { id: order.id }, data: { distributionSyncError: error } });
    return { ok: false as const, error };
  }
  if (!sendable.length) {
    const error = "No product SKUs to send to Wellness Tech.";
    await prisma.order.update({ where: { id: order.id }, data: { distributionSyncError: error } });
    return { ok: false as const, error };
  }

  try {
    const res = await fetch(`${base}/api/partner/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wt-partner-secret": secret,
        "x-wt-partner-site": "kian-prive",
      },
      body: JSON.stringify({
        externalRef: order.orderNumber,
        email,
        partnerSite: "kian-prive",
        lines: sendable.map((line) => ({ sku: line.sku, qty: line.qty })),
        notes: [
          `KIAN Privé order ${order.orderNumber}`,
          missingSku.length ? `Lines without a SKU were not sent: ${missingSku.join(", ")}` : "",
          order.notes || "",
        ]
          .filter(Boolean)
          .join("\n"),
        shipTo: shipTo(order.shippingAddress),
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      orderId?: string;
    };

    if (!res.ok || !data.orderId) {
      const error = data.error || `Wellness Tech order failed (${res.status}).`;
      await prisma.order.update({ where: { id: order.id }, data: { distributionSyncError: error } });
      return { ok: false as const, error };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { distributionOrderId: data.orderId, distributionSyncError: null },
    });
    return { ok: true as const, orderId: data.orderId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach Wellness Tech.";
    await prisma.order
      .update({ where: { id: order.id }, data: { distributionSyncError: message } })
      .catch(() => undefined);
    console.error("[distribution] forward failed:", order.orderNumber, message);
    return { ok: false as const, error: message };
  }
}
