import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";
import { forwardPaidOrderToWellnessTech } from "@/lib/commerce/forward-distribution-order";

type Params = { params: Promise<{ id: string }> };

/** Re-push a paid order to Wellness Tech / RxHere when pharmacy submit previously failed. */
export async function POST(_: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      paymentStatus: true,
      distributionOrderId: true,
      rxhereOrderId: true,
      distributionSyncError: true,
    },
  });
  if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  if (order.paymentStatus !== "PAID") {
    return NextResponse.json({ ok: false, error: "Only paid orders can be sent to distribution." }, { status: 400 });
  }

  // force=true recreates the WT partner order when retry 404s / stale pharmacy holds.
  const result = await forwardPaidOrderToWellnessTech(order.id, { force: true });

  await writeAuditLog({
    userId: guard.userId,
    action: "commerce.order.retry_distribution",
    entityType: "Order",
    entityId: order.id,
    metadata: { orderNumber: order.orderNumber, result },
  });

  const refreshed = await prisma.order.findUnique({
    where: { id: order.id },
    select: {
      distributionOrderId: true,
      distributionStatus: true,
      rxhereOrderId: true,
      distributionSyncError: true,
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error || "Distribution retry failed.",
        order: refreshed,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, result, order: refreshed });
}
