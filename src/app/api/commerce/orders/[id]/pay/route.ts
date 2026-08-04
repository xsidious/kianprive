import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chargeAuthorizeNetCard, isTherapyPaymentTestMode } from "@/lib/authorize-net";
import { createProductCommissionsForOrder } from "@/lib/commissions";
import { createIntakeMessage } from "@/lib/intake/messages";
import { sendTransactionalEmail } from "@/lib/email";

const paySchema = z.object({
  orderId: z.string().min(1),
  opaqueData: z.object({
    dataDescriptor: z.string().min(1),
    dataValue: z.string().min(1),
  }),
  billTo: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      zip: z.string().optional(),
    })
    .optional(),
  testCardNumber: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = paySchema.safeParse({ ...(await req.json()), orderId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment payload." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      intakeSubmission: true,
      partner: { include: { user: { select: { email: true } } } },
      therapyProposal: true,
      items: true,
    },
  });
  if (!order || !order.intakeSubmissionId || !order.therapyProposal) {
    return NextResponse.json({ error: "Therapy order not found." }, { status: 404 });
  }

  const intake = order.intakeSubmission;
  const owns =
    session.user.id === order.userId ||
    session.user.id === intake?.userId ||
    session.user.email?.toLowerCase() === intake?.email.toLowerCase() ||
    session.user.email?.toLowerCase() === order.email?.toLowerCase();
  if (!owns) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ error: "Order already paid." }, { status: 400 });
  }
  if (Number(order.total) <= 0 || !order.items.length) {
    return NextResponse.json({ error: "Order is not ready for payment." }, { status: 400 });
  }

  const testMode = isTherapyPaymentTestMode();

  try {
    const charge = await chargeAuthorizeNetCard({
      amount: Number(order.total),
      orderNumber: order.orderNumber,
      opaqueData: parsed.data.opaqueData,
      email: order.email ?? intake?.email ?? undefined,
      billTo: parsed.data.billTo,
      testCardNumber: parsed.data.testCardNumber,
    });

    const updated = await prisma.$transaction(async (tx) => {
      // Ensure line items still match the approved therapy proposal
      const proposal = await tx.intakeTherapyProposal.findUnique({
        where: { id: order.therapyProposal!.id },
        include: {
          items: {
            include: {
              product: { select: { id: true, title: true, sku: true, price: true } },
            },
          },
        },
      });

      if (proposal?.items.length) {
        const lineItems = proposal.items.map((item) => {
          // Lock to existing order item price when present; otherwise product retail
          const existing = order.items.find((oi) => oi.productId === item.productId);
          const unit = existing ? Number(existing.unitPrice) : Number(item.product.price);
          const qty = item.quantity;
          return {
            productId: item.productId,
            partnerId: order.partnerId,
            title: item.titleSnapshot || item.product.title,
            sku: item.product.sku,
            quantity: qty,
            unitPrice: unit,
            lineTotal: unit * qty,
          };
        });
        const subtotal = lineItems.reduce((s, i) => s + i.lineTotal, 0);

        await tx.orderItem.deleteMany({ where: { orderId: order.id } });
        await tx.order.update({
          where: { id: order.id },
          data: {
            items: { create: lineItems },
            subtotal,
            total: subtotal,
            paymentStatus: "PAID",
            status: "PAID",
            fulfillmentStatus: "PROCESSING",
            authorizeNetTransId: charge.transId,
            notes:
              order.notes ||
              `Paid therapy order for ${intake?.fullName ?? "patient"} — ready to ship`,
            userId: order.userId ?? intake?.userId ?? session.user.id,
            email: order.email ?? intake?.email ?? session.user.email ?? undefined,
            phone: order.phone ?? intake?.phone ?? undefined,
          },
        });
      } else {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            status: "PAID",
            fulfillmentStatus: "PROCESSING",
            authorizeNetTransId: charge.transId,
            userId: order.userId ?? intake?.userId ?? session.user.id,
          },
        });
      }

      await tx.paymentRecord.create({
        data: {
          orderId: order.id,
          provider: testMode || charge.testMode ? "authorize.net.test" : "authorize.net",
          status: "PAID",
          amount: order.total,
          currency: order.currency,
          metadata: {
            authCode: charge.authCode,
            transId: charge.transId,
            testMode: testMode || Boolean(charge.testMode),
            amountCharged: Number(order.total),
            raw: charge.raw,
          },
        },
      });
      await tx.intakeTherapyProposal.update({
        where: { id: order.therapyProposal!.id },
        data: { status: "PAID", paidAt: new Date() },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: { items: true, payments: true },
      });
    });

    await createProductCommissionsForOrder(order.id);

    await createIntakeMessage({
      intakeSubmissionId: order.intakeSubmissionId,
      authorRole: "SYSTEM",
      authorName: "KIAN Privé",
      body: testMode
        ? `Therapy payment recorded for order ${order.orderNumber}. Your clinician has been notified and fulfillment can begin.`
        : `Therapy payment received for order ${order.orderNumber}. Your clinician has been notified and fulfillment can begin.`,
      notifyPatient: false,
    });

    const providerEmail = order.partner?.user?.email;
    if (providerEmail) {
      await sendTransactionalEmail({
        to: providerEmail,
        subject: `${testMode ? "[TEST] " : ""}Therapy paid — ${order.orderNumber}`,
        text: `Patient completed payment for therapy order ${order.orderNumber}. Fulfillment can proceed. (Amounts are admin-only.)`,
        html: `<p>Patient completed payment for therapy order <strong>${order.orderNumber}</strong>.</p><p>Fulfillment can proceed. Order amounts are visible to admin only.</p>`,
      });
    }

    const adminTo = process.env.PEPTIDE_INTAKE_REPORT_EMAIL || process.env.BOOKING_REPORT_EMAIL;
    if (adminTo) {
      const itemLines =
        updated?.items
          ?.map((i) => `- ${i.title} × ${i.quantity} @ $${Number(i.unitPrice).toFixed(2)}`)
          .join("\n") || "(no items)";
      await sendTransactionalEmail({
        to: adminTo,
        subject: `${testMode ? "[TEST] " : ""}Therapy order paid — ship ${order.orderNumber}`,
        text: [
          `Order ${order.orderNumber} paid.`,
          `Payment ID: ${charge.transId}`,
          `Amount: $${Number(order.total).toFixed(2)}`,
          `Provider: ${order.partner?.displayName ?? "—"}`,
          `Patient: ${intake?.fullName ?? "—"} <${order.email ?? intake?.email ?? ""}>`,
          `Intake: ${intake?.publicTrackingToken || order.intakeSubmissionId}`,
          "",
          "Products to ship:",
          itemLines,
          "",
          "Mark fulfilled in Admin → Orders after shipping.",
        ].join("\n"),
      });
    }

    return NextResponse.json({
      order: updated
        ? {
            id: updated.id,
            orderNumber: updated.orderNumber,
            paymentStatus: updated.paymentStatus,
            status: updated.status,
            fulfillmentStatus: updated.fulfillmentStatus,
          }
        : null,
      transId: charge.transId,
      testMode: testMode || Boolean(charge.testMode),
      // Amount returned only to the payer for confirmation; admin portal has full detail
      amountPaid: Number(order.total),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment failed." },
      { status: 402 },
    );
  }
}
