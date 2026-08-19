import { Prisma, TherapyBillingInterval } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createIntakeMessage } from "@/lib/intake/messages";
import { issueOrderPaymentToken } from "@/lib/commerce/payment-link";
import { sendInvoiceEmail } from "@/lib/commerce/invoices";
import { intervalLabel, resolveIntervalDays } from "@/lib/commerce/therapy-billing";
import { syncTherapySubscriptionForProposal } from "@/lib/commerce/therapy-subscriptions";

export async function getProposalForIntake(intakeSubmissionId: string) {
  return prisma.intakeTherapyProposal.findFirst({
    where: {
      intakeSubmissionId,
      status: { in: ["DRAFT", "SENT", "ACCEPTED", "PAID"] },
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              category: true,
              featuredImage: true,
              price: true,
              isPrescription: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      providerPartner: { select: { id: true, displayName: true, partnerCode: true } },
      subscription: {
        select: {
          id: true,
          status: true,
          interval: true,
          intervalDays: true,
          amount: true,
          nextChargeAt: true,
          lastChargedAt: true,
          cardLast4: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          paymentStatus: true,
          status: true,
          fulfillments: {
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { carrier: true, trackingNumber: true, trackingUrl: true, status: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function serializeProposal(
  proposal: NonNullable<Awaited<ReturnType<typeof getProposalForIntake>>>,
  opts?: { includePrices?: boolean; includePayTotal?: boolean },
) {
  const includePrices = opts?.includePrices ?? false;
  const includePayTotal = opts?.includePayTotal ?? includePrices;
  const items = proposal.items.map((item) => {
    const unit = item.unitPrice != null ? Number(item.unitPrice) : Number(item.product.price);
    return {
      id: item.id,
      productId: item.productId,
      title: item.titleSnapshot || item.product.title,
      quantity: item.quantity,
      category: item.product.category,
      featuredImage: item.product.featuredImage,
      isPrescription: item.product.isPrescription,
      unitPrice: includePrices ? unit : undefined,
      lineTotal: includePrices ? unit * item.quantity : undefined,
      priced: unit > 0,
    };
  });
  const unpriced = items.filter((i) => !i.priced).length;
  const computedTotal = proposal.items.reduce((sum, item) => {
    const unit = item.unitPrice != null ? Number(item.unitPrice) : Number(item.product.price);
    return sum + unit * item.quantity;
  }, 0);
  const orderTotal =
    proposal.order?.total != null ? Number(proposal.order.total) : computedTotal;

  const showPayTotal =
    includePayTotal &&
    proposal.status === "SENT" &&
    proposal.order?.paymentStatus === "UNPAID" &&
    orderTotal > 0;

  const billingInterval = proposal.billingInterval ?? "ONE_TIME";
  const intervalDays = proposal.intervalDays ?? 0;
  const subscription = proposal.subscription;

  return {
    id: proposal.id,
    status: proposal.status,
    notes: proposal.notes,
    sentAt: proposal.sentAt,
    paidAt: proposal.paidAt,
    billingInterval,
    intervalDays: billingInterval === "ONE_TIME" ? 0 : intervalDays,
    billingLabel: intervalLabel(billingInterval, intervalDays),
    subscription: subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          nextChargeAt: subscription.nextChargeAt?.toISOString() ?? null,
          lastChargedAt: subscription.lastChargedAt?.toISOString() ?? null,
          amount: Number(subscription.amount),
          cardLast4: subscription.cardLast4,
        }
      : null,
    provider: proposal.providerPartner,
    order: proposal.order
      ? {
          id: proposal.order.id,
          orderNumber: proposal.order.orderNumber,
          paymentStatus: proposal.order.paymentStatus,
          status: proposal.order.status,
          fulfillments: proposal.order.fulfillments,
          // Amounts only for admin or member pay CTA
          total: includePrices || showPayTotal ? orderTotal : undefined,
        }
      : null,
    items,
    unpricedCount: unpriced,
    readyToPay: unpriced === 0 && items.length > 0 && proposal.status === "SENT",
    total: includePrices ? orderTotal : showPayTotal ? orderTotal : undefined,
  };
}

export async function upsertTherapyProposal(input: {
  intakeSubmissionId: string;
  providerPartnerId: string;
  notes?: string | null;
  items: Array<{ productId: string; quantity: number; unitPrice?: number | null }>;
  send?: boolean;
  persistCatalogPrices?: boolean;
  billingInterval?: TherapyBillingInterval;
  intervalDays?: number | null;
}) {
  if (!input.items.length) {
    throw new Error("Add at least one therapy product.");
  }

  const billingInterval = input.billingInterval ?? "ONE_TIME";
  const intervalDays =
    billingInterval === "ONE_TIME" ? null : resolveIntervalDays(billingInterval, input.intervalDays);

  const products = await prisma.product.findMany({
    where: {
      id: { in: input.items.map((i) => i.productId) },
      catalogKind: "CLINICAL",
      status: "ACTIVE",
    },
  });
  if (products.length !== input.items.length) {
    throw new Error("One or more selected products are invalid.");
  }
  const byId = new Map(products.map((p) => [p.id, p]));

  const pricedItems = input.items.map((item) => {
    const product = byId.get(item.productId)!;
    const unit =
      item.unitPrice != null && Number.isFinite(item.unitPrice) && item.unitPrice > 0
        ? item.unitPrice
        : Number(product.price);
    return { ...item, unit };
  });

  if (input.send) {
    const unpriced = pricedItems.filter((item) => item.unit <= 0).map((item) => byId.get(item.productId)!);
    if (unpriced.length) {
      throw new Error(
        `Set a price on each prescription before sending. Unpriced: ${unpriced
          .slice(0, 5)
          .map((p) => p.title)
          .join(", ")}${unpriced.length > 5 ? "…" : ""}`,
      );
    }
  }

  const existing = await prisma.intakeTherapyProposal.findFirst({
    where: {
      intakeSubmissionId: input.intakeSubmissionId,
      status: { in: ["DRAFT", "SENT"] },
    },
  });

  const proposal = await prisma.$transaction(async (tx) => {
    const base =
      existing ??
      (await tx.intakeTherapyProposal.create({
        data: {
          intakeSubmissionId: input.intakeSubmissionId,
          providerPartnerId: input.providerPartnerId,
          status: "DRAFT",
          notes: input.notes ?? null,
          billingInterval,
          intervalDays,
        },
      }));

    if (input.persistCatalogPrices) {
      for (const item of pricedItems) {
        if (item.unit > 0) {
          await tx.product.update({
            where: { id: item.productId },
            data: { price: item.unit, isPrescription: true },
          });
        }
      }
    }

    await tx.intakeTherapyItem.deleteMany({ where: { proposalId: base.id } });
    await tx.intakeTherapyItem.createMany({
      data: pricedItems.map((item) => ({
        proposalId: base.id,
        productId: item.productId,
        quantity: Math.max(1, item.quantity),
        unitPrice: item.unit > 0 ? item.unit : null,
        titleSnapshot: byId.get(item.productId)?.title ?? "Therapy item",
      })),
    });

    let orderId = base.orderId;
    if (input.send) {
      const intake = await tx.therapeuticsIntakeSubmission.findUnique({
        where: { id: input.intakeSubmissionId },
        select: { email: true, phone: true, userId: true, fullName: true },
      });
      const lineItems = pricedItems.map((item) => {
        const product = byId.get(item.productId)!;
        const qty = Math.max(1, item.quantity);
        return {
          productId: product.id,
          partnerId: input.providerPartnerId,
          title: product.title,
          sku: product.sku,
          quantity: qty,
          unitPrice: item.unit,
          lineTotal: item.unit * qty,
        };
      });
      const subtotal = lineItems.reduce((s, i) => s + i.lineTotal, 0);

      if (orderId) {
        await tx.orderItem.deleteMany({ where: { orderId } });
        await tx.order.update({
          where: { id: orderId },
          data: {
            partnerId: input.providerPartnerId,
            intakeSubmissionId: input.intakeSubmissionId,
            email: intake?.email,
            phone: intake?.phone,
            userId: intake?.userId ?? undefined,
            status: "PENDING",
            paymentStatus: "UNPAID",
            subtotal,
            total: subtotal,
            notes: input.notes ?? `Therapy proposal for ${intake?.fullName ?? "patient"}`,
            items: { create: lineItems },
          },
        });
      } else {
        const order = await tx.order.create({
          data: {
            orderNumber: `KP-THERAPY-${Date.now()}`,
            partnerId: input.providerPartnerId,
            intakeSubmissionId: input.intakeSubmissionId,
            email: intake?.email,
            phone: intake?.phone,
            userId: intake?.userId ?? undefined,
            status: "PENDING",
            paymentStatus: "UNPAID",
            fulfillmentStatus: "UNFULFILLED",
            subtotal,
            total: subtotal,
            notes: input.notes ?? `Therapy proposal for ${intake?.fullName ?? "patient"}`,
            items: { create: lineItems },
          },
        });
        orderId = order.id;
      }

      return tx.intakeTherapyProposal.update({
        where: { id: base.id },
        data: {
          status: "SENT",
          notes: input.notes ?? null,
          providerPartnerId: input.providerPartnerId,
          orderId,
          sentAt: new Date(),
          billingInterval,
          intervalDays,
        },
      });
    }

    return tx.intakeTherapyProposal.update({
      where: { id: base.id },
      data: {
        status: "DRAFT",
        notes: input.notes ?? null,
        providerPartnerId: input.providerPartnerId,
        billingInterval,
        intervalDays,
      },
    });
  });

  if (input.send) {
    const intake = await prisma.therapeuticsIntakeSubmission.findUnique({
      where: { id: input.intakeSubmissionId },
    });
    const provider = await prisma.partnerProfile.findUnique({
      where: { id: input.providerPartnerId },
      select: { displayName: true },
    });
    const recurringLabel =
      billingInterval === "ONE_TIME" ? null : intervalLabel(billingInterval, intervalDays ?? 0);
    const orderTotal = proposal.orderId
      ? Number(
          (
            await prisma.order.findUnique({
              where: { id: proposal.orderId },
              select: { total: true },
            })
          )?.total ?? 0,
        )
      : 0;
    await syncTherapySubscriptionForProposal({
      proposalId: proposal.id,
      intakeSubmissionId: input.intakeSubmissionId,
      email: intake?.email,
      amount: orderTotal,
      billingInterval,
      intervalDays,
      orderId: proposal.orderId,
    });

    let paymentUrl: string | null = null;
    if (proposal.orderId) {
      const issued = await issueOrderPaymentToken(proposal.orderId);
      paymentUrl = issued.paymentUrl;
    }

    const payLine = paymentUrl
      ? `\n\nPay securely (no account required):\n${paymentUrl}`
      : "";

    await createIntakeMessage({
      intakeSubmissionId: input.intakeSubmissionId,
      authorRole: "PROVIDER",
      authorName: provider?.displayName ?? "Clinical team",
      body: `A therapy plan has been prepared for you.${payLine}${
        recurringLabel ? `\n\nAfter the first payment, refills are billed ${recurringLabel}.` : ""
      }${input.notes ? `\n\nNote: ${input.notes}` : ""}`,
      notifyPatient: true,
      paymentUrl,
    });

    if (intake?.email && paymentUrl) {
      const order = await prisma.order.findUnique({
        where: { id: proposal.orderId! },
        select: { orderNumber: true, total: true },
      });
      await sendInvoiceEmail({
        to: intake.email,
        fullName: intake.fullName,
        orderNumber: order?.orderNumber ?? "therapy invoice",
        total: Number(order?.total ?? 0),
        paymentUrl,
        notes: input.notes,
        recurringLabel,
      });
    }
  }

  return getProposalForIntake(input.intakeSubmissionId);
}

export type TherapyMoney = Prisma.Decimal | number;
