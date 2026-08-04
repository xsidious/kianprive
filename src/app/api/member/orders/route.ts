import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { patientOrderProgress } from "@/lib/orders/progress";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email?.trim();
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        select: {
          id: true,
          title: true,
          quantity: true,
          sku: true,
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
        },
      },
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json({
    orders: orders.map((order) => {
      const progress = patientOrderProgress(order);
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        progress,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        items: order.items,
        fulfillments: order.fulfillments,
        messageCount: order._count.messages,
      };
    }),
  });
}
