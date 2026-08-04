import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { patientOrderProgress } from "@/lib/orders/progress";

type Params = { params: Promise<{ id: string }> };

async function findOwnedOrder(userId: string, email: string | null | undefined, id: string) {
  return prisma.order.findFirst({
    where: {
      id,
      OR: [
        { userId },
        ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
      ],
    },
    include: {
      items: {
        select: {
          id: true,
          title: true,
          quantity: true,
          sku: true,
          product: { select: { featuredImage: true, slug: true } },
        },
      },
      fulfillments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          carrier: true,
          trackingNumber: true,
          trackingUrl: true,
          shippedAt: true,
          deliveredAt: true,
          notes: true,
        },
      },
      therapyProposal: {
        select: {
          id: true,
          status: true,
          intakeSubmission: {
            select: { publicTrackingToken: true, id: true },
          },
        },
      },
    },
  });
}

export async function GET(_: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await findOwnedOrder(session.user.id, session.user.email, id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Link orphan email orders to the signed-in member
  if (!order.userId) {
    await prisma.order.update({
      where: { id: order.id },
      data: { userId: session.user.id },
    });
  }

  const progress = patientOrderProgress(order);

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      notes: order.notes,
      progress,
      items: order.items,
      fulfillments: order.fulfillments,
      therapyProposal: order.therapyProposal
        ? {
            id: order.therapyProposal.id,
            status: order.therapyProposal.status,
            intakeRef:
              order.therapyProposal.intakeSubmission?.publicTrackingToken ||
              order.therapyProposal.intakeSubmission?.id ||
              null,
          }
        : null,
    },
  });
}
