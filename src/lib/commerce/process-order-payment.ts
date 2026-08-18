import { prisma } from "@/lib/prisma";
import { chargeAuthorizeNetCard, isTherapyPaymentTestMode } from "@/lib/authorize-net";
import { createProductCommissionsForOrder } from "@/lib/commissions";
import { createIntakeMessage } from "@/lib/intake/messages";
import { sendTransactionalEmail } from "@/lib/email";
import { createVendorPayablesForOrder } from "@/lib/commerce/vendor-payables";
import { activateTherapySubscriptionFromPayment } from "@/lib/commerce/therapy-subscriptions";
import { formatChargeDate, intervalLabel } from "@/lib/commerce/therapy-billing";

type OpaqueData = { dataDescriptor: string; dataValue: string };

export async function processOrderCardPayment(input: {
  orderId: string;
  opaqueData: OpaqueData;
  billTo?: { firstName?: string; lastName?: string; zip?: string };
  testCardNumber?: string;
  payerUserId?: string | null;
  payerEmail?: string | null;
}) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: {
      intakeSubmission: true,
      partner: { include: { user: { select: { email: true } } } },
      therapyProposal: true,
      therapySubscription: true,
      items: true,
    },
  });
  if (!order) {
    throw new Error("Order not found.");
  }
  if (order.paymentStatus === "PAID") {
    throw new Error("Order already paid.");
  }
  if (Number(order.total) <= 0 || !order.items.length) {
    throw new Error("Order is not ready for payment.");
  }

  const testMode = isTherapyPaymentTestMode();
  const charge = await chargeAuthorizeNetCard({
    amount: Number(order.total),
    orderNumber: order.orderNumber,
    opaqueData: input.opaqueData,
    email: order.email ?? order.intakeSubmission?.email ?? input.payerEmail ?? undefined,
    billTo: input.billTo,
    testCardNumber: input.testCardNumber,
  });

  const updated = await prisma.$transaction(async (tx) => {
    if (order.therapyProposal) {
      const proposal = await tx.intakeTherapyProposal.findUnique({
        where: { id: order.therapyProposal.id },
        include: {
          items: {
            include: {
              product: { select: { id: true, title: true, sku: true, price: true } },
            },
          },
        },
      });

      if (proposal?.items.length) {
        const lineItems = proposal.items.map((item) => {
          const existing = order.items.find((oi) => oi.productId === item.productId);
          const unit =
            existing ? Number(existing.unitPrice)
            : item.unitPrice != null ? Number(item.unitPrice)
            : Number(item.product.price);
          const qty = item.quantity;
          return {
            productId: item.productId,
            partnerId: order.partnerId,
            title: item.titleSnapshot || item.product.title,
            sku: item.product.sku,
            quantity: qty,
            unitPrice: unit,
            lineTotal: unit * qty,
          };
        });
        const subtotal = lineItems.reduce((s, i) => s + i.lineTotal, 0);
        await tx.orderItem.deleteMany({ where: { orderId: order.id } });
        await tx.order.update({
          where: { id: order.id },
          data: {
            items: { create: lineItems },
            subtotal,
            total: subtotal,
            paymentStatus: "PAID",
            status: "PAID",
            fulfillmentStatus: "PROCESSING",
            authorizeNetTransId: charge.transId,
            userId: order.userId ?? order.intakeSubmission?.userId ?? input.payerUserId ?? undefined,
            email: order.email ?? order.intakeSubmission?.email ?? input.payerEmail ?? undefined,
            phone: order.phone ?? order.intakeSubmission?.phone ?? undefined,
          },
        });
      } else {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            status: "PAID",
            fulfillmentStatus: "PROCESSING",
            authorizeNetTransId: charge.transId,
            userId: order.userId ?? order.intakeSubmission?.userId ?? input.payerUserId ?? undefined,
          },
        });
      }

      await tx.intakeTherapyProposal.update({
        where: { id: order.therapyProposal.id },
        data: { status: "PAID", paidAt: new Date() },
      });
    } else {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "PAID",
          fulfillmentStatus: "PROCESSING",
          authorizeNetTransId: charge.transId,
          userId: order.userId ?? order.intakeSubmission?.userId ?? input.payerUserId ?? undefined,
          email: order.email ?? input.payerEmail ?? undefined,
        },
      });
    }

    await tx.paymentRecord.create({
      data: {
        orderId: order.id,
        provider: testMode || charge.testMode ? "authorize.net.test" : "authorize.net",
        status: "PAID",
        amount: order.total,
        currency: order.currency,
        metadata: {
          authCode: charge.authCode,
          transId: charge.transId,
          testMode: testMode || Boolean(charge.testMode),
          amountCharged: Number(order.total),
          raw: charge.raw,
        },
      },
    });

    return tx.order.findUnique({
      where: { id: order.id },
      include: { items: true, payments: true },
    });
  });

  await createProductCommissionsForOrder(order.id);
  const payables = await createVendorPayablesForOrder(order.id);

  const proposalId = order.therapyProposal?.id ?? order.therapySubscription?.proposalId;
  const activated = proposalId
    ? await activateTherapySubscriptionFromPayment({
        proposalId,
        orderId: order.id,
        transId: charge.transId,
        amount: Number(order.total),
        email: order.email ?? order.intakeSubmission?.email ?? input.payerEmail,
        last4: charge.last4,
      })
    : null;

  if (order.intakeSubmissionId) {
    await createIntakeMessage({
      intakeSubmissionId: order.intakeSubmissionId,
      authorRole: "SYSTEM",
      authorName: "KIAN Privé",
      body: testMode
        ? `Payment recorded for order ${order.orderNumber}. Fulfillment can begin.`
        : `Payment received for order ${order.orderNumber}. Fulfillment can begin.`,
      notifyPatient: false,
    });
  }

  const providerEmail = order.partner?.user?.email;
  if (providerEmail) {
    await sendTransactionalEmail({
      to: providerEmail,
      subject: `${testMode ? "[TEST] " : ""}Therapy paid — ${order.orderNumber}`,
      text: `Patient completed payment for order ${order.orderNumber}. Fulfillment can proceed.`,
      html: `<p>Patient completed payment for order <strong>${order.orderNumber}</strong>.</p><p>Fulfillment can proceed.</p>`,
    });
  }

  const adminTo = process.env.PEPTIDE_INTAKE_REPORT_EMAIL || process.env.BOOKING_REPORT_EMAIL;
  if (adminTo) {
    const itemLines =
      updated?.items?.map((i) => `- ${i.title} × ${i.quantity} @ $${Number(i.unitPrice).toFixed(2)}`).join("\n") ||
      "(no items)";
    const vendorLines = payables.length
      ? payables.map((p) => `- ${p.reference} · $${Number(p.amount).toFixed(2)}`).join("\n")
      : "No vendor assigned on these products yet.";
    await sendTransactionalEmail({
      to: adminTo,
      subject: `${testMode ? "[TEST] " : ""}Order paid — ${order.orderNumber}`,
      text: [
        `Order ${order.orderNumber} paid.`,
        `Payment ID: ${charge.transId}`,
        `Amount: $${Number(order.total).toFixed(2)}`,
        `Patient: ${order.intakeSubmission?.fullName ?? "—"} <${order.email ?? order.intakeSubmission?.email ?? ""}>`,
        "",
        "Products:",
        itemLines,
        "",
        "Vendor bills created:",
        vendorLines,
        "",
        "Pay vendors in Admin → Vendors. Mark fulfilled in Admin → Orders after shipping.",
      ].join("\n"),
    });
  }

  if (order.email || order.intakeSubmission?.email) {
    const nextCharge =
      activated && activated.status === "ACTIVE"
        ? formatChargeDate(activated.nextChargeAt)
        : null;
    const refillNote =
      activated && activated.status === "ACTIVE"
        ? ` This therapy bills ${intervalLabel(activated.interval, activated.intervalDays)}. Next charge: ${nextCharge ?? "scheduled"}.`
        : "";
    await sendTransactionalEmail({
      to: (order.email || order.intakeSubmission?.email) as string,
      subject: `Payment received — ${order.orderNumber}`,
      text: `Thank you. We received payment for ${order.orderNumber} ($${Number(order.total).toFixed(2)}). Our team will fulfill your order.${refillNote}`,
      html: `<p>Thank you. We received payment for <strong>${order.orderNumber}</strong> ($${Number(order.total).toFixed(2)}).</p><p>Our team will fulfill your order.</p>${
        refillNote ? `<p>${refillNote.trim()}</p>` : ""
      }`,
    });
  }

  return {
    order: updated
      ? {
          id: updated.id,
          orderNumber: updated.orderNumber,
          paymentStatus: updated.paymentStatus,
          status: updated.status,
          fulfillmentStatus: updated.fulfillmentStatus,
        }
      : null,
    transId: charge.transId,
    testMode: testMode || Boolean(charge.testMode),
    amountPaid: Number(order.total),
  };
}
