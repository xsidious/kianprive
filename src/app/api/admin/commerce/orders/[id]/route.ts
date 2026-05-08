import { NextResponse } from "next/server";
import { FulfillmentStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const body = await req.json();

  const order = await prisma.order.update({
    where: { id },
    data: {
      status: body.status as OrderStatus | undefined,
      paymentStatus: body.paymentStatus as PaymentStatus | undefined,
      fulfillmentStatus: body.fulfillmentStatus as FulfillmentStatus | undefined,
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

  return NextResponse.json({ order });
}

export async function DELETE(_: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;

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
