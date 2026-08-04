import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createIntakeMessage } from "@/lib/intake/messages";
import { sendTransactionalEmail } from "@/lib/email";

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
    const unit = Number(item.product.price);
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
  const computedTotal = proposal.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );
  const orderTotal =
    proposal.order?.total != null ? Number(proposal.order.total) : computedTotal;

  const showPayTotal =
    includePayTotal &&
    proposal.status === "SENT" &&
    proposal.order?.paymentStatus === "UNPAID" &&
    orderTotal > 0;

  return {
    id: proposal.id,
    status: proposal.status,
    notes: proposal.notes,
    sentAt: proposal.sentAt,
    paidAt: proposal.paidAt,
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
  items: Array<{ productId: string; quantity: number }>;
  send?: boolean;
}) {
  if (!input.items.length) {
    throw new Error("Add at least one therapy product.");
  }

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

  if (input.send) {
    const unpriced = products.filter((p) => Number(p.price) <= 0);
    if (unpriced.length) {
      throw new Error(
        `Admin must set retail prices before sending. Unpriced: ${unpriced
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
        },
      }));

    await tx.intakeTherapyItem.deleteMany({ where: { proposalId: base.id } });
    await tx.intakeTherapyItem.createMany({
      data: input.items.map((item) => ({
        proposalId: base.id,
        productId: item.productId,
        quantity: Math.max(1, item.quantity),
        titleSnapshot: byId.get(item.productId)?.title ?? "Therapy item",
      })),
    });

    let orderId = base.orderId;
    if (input.send) {
      const intake = await tx.therapeuticsIntakeSubmission.findUnique({
        where: { id: input.intakeSubmissionId },
        select: { email: true, phone: true, userId: true, fullName: true },
      });
      const lineItems = input.items.map((item) => {
        const product = byId.get(item.productId)!;
        const unit = Number(product.price);
        const qty = Math.max(1, item.quantity);
        return {
          productId: product.id,
          partnerId: input.providerPartnerId,
          title: product.title,
          sku: product.sku,
          quantity: qty,
          unitPrice: unit,
          lineTotal: unit * qty,
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
        },
      });
    }

    return tx.intakeTherapyProposal.update({
      where: { id: base.id },
      data: {
        status: "DRAFT",
        notes: input.notes ?? null,
        providerPartnerId: input.providerPartnerId,
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
    await createIntakeMessage({
      intakeSubmissionId: input.intakeSubmissionId,
      authorRole: "PROVIDER",
      authorName: provider?.displayName ?? "Clinical team",
      body: `A therapy plan has been prepared for you. Review and use Accept & Pay when ready.${
        input.notes ? `\n\nNote: ${input.notes}` : ""
      }`,
      notifyPatient: true,
    });
    if (intake?.email) {
      await sendTransactionalEmail({
        to: intake.email,
        subject: "Your KIAN Privé therapy plan is ready",
        text: `Hello ${intake.fullName},\n\nYour clinician prepared a therapy plan. Sign in to your member intake page to review and pay.\n\n— KIAN Privé`,
        html: `<p>Hello ${intake.fullName},</p><p>Your clinician prepared a therapy plan. Sign in to your member intake page to review and <strong>Accept &amp; Pay</strong>.</p><p>— KIAN Privé</p>`,
      });
    }
  }

  return getProposalForIntake(input.intakeSubmissionId);
}

export type TherapyMoney = Prisma.Decimal | number;
