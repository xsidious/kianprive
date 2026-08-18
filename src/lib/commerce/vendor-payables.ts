import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { publicAppBaseUrl } from "@/lib/intake/tracking";

function money(value: Prisma.Decimal | number | null | undefined) {
  return Number(value ?? 0);
}

export async function createVendorPayablesForOrder(orderId: string) {
  const existing = await prisma.vendorPayable.count({ where: { orderId } });
  if (existing > 0) return prisma.vendorPayable.findMany({ where: { orderId } });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              sku: true,
              wholesalePrice: true,
              vendorId: true,
            },
          },
        },
      },
    },
  });
  if (!order) return [];

  const grouped = new Map<
    string,
    { amount: number; notes: string[] }
  >();

  for (const item of order.items) {
    const vendorId = item.product.vendorId;
    if (!vendorId) continue;
    const unitCost = money(item.product.wholesalePrice);
    const line = unitCost * item.quantity;
    const current = grouped.get(vendorId) ?? { amount: 0, notes: [] };
    current.amount += line;
    current.notes.push(
      `${item.title} × ${item.quantity}${unitCost > 0 ? ` @ $${unitCost.toFixed(2)} cost` : " (set vendor cost)"}`,
    );
    grouped.set(vendorId, current);
  }

  if (!grouped.size) return [];

  const created = await prisma.$transaction(
    [...grouped.entries()].map(([vendorId, group], index) =>
      prisma.vendorPayable.create({
        data: {
          vendorId,
          orderId,
          amount: new Prisma.Decimal(group.amount.toFixed(2)),
          reference: `KP-PO-${order.orderNumber.replace(/^KP-/, "")}-${index + 1}`,
          notes: group.notes.join("\n"),
          status: "OPEN",
        },
      }),
    ),
  );

  return created;
}

export async function emailVendorPurchaseOrder(payableId: string) {
  const payable = await prisma.vendorPayable.findUnique({
    where: { id: payableId },
    include: {
      vendor: true,
      order: {
        include: {
          items: { include: { product: { select: { vendorId: true, sku: true, wholesalePrice: true } } } },
          intakeSubmission: { select: { fullName: true, email: true, phone: true } },
        },
      },
    },
  });
  if (!payable) throw new Error("Vendor bill not found.");
  if (!payable.vendor.email) throw new Error("Vendor is missing an email address.");

  const vendorItems = payable.order.items.filter((item) => item.product.vendorId === payable.vendorId);
  const itemLines = vendorItems
    .map((item) => {
      const cost = money(item.product.wholesalePrice);
      return `• ${item.title}${item.sku ? ` (${item.sku})` : ""} × ${item.quantity}${
        cost > 0 ? ` — cost $${(cost * item.quantity).toFixed(2)}` : ""
      }`;
    })
    .join("\n");

  const patient = payable.order.intakeSubmission?.fullName || payable.order.email || "KIAN Privé patient";
  const ship = payable.order.shippingAddress as Record<string, string> | null;
  const shipLine = ship
    ? [ship.line1 || ship.address, ship.city, ship.state, ship.postal || ship.zipCode].filter(Boolean).join(", ")
    : "";

  await sendTransactionalEmail({
    to: payable.vendor.email,
    subject: `Purchase order ${payable.reference} — ${payable.order.orderNumber}`,
    text: [
      `Hello ${payable.vendor.contactName || payable.vendor.name},`,
      "",
      `Please fulfill this KIAN Privé purchase order.`,
      `PO: ${payable.reference}`,
      `Patient order: ${payable.order.orderNumber}`,
      `Patient: ${patient}`,
      payable.order.phone ? `Phone: ${payable.order.phone}` : "",
      shipLine ? `Ship to: ${shipLine}` : "",
      `Amount due to you: $${money(payable.amount).toFixed(2)}`,
      "",
      "Items:",
      itemLines || "See attached notes.",
      payable.notes ? `\nNotes:\n${payable.notes}` : "",
      "",
      "— KIAN Privé",
    ]
      .filter((line) => line !== "")
      .join("\n"),
    html: `<p>Hello ${payable.vendor.contactName || payable.vendor.name},</p>
<p>Please fulfill this KIAN Privé purchase order.</p>
<p>PO: <strong>${payable.reference}</strong><br/>Patient order: <strong>${payable.order.orderNumber}</strong><br/>Patient: ${patient}${
      shipLine ? `<br/>Ship to: ${shipLine}` : ""
    }</p>
<p>Amount due: <strong>$${money(payable.amount).toFixed(2)}</strong></p>
<pre style="font-family:inherit;white-space:pre-wrap">${itemLines || payable.notes || ""}</pre>
<p>— KIAN Privé</p>`,
  });

  return prisma.vendorPayable.update({
    where: { id: payableId },
    data: { status: payable.status === "PAID" ? "PAID" : "SENT", sentAt: payable.sentAt ?? new Date() },
  });
}

export function vendorAdminUrl() {
  return `${publicAppBaseUrl()}/admin/vendors`;
}
