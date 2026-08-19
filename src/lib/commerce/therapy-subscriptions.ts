import { Prisma, TherapyBillingInterval, TherapySubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  chargeCustomerProfile,
  createCustomerProfileFromTransaction,
  isTherapyPaymentTestMode,
} from "@/lib/authorize-net";
import { createProductCommissionsForOrder } from "@/lib/commissions";
import { createIntakeMessage } from "@/lib/intake/messages";
import { sendTransactionalEmail } from "@/lib/email";
import { buildTherapyRefillEmail, buildSimpleEmail } from "@/lib/email-templates";
import { createVendorPayablesForOrder } from "@/lib/commerce/vendor-payables";
import { issueOrderPaymentToken } from "@/lib/commerce/payment-link";
import { sendInvoiceEmail } from "@/lib/commerce/invoices";
import { addUtcDays, intervalLabel, resolveIntervalDays } from "@/lib/commerce/therapy-billing";

function money(value: Prisma.Decimal | number | null | undefined) {
  return Number(value ?? 0);
}

export async function syncTherapySubscriptionForProposal(input: {
  proposalId: string;
  intakeSubmissionId: string;
  email?: string | null;
  amount: number;
  billingInterval: TherapyBillingInterval;
  intervalDays?: number | null;
  orderId?: string | null;
}) {
  const existing = await prisma.therapySubscription.findUnique({
    where: { proposalId: input.proposalId },
  });

  if (input.billingInterval === "ONE_TIME") {
    if (existing && existing.status === "PENDING") {
      await prisma.therapySubscription.update({
        where: { id: existing.id },
        data: { status: "CANCELED", canceledAt: new Date() },
      });
    }
    return null;
  }

  const days = resolveIntervalDays(input.billingInterval, input.intervalDays);
  const data = {
    intakeSubmissionId: input.intakeSubmissionId,
    interval: input.billingInterval,
    intervalDays: days,
    amount: new Prisma.Decimal(input.amount.toFixed(2)),
    email: input.email ?? existing?.email ?? null,
  };

  const subscription = existing
    ? await prisma.therapySubscription.update({
        where: { id: existing.id },
        data: {
          ...data,
          ...(existing.status === "CANCELED"
            ? { status: "PENDING" as const, canceledAt: null, failureCount: 0, lastError: null }
            : {}),
        },
      })
    : await prisma.therapySubscription.create({
        data: {
          proposalId: input.proposalId,
          status: "PENDING",
          ...data,
        },
      });

  if (input.orderId) {
    await prisma.order.update({
      where: { id: input.orderId },
      data: { therapySubscriptionId: subscription.id },
    });
  }

  return subscription;
}

export async function activateTherapySubscriptionFromPayment(input: {
  proposalId: string;
  orderId: string;
  transId: string;
  amount: number;
  email?: string | null;
  last4?: string | null;
}) {
  const subscription = await prisma.therapySubscription.findUnique({
    where: { proposalId: input.proposalId },
  });
  if (!subscription || subscription.status === "CANCELED") return null;
  if (subscription.interval === "ONE_TIME") return null;

  const now = new Date();
  let customerProfileId = subscription.customerProfileId;
  let paymentProfileId = subscription.paymentProfileId;
  let lastError = subscription.lastError;

  if (!customerProfileId || !paymentProfileId) {
    try {
      const profile = await createCustomerProfileFromTransaction({
        transId: input.transId,
        email: input.email,
        merchantCustomerId: subscription.id,
      });
      customerProfileId = profile.customerProfileId;
      paymentProfileId = profile.paymentProfileId;
      lastError = null;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Could not save the card on file.";
    }
  }

  const updated = await prisma.therapySubscription.update({
    where: { id: subscription.id },
    data: {
      status: "ACTIVE",
      startedAt: subscription.startedAt ?? now,
      lastChargedAt: now,
      nextChargeAt: addUtcDays(now, subscription.intervalDays),
      amount: new Prisma.Decimal(input.amount.toFixed(2)),
      email: input.email ?? subscription.email,
      customerProfileId,
      paymentProfileId,
      cardLast4: input.last4 ?? subscription.cardLast4,
      failureCount: 0,
      lastError,
    },
  });

  await prisma.order.update({
    where: { id: input.orderId },
    data: { therapySubscriptionId: subscription.id },
  });

  return updated;
}

