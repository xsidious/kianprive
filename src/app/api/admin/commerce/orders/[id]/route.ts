import { NextResponse } from "next/server";
import { FulfillmentStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";
import { orderStatusFromFulfillment } from "@/lib/orders/sync-status";
import { forwardPaidOrderToWellnessTech } from "@/lib/commerce/forward-distribution-order";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const body = await req.json();

  let nextStatus = body.status as OrderStatus | undefined;
  const nextFulfillment = body.fulfillmentStatus as FulfillmentStatus | undefined;

  // When fulfillment advances, keep order.status in sync unless admin set a terminal cancel/refund.
  if (
    nextFulfillment &&
    nextStatus !== OrderStatus.CANCELED &&
    nextStatus !== OrderStatus.REFUNDED
  ) {
    nextStatus = orderStatusFromFulfillment(nextFulfillment, nextStatus);
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      status: nextStatus,
      paymentStatus: body.paymentStatus as PaymentStatus | undefined,
      fulfillmentStatus: nextFulfillment,
      email: body.email !== undefined ? String(body.email) : undefined,
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "commerce.order.update",
    entityType: "Order",
    entityId: id,
    metadata: { orderNumber: order.orderNumber, status: order.status },
  });

  if (order.paymentStatus === "PAID") {
    await forwardPaidOrderToWellnessTech(order.id);
  }

  return NextResponse.json({ order });
}

export async function DELETE(_: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;

  const existing = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      paymentStatus: true,
      authorizeNetTransId: true,
      stripePaymentIntentId: true,
      payments: { select: { id: true, status: true }, take: 5 },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Never hard-delete paid / charged orders — clients rely on these records.
  const hasPaidPayment = existing.payments.some((p) => p.status === "PAID");
  if (
    existing.paymentStatus === PaymentStatus.PAID ||
    existing.paymentStatus === PaymentStatus.PARTIALLY_REFUNDED ||
    existing.paymentStatus === PaymentStatus.REFUNDED ||
    hasPaidPayment ||
    Boolean(existing.authorizeNetTransId || existing.stripePaymentIntentId)
  ) {
    await writeAuditLog({
      userId: guard.userId,
      action: "commerce.order.delete_blocked",
      entityType: "Order",
      entityId: id,
      metadata: {
        orderNumber: existing.orderNumber,
        paymentStatus: existing.paymentStatus,
        reason: "Paid orders cannot be deleted.",
      },
    });
    return NextResponse.json(
      {
        error:
          "This order was paid and cannot be deleted. Cancel or refund it instead — the record must stay in the database.",
      },
      { status: 409 },
    );
  }

  const order = await prisma.order.delete({ where: { id } });
  await writeAuditLog({
    userId: guard.userId,
    action: "commerce.order.delete",
    entityType: "Order",
    entityId: id,
    metadata: { orderNumber: order.orderNumber },
  });

  return NextResponse.json({ ok: true });
}
