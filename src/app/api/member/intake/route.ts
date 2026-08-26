import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { patientFacingIntakeStatus } from "@/lib/intake/tracking";
import { serializeIntakeMessage } from "@/lib/intake/messages";
import { patientOrderProgress } from "@/lib/orders/progress";
import { formatChargeDate, intervalLabel } from "@/lib/commerce/therapy-billing";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email?.toLowerCase();
  const submissions = await prisma.therapeuticsIntakeSubmission.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      statusNote: true,
      publicTrackingToken: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { messages: true } },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          fulfillmentStatus: true,
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      therapyProposals: {
        where: { status: { in: ["SENT", "ACCEPTED", "PAID"] } },
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              titleSnapshot: true,
              product: { select: { title: true, price: true } },
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              subtotal: true,
              shippingTotal: true,
              status: true,
              paymentStatus: true,
              fulfillmentStatus: true,
              authorizeNetTransId: true,
              updatedAt: true,
              items: {
                select: {
                  title: true,
                  quantity: true,
                  lineTotal: true,
                },
              },
            },
          },
          providerPartner: { select: { displayName: true } },
          subscription: {
            select: {
              status: true,
              interval: true,
              intervalDays: true,
              amount: true,
              nextChargeAt: true,
              cardLast4: true,
            },
          },
        },
      },
    },
  });

  if (email) {
    await prisma.therapeuticsIntakeSubmission.updateMany({
      where: {
        email: { equals: email, mode: "insensitive" },
        userId: null,
      },
      data: { userId: session.user.id },
    });
  }

  return NextResponse.json({
    intakes: submissions.map((row) => {
      const proposal = row.therapyProposals[0];
      const latest = row.messages[0] ? serializeIntakeMessage(row.messages[0]) : null;
      return {
        id: row.id,
        referenceId: row.publicTrackingToken || row.id,
        fullName: row.fullName,
        email: row.email,
        status: row.status,
        statusLabel: patientFacingIntakeStatus(row.status),
        statusNote: row.statusNote,
        trackingToken: row.publicTrackingToken,
        submittedAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        messageCount: row._count.messages,
        latestMessage: latest,
        orders: row.orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          progress: patientOrderProgress(order),
          createdAt: order.createdAt.toISOString(),
        })),
        therapy: proposal
          ? {
              status: proposal.status,
              providerName: proposal.providerPartner.displayName,
              notes: proposal.notes,
              items: proposal.items.map((item) => {
                const unit =
                  item.unitPrice != null
                    ? Number(item.unitPrice)
                    : Number(item.product.price);
                return {
                  title: item.titleSnapshot || item.product.title,
                  quantity: item.quantity,
                  unitPrice: unit,
                  lineTotal: unit * item.quantity,
                };
              }),
              billing:
                proposal.subscription && proposal.subscription.interval !== "ONE_TIME"
                  ? {
                      status: proposal.subscription.status,
                      label: intervalLabel(
                        proposal.subscription.interval,
                        proposal.subscription.intervalDays,
                      ),
                      amount: Number(proposal.subscription.amount),
                      nextChargeAt: proposal.subscription.nextChargeAt?.toISOString() ?? null,
                      nextChargeLabel: formatChargeDate(proposal.subscription.nextChargeAt),
                      cardLast4: proposal.subscription.cardLast4,
                    }
                  : proposal.billingInterval && proposal.billingInterval !== "ONE_TIME"
                    ? {
                        status: "PENDING",
                        label: intervalLabel(proposal.billingInterval, proposal.intervalDays ?? 0),
                        amount: proposal.order
                          ? Number(proposal.order.subtotal) || Number(proposal.order.total)
                          : 0,
                        nextChargeAt: null,
                        nextChargeLabel: null,
                        cardLast4: null,
                      }
                    : null,
              order: proposal.order
                ? {
                    id: proposal.order.id,
                    orderNumber: proposal.order.orderNumber,
                    paymentStatus: proposal.order.paymentStatus,
                    fulfillmentStatus: proposal.order.fulfillmentStatus,
                    progress: patientOrderProgress(proposal.order),
                    transId: proposal.order.authorizeNetTransId,
                    paidAt: proposal.order.updatedAt.toISOString(),
                    subtotal: Number(proposal.order.subtotal),
                    shippingTotal: Number(proposal.order.shippingTotal ?? 0),
                    items: proposal.order.items.map((item) => ({
                      title: item.title,
                      quantity: item.quantity,
                      lineTotal: Number(item.lineTotal),
                    })),
                    total: Number(proposal.order.total),
                  }
                : null,
            }
          : null,
      };
    }),
  });
}
