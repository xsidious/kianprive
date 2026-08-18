import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/ops/audit";
import { formatChargeDate, intervalLabel } from "@/lib/commerce/therapy-billing";
import {
  chargeDueTherapySubscriptions,
  chargeTherapySubscription,
  setTherapySubscriptionStatus,
} from "@/lib/commerce/therapy-subscriptions";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const subscriptions = await prisma.therapySubscription.findMany({
    orderBy: [{ status: "asc" }, { nextChargeAt: "asc" }],
    take: 200,
    include: {
      intakeSubmission: { select: { id: true, fullName: true, email: true } },
      proposal: {
        select: {
          id: true,
          status: true,
          items: {
            select: { titleSnapshot: true, quantity: true, product: { select: { title: true } } },
          },
        },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, orderNumber: true, total: true, paymentStatus: true, createdAt: true },
      },
    },
  });

  return NextResponse.json({
    subscriptions: subscriptions.map((row) => ({
      id: row.id,
      status: row.status,
      interval: row.interval,
      intervalDays: row.intervalDays,
      intervalLabel: intervalLabel(row.interval, row.intervalDays),
      amount: Number(row.amount),
      email: row.email,
      nextChargeAt: row.nextChargeAt?.toISOString() ?? null,
      nextChargeLabel: formatChargeDate(row.nextChargeAt),
      lastChargedAt: row.lastChargedAt?.toISOString() ?? null,
      lastChargedLabel: formatChargeDate(row.lastChargedAt),
      cardLast4: row.cardLast4,
      hasCardOnFile: Boolean(row.customerProfileId && row.paymentProfileId),
      failureCount: row.failureCount,
      lastError: row.lastError,
      patient: row.intakeSubmission,
      items: row.proposal.items.map((item) => ({
        title: item.titleSnapshot || item.product.title,
        quantity: item.quantity,
      })),
      orders: row.orders.map((order) => ({
        ...order,
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
      })),
    })),
  });
}

const actionSchema = z.object({
  action: z.enum(["pause", "resume", "cancel", "charge", "runDue"]),
  id: z.string().optional(),
});

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const parsed = actionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    if (parsed.data.action === "runDue") {
      const results = await chargeDueTherapySubscriptions();
      await writeAuditLog({
        userId: guard.userId,
        action: "therapy_subscription.run_due",
        entityType: "TherapySubscription",
        metadata: { processed: results.length },
      });
      return NextResponse.json({ results });
    }

    if (!parsed.data.id) {
      return NextResponse.json({ error: "Subscription id required." }, { status: 400 });
    }

    if (parsed.data.action === "charge") {
      const result = await chargeTherapySubscription(parsed.data.id, { force: true, reason: "manual" });
      await writeAuditLog({
        userId: guard.userId,
        action: "therapy_subscription.charge",
        entityType: "TherapySubscription",
        entityId: parsed.data.id,
        metadata: result,
      });
      return NextResponse.json(result);
    }

    const status =
      parsed.data.action === "pause" ? "PAUSED" : parsed.data.action === "resume" ? "ACTIVE" : "CANCELED";
    const updated = await setTherapySubscriptionStatus(parsed.data.id, status);
    await writeAuditLog({
      userId: guard.userId,
      action: `therapy_subscription.${parsed.data.action}`,
      entityType: "TherapySubscription",
      entityId: parsed.data.id,
    });
    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      nextChargeAt: updated.nextChargeAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update subscription." },
      { status: 400 },
    );
  }
}