export async function setTherapySubscriptionStatus(
  id: string,
  status: Extract<TherapySubscriptionStatus, "PAUSED" | "ACTIVE" | "CANCELED">,
) {
  const subscription = await prisma.therapySubscription.findUnique({ where: { id } });
  if (!subscription) throw new Error("Subscription not found.");
  if (subscription.status === "PENDING") {
    throw new Error("The first payment has not been collected yet.");
  }

  if (status === "ACTIVE") {
    if (!subscription.customerProfileId || !subscription.paymentProfileId) {
      throw new Error("No card on file. The patient needs to pay a refill before this can resume automatically.");
    }
    return prisma.therapySubscription.update({
      where: { id },
      data: {
        status: "ACTIVE",
        canceledAt: null,
        lastError: null,
        nextChargeAt: subscription.nextChargeAt && subscription.nextChargeAt > new Date()
          ? subscription.nextChargeAt
          : addUtcDays(new Date(), subscription.intervalDays),
      },
    });
  }

  if (status === "PAUSED") {
    return prisma.therapySubscription.update({
      where: { id },
      data: { status: "PAUSED" },
    });
  }

  return prisma.therapySubscription.update({
    where: { id },
    data: { status: "CANCELED", canceledAt: new Date(), nextChargeAt: null },
  });
}

export async function chargeDueTherapySubscriptions() {
  const due = await prisma.therapySubscription.findMany({
    where: {
      status: { in: ["ACTIVE", "PAST_DUE"] },
      nextChargeAt: { lte: new Date() },
    },
    select: { id: true },
    take: 50,
  });

  const results = [];
  for (const row of due) {
    results.push(await chargeTherapySubscription(row.id, { reason: "scheduled" }));
  }
  return results;
}

export async function chargeTherapySubscription(
  id: string,
  opts?: { force?: boolean; reason?: "scheduled" | "manual" },
) {
  const subscription = await prisma.therapySubscription.findUnique({
    where: { id },
    include: {
      proposal: {
        include: {
          items: {
            include: {
              product: { select: { id: true, title: true, sku: true, price: true } },
            },
          },
          providerPartner: { select: { id: true, displayName: true, user: { select: { email: true } } } },
        },
      },
      intakeSubmission: {
        select: { id: true, email: true, phone: true, userId: true, fullName: true },
      },
    },
  });

  if (!subscription) throw new Error("Subscription not found.");
  if (subscription.status === "CANCELED") throw new Error("This subscription is canceled.");
  if (subscription.status === "PAUSED" && !opts?.force) {
    throw new Error("This subscription is paused.");
  }
  if (subscription.status === "PENDING") {
    throw new Error("The first payment has not been collected yet.");
  }
  if (!opts?.force && subscription.nextChargeAt && subscription.nextChargeAt > new Date()) {
    throw new Error("This refill is not due yet.");
  }

  const items = subscription.proposal.items;
  if (!items.length) throw new Error("This therapy plan has no products.");

  const lineItems = items.map((item) => {
    const unit = item.unitPrice != null ? money(item.unitPrice) : money(item.product.price);
    const qty = Math.max(1, item.quantity);
    return {
      productId: item.productId,
      partnerId: subscription.proposal.providerPartnerId,
      title: item.titleSnapshot || item.product.title,
      sku: item.product.sku,
      quantity: qty,
      unitPrice: unit,
      lineTotal: unit * qty,
    };
  });
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  if (subtotal <= 0) throw new Error("Therapy refill total must be greater than $0.");

  const email = subscription.email || subscription.intakeSubmission.email;
  const label = intervalLabel(subscription.interval, subscription.intervalDays);
  const testMode = isTherapyPaymentTestMode();
  const hasProfile = Boolean(subscription.customerProfileId && subscription.paymentProfileId);

  const existingUnpaid = await prisma.order.findFirst({
    where: { therapySubscriptionId: subscription.id, paymentStatus: "UNPAID" },
    orderBy: { createdAt: "desc" },
  });

  const order =
    existingUnpaid ??
    (await prisma.order.create({
      data: {
        orderNumber: `KP-RX-${Date.now()}`,
        partnerId: subscription.proposal.providerPartnerId,
        intakeSubmissionId: subscription.intakeSubmissionId,
        therapySubscriptionId: subscription.id,
        email,
        phone: subscription.intakeSubmission.phone,
        userId: subscription.intakeSubmission.userId ?? undefined,
        status: "PENDING",
        paymentStatus: "UNPAID",
        fulfillmentStatus: "UNFULFILLED",
        subtotal,
        total: subtotal,
        notes: `Therapy refill (${label}) for ${subscription.intakeSubmission.fullName}`,
        items: {
          create: lineItems.map((item) => ({
            ...item,
            unitPrice: new Prisma.Decimal(item.unitPrice.toFixed(2)),
            lineTotal: new Prisma.Decimal(item.lineTotal.toFixed(2)),
          })),
        },
      },
    }));

  if (!hasProfile) {
    return issueManualRefill(subscription, order, email, Number(order.total) || subtotal, label);
  }

  const amountDue = Number(order.total) || subtotal;

  try {
    const charge = await chargeCustomerProfile({
      amount: amountDue,
      orderNumber: order.orderNumber,
      customerProfileId: subscription.customerProfileId!,
      paymentProfileId: subscription.paymentProfileId!,
      email,
    });

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "PAID",
          fulfillmentStatus: "PROCESSING",
          authorizeNetTransId: charge.transId,
        },
      }),
      prisma.paymentRecord.create({
        data: {
          orderId: order.id,
          provider: testMode || charge.testMode ? "authorize.net.test" : "authorize.net",
          status: "PAID",
          amount: amountDue,
          currency: "USD",
          metadata: {
            authCode: charge.authCode,
            transId: charge.transId,
            testMode: testMode || Boolean(charge.testMode),
            refill: true,
            raw: charge.raw,
          },
        },
      }),
      prisma.therapySubscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          amount: new Prisma.Decimal(amountDue.toFixed(2)),
          lastChargedAt: new Date(),
          nextChargeAt: addUtcDays(new Date(), subscription.intervalDays),
          failureCount: 0,
          lastError: null,
          cardLast4: charge.last4 ?? subscription.cardLast4,
        },
      }),
    ]);

    await createProductCommissionsForOrder(order.id);
    const payables = await createVendorPayablesForOrder(order.id);

    await createIntakeMessage({
      intakeSubmissionId: subscription.intakeSubmissionId,
      authorRole: "SYSTEM",
      authorName: "KIAN Privé",
      body: `Therapy refill charged for order ${order.orderNumber} ($${amountDue.toFixed(2)}). Next charge ${label}.`,
      notifyPatient: false,
    });

    if (email) {
      const content = buildTherapyRefillEmail({
        orderNumber: order.orderNumber,
        amount: amountDue,
        billingLabel: label,
      });
      await sendTransactionalEmail({
        to: email,
        subject: content.subject,
        text: content.text,
        html: content.html,
      });
    }

    const providerEmail = subscription.proposal.providerPartner.user?.email;
    if (providerEmail) {
      await sendTransactionalEmail({
        to: providerEmail,
        subject: `${testMode ? "[TEST] " : ""}Therapy refill paid — ${order.orderNumber}`,
        text: `Refill payment received for ${subscription.intakeSubmission.fullName}, order ${order.orderNumber}.`,
      });
    }

    const adminTo = process.env.PEPTIDE_INTAKE_REPORT_EMAIL || process.env.BOOKING_REPORT_EMAIL;
    if (adminTo) {
      await sendTransactionalEmail({
        to: adminTo,
        subject: `${testMode ? "[TEST] " : ""}Therapy refill paid — ${order.orderNumber}`,
        text: [
          `Refill ${order.orderNumber} paid ($${amountDue.toFixed(2)}).`,
          `Patient: ${subscription.intakeSubmission.fullName} <${email ?? ""}>`,
          `Vendor bills: ${payables.length}`,
        ].join("\n"),
      });
    }

    return { ok: true as const, orderId: order.id, orderNumber: order.orderNumber, amount: amountDue };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refill charge failed.";
    const failureCount = subscription.failureCount + 1;
    const nextStatus = failureCount >= 3 ? "PAUSED" : "PAST_DUE";

    await prisma.therapySubscription.update({
      where: { id: subscription.id },
      data: {
        status: nextStatus,
        failureCount,
        lastError: message,
      },
    });

    await issueOrderPaymentToken(order.id).then(async (issued) => {
      if (!email) return;
      await sendInvoiceEmail({
        to: email,
        fullName: subscription.intakeSubmission.fullName,
        orderNumber: order.orderNumber,
        total: subtotal,
        paymentUrl: issued.paymentUrl,
        notes: `We could not charge the card on file (${message}). Pay this refill to keep your therapy on schedule.`,
      });
    }).catch(() => undefined);

    return {
      ok: false as const,
      orderId: order.id,
      orderNumber: order.orderNumber,
      error: message,
      status: nextStatus,
    };
  }
}

