import { NextResponse } from "next/server";
import { FulfillmentStatus, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id: orderId } = await params;
  const body = await req.json();

  const fulfillment = await prisma.fulfillment.create({
    data: {
      orderId,
      status: (body.status as FulfillmentStatus) ?? FulfillmentStatus.PROCESSING,
      carrier: body.carrier,
      trackingNumber: body.trackingNumber,
      trackingUrl: body.trackingUrl,
      shippedAt: body.shippedAt ? new Date(body.shippedAt) : undefined,
      deliveredAt: body.deliveredAt ? new Date(body.deliveredAt) : undefined,
      notes: body.notes,
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.PROCESSING,
      fulfillmentStatus: fulfillment.status,
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "commerce.fulfillment.create",
    entityType: "Fulfillment",
    entityId: fulfillment.id,
    metadata: { orderId, trackingNumber: fulfillment.trackingNumber },
  });

  return NextResponse.json({ fulfillment }, { status: 201 });
}
