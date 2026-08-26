import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { publicAppBaseUrl } from "@/lib/intake/tracking";

function money(value: Prisma.Decimal | number | null | undefined) {
  return Number(value ?? 0);
}

function autoEmailPurchaseOrdersEnabled() {
  return process.env.WELLNESS_TECH_AUTO_EMAIL_PO !== "false";
}

/** Ensures the Wellness Tech vendor exists when WELLNESS_TECH_VENDOR_EMAIL is configured. */
export async function ensureWellnessTechVendor() {
  const email = process.env.WELLNESS_TECH_VENDOR_EMAIL?.trim();
  if (!email) return null;

  const name = process.env.WELLNESS_TECH_VENDOR_NAME?.trim() || "Wellness Tech";
  const contactName = process.env.WELLNESS_TECH_VENDOR_CONTACT?.trim() || null;

  const existing = await prisma.vendor.findFirst({
    where: {
      OR: [
        { email: { equals: email, mode: "insensitive" } },
        { name: { equals: name, mode: "insensitive" } },
      ],
    },
  });

  if (existing) {
    if (existing.email?.toLowerCase() === email.toLowerCase() && existing.name === name) {
      return existing;
    }
    return prisma.vendor.update({
      where: { id: existing.id },
      data: {
        email: existing.email || email,
        contactName: existing.contactName || contactName,
        notes:
          existing.notes ||
          "Product-cost settlement partner. Patient pays KIAN via Authorize.net; this vendor is owed wholesale cost.",
      },
    });
  }

  return prisma.vendor.create({
    data: {
      name,
      email,
      contactName,
      paymentMethod: "ACH",
      notes:
        "Product-cost settlement partner. Patient pays KIAN via Authorize.net; this vendor is owed wholesale cost. ACH the amount on each PO after settlement, then mark paid in Admin → Vendors.",
    },
  });
}

async function unitCostForProduct(productId: string, vendorId: string, wholesalePrice: Prisma.Decimal | number | null) {
  const offer = await prisma.productVendorOffer.findUnique({
    where: { productId_vendorId: { productId, vendorId } },
  });
  if (offer) return money(offer.unitCost) + money(offer.shippingCost);
  return money(wholesalePrice);
}

/**
 * After a patient pays via Authorize.net: create vendor cost bills (owed to Wellness Tech / pharmacies),
 * optionally email purchase orders, and return the split summary (patient paid vs vendor cost vs KIAN margin).
 */
export async function settleVendorCostsAfterPayment(orderId: string) {
  await ensureWellnessTechVendor();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, title: true, sku: true, wholesalePrice: true, vendorId: true },
          },
        },
      },
      vendorPayables: {
        include: { vendor: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!order) {
    return {
      orderId,
      orderTotal: 0,
      vendorCostTotal: 0,
      kianMargin: 0,
      payables: [] as Array<{
        id: string;
        reference: string;
        amount: number;
        vendorName: string;
        vendorEmail: string | null;
        emailed: boolean;
        emailError?: string;
      }>,
      missingCostLines: [] as string[],
    };
  }

  await createVendorPayablesForOrder(orderId);
  const payablesWithVendor = await prisma.vendorPayable.findMany({
    where: { orderId },
    include: { vendor: { select: { id: true, name: true, email: true } } },
  });

  const fallbackVendor = await ensureWellnessTechVendor();
  const missingCostLines: string[] = [];
  for (const item of order.items) {
    const vendorId = item.product.vendorId || fallbackVendor?.id;
    if (!vendorId) {
      missingCostLines.push(
        `${item.title} — no vendor (set product vendor or WELLNESS_TECH_VENDOR_EMAIL)`,
      );
      continue;
    }
    const unit = await unitCostForProduct(item.product.id, vendorId, item.product.wholesalePrice);
    if (unit <= 0) {
      missingCostLines.push(`${item.title} — wholesale / vendor cost is $0`);
    }
  }

  const results: Array<{
    id: string;
    reference: string;
    amount: number;
    vendorName: string;
    vendorEmail: string | null;
    emailed: boolean;
    emailError?: string;
  }> = [];

  for (const payable of payablesWithVendor) {
    let emailed = false;
    let emailError: string | undefined;

    if (autoEmailPurchaseOrdersEnabled() && payable.status === "OPEN" && payable.vendor.email) {
      try {
        await emailVendorPurchaseOrder(payable.id);
        emailed = true;
      } catch (error) {
        emailError = error instanceof Error ? error.message : "Could not email purchase order.";
        console.error("[vendor-payables] Auto PO email failed:", payable.id, emailError);
      }
    } else if (!payable.vendor.email) {
      emailError = "Vendor has no PO email.";
    }

    results.push({
      id: payable.id,
      reference: payable.reference,
      amount: money(payable.amount),
      vendorName: payable.vendor.name,
      vendorEmail: payable.vendor.email,
      emailed,
      emailError,
    });
  }

  const vendorCostTotal = results.reduce((sum, row) => sum + row.amount, 0);
  const orderTotal = money(order.total);

  return {
    orderId,
    orderTotal,
    vendorCostTotal,
    kianMargin: Math.max(0, orderTotal - vendorCostTotal),
    payables: results,
    missingCostLines,
  };
}