async function issueManualRefill(
  subscription: { id: string; intakeSubmissionId: string; intakeSubmission: { fullName: string } },
  order: { id: string; orderNumber: string },
  email: string | null,
  subtotal: number,
  label: string,
) {
  await prisma.therapySubscription.update({
    where: { id: subscription.id },
    data: {
      status: "PAST_DUE",
      lastError: "No card on file. Patient was emailed a pay link for this refill.",
    },
  });

  if (email) {
    const issued = await issueOrderPaymentToken(order.id);
    await sendInvoiceEmail({
      to: email,
      fullName: subscription.intakeSubmission.fullName,
      orderNumber: order.orderNumber,
      total: subtotal,
      paymentUrl: issued.paymentUrl,
      notes: `Your therapy refill (${label}) is ready. Pay this invoice to continue.`,
    });
  }

  await createIntakeMessage({
    intakeSubmissionId: subscription.intakeSubmissionId,
    authorRole: "SYSTEM",
    authorName: "KIAN Privé",
    body: `A therapy refill invoice was sent for ${order.orderNumber} because no card is on file.`,
    notifyPatient: true,
  });

  return {
    ok: false as const,
    orderId: order.id,
    orderNumber: order.orderNumber,
    error: "No card on file. Patient was emailed a pay link.",
    status: "PAST_DUE" as const,
  };
}