export async function createVendorPayablesForOrder(orderId: string) {
  const existing = await prisma.vendorPayable.count({ where: { orderId } });
  if (existing > 0) return prisma.vendorPayable.findMany({ where: { orderId } });

  const fallbackVendor = await ensureWellnessTechVendor();

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

  const grouped = new Map<string, { amount: number; notes: string[] }>();

  for (const item of order.items) {
    const vendorId = item.product.vendorId || fallbackVendor?.id;
    if (!vendorId) continue;

    const unitCost = await unitCostForProduct(item.product.id, vendorId, item.product.wholesalePrice);
    const line = unitCost * item.quantity;
    const current = grouped.get(vendorId) ?? { amount: 0, notes: [] };
    current.amount += line;
    current.notes.push(
      `${item.title} × ${item.quantity}${
        unitCost > 0 ? ` @ $${unitCost.toFixed(2)} cost` : " (set vendor cost on product / offer)"
      }`,
    );
    grouped.set(vendorId, current);
  }

  if (!grouped.size) return [];

  return prisma.$transaction(
    [...grouped.entries()].map(([vendorId, group], index) =>
      prisma.vendorPayable.create({
        data: {
          vendorId,
          orderId,
          amount: new Prisma.Decimal(group.amount.toFixed(2)),
          reference: `KP-PO-${order.orderNumber.replace(/^KP-/, "")}-${index + 1}`,
          notes: [
            "Product cost owed to vendor after patient Authorize.net payment.",
            "KIAN keeps: patient total − this bill − card fees.",
            "",
            ...group.notes,
          ].join("\n"),
          status: "OPEN",
        },
      }),
    ),
  );
}

export async function emailVendorPurchaseOrder(payableId: string) {
  const payable = await prisma.vendorPayable.findUnique({
    where: { id: payableId },
    include: {
      vendor: true,
      order: {
        include: {
          items: {
            include: {
              product: {
                select: { id: true, vendorId: true, sku: true, wholesalePrice: true },
              },
            },
          },
          intakeSubmission: { select: { fullName: true, email: true, phone: true } },
        },
      },
    },
  });
  if (!payable) throw new Error("Vendor bill not found.");
  if (!payable.vendor.email) throw new Error("Vendor is missing an email address.");

  const fallbackVendor = await ensureWellnessTechVendor();
  const vendorItems = payable.order.items.filter((item) => {
    const assigned = item.product.vendorId || fallbackVendor?.id;
    return assigned === payable.vendorId;
  });

  const itemLinesParts: string[] = [];
  for (const item of vendorItems) {
    const unitCost = await unitCostForProduct(item.product.id, payable.vendorId, item.product.wholesalePrice);
    itemLinesParts.push(
      `• ${item.title}${item.sku ? ` (${item.sku})` : ""} × ${item.quantity}${
        unitCost > 0 ? ` — cost $${(unitCost * item.quantity).toFixed(2)}` : ""
      }`,
    );
  }
  const itemLines = itemLinesParts.join("\n");

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
      `Amount due to you (product cost): $${money(payable.amount).toFixed(2)}`,
      "",
      "Items:",
      itemLines || "See attached notes.",
      payable.notes ? `\nNotes:\n${payable.notes}` : "",
      "",
      "KIAN Privé will ACH / wire this product-cost amount after patient settlement. Reply to confirm fulfillment.",
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
<p>Amount due to you (product cost): <strong>$${money(payable.amount).toFixed(2)}</strong></p>
<pre style="font-family:inherit;white-space:pre-wrap">${itemLines || payable.notes || ""}</pre>
<p style="color:#6f6251;font-size:13px;">KIAN Privé will ACH / wire this product-cost amount after patient settlement.</p>
<p>— KIAN Privé</p>`,
  });

  return prisma.vendorPayable.update({
    where: { id: payableId },
    data: { status: payable.status === "PAID" ? "PAID" : "SENT", sentAt: payable.sentAt ?? new Date() },
  });
}

export function formatVendorSettlementText(summary: Awaited<ReturnType<typeof settleVendorCostsAfterPayment>>) {
  const payableLines = summary.payables.length
    ? summary.payables
        .map((p) => {
          const mail = p.emailed ? "PO emailed" : p.emailError ? `PO not emailed (${p.emailError})` : "PO pending";
          return `- ${p.vendorName} · ${p.reference} · $${p.amount.toFixed(2)} · ${mail}`;
        })
        .join("\n")
    : "No vendor cost bills created (assign vendor + wholesale cost on products).";

  return [
    `Patient paid (Authorize.net): $${summary.orderTotal.toFixed(2)}`,
    `Owed to vendor(s) / Wellness Tech: $${summary.vendorCostTotal.toFixed(2)}`,
    `KIAN keeps (before card fees): $${summary.kianMargin.toFixed(2)}`,
    "",
    "Vendor bills:",
    payableLines,
    summary.missingCostLines.length
      ? `\nNeeds attention:\n${summary.missingCostLines.map((line) => `- ${line}`).join("\n")}`
      : "",
    "",
    `Manage payouts: ${vendorAdminUrl()}`,
    "After you ACH the vendor cost, open Admin → Vendors → Record vendor paid.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function vendorAdminUrl() {
  return `${publicAppBaseUrl()}/admin/vendors`;
}
