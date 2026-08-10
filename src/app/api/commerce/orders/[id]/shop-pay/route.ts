import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { chargeAuthorizeNetCard, isTherapyPaymentTestMode } from "@/lib/authorize-net";
import { createProductCommissionsForOrder } from "@/lib/commissions";
import { sendTransactionalEmail } from "@/lib/email";

const paySchema = z.object({
  opaqueData: z.object({
    dataDescriptor: z.string().min(1),
    dataValue: z.string().min(1),
  }),
  email: z.string().email().optional(),
  cartId: z.string().optional(),
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

/** Retail shop checkout — Authorize.net charge (guests allowed). */
export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const parsed = paySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment payload." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      therapyProposal: { select: { id: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Therapy orders use /pay — keep shop pay retail-only
  if (order.therapyProposal || order.intakeSubmissionId) {
    return NextResponse.json({ error: "Use therapy payment for this order." }, { status: 400 });
  }

  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ error: "Order already paid." }, { status: 400 });
  }

  if (Number(order.total) <= 0 || !order.items.length) {
    return NextResponse.json({ error: "Order is not ready for payment." }, { status: 400 });
  }

  // Light guard: if email provided, must match order email
  if (
    parsed.data.email &&
    order.email &&
    parsed.data.email.toLowerCase() !== order.email.toLowerCase()
  ) {
    return NextResponse.json({ error: "Email does not match this order." }, { status: 400 });
  }

  const testMode = isTherapyPaymentTestMode();

  try {
    const charge = await chargeAuthorizeNetCard({
      amount: Number(order.total),
      orderNumber: order.orderNumber,
      opaqueData: parsed.data.opaqueData,
      email: order.email ?? parsed.data.email,
      billTo: {
        firstName: parsed.data.billTo?.firstName,
        lastName: parsed.data.billTo?.lastName,
        zip: parsed.data.billTo?.zip,
      },
      testCardNumber: parsed.data.testCardNumber,
    });

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "PAID",
          fulfillmentStatus: "PROCESSING",
          authorizeNetTransId: charge.transId,
          email: order.email ?? parsed.data.email ?? undefined,
        },
      });

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
            source: "shop_checkout",
            raw: charge.raw,
          },
        },
      });

      if (parsed.data.cartId) {
        await tx.cart.updateMany({
          where: { id: parsed.data.cartId, status: "ACTIVE" },
          data: { status: "CONVERTED" },
        });
      }
    });

    await createProductCommissionsForOrder(order.id);

    const adminTo = process.env.BOOKING_REPORT_EMAIL || process.env.PEPTIDE_INTAKE_REPORT_EMAIL;
    if (adminTo) {
      const itemLines = order.items
        .map((i) => `- ${i.title} × ${i.quantity} @ $${Number(i.unitPrice).toFixed(2)}`)
        .join("\n");
      try {
        await sendTransactionalEmail({
          to: adminTo,
          subject: `${testMode ? "[TEST] " : ""}Shop order paid — ${order.orderNumber}`,
          text: [
            `Order ${order.orderNumber} paid via Authorize.net.`,
            `Payment ID: ${charge.transId}`,
            `Amount: $${Number(order.total).toFixed(2)}`,
            `Customer: ${order.email ?? parsed.data.email ?? "—"}`,
            "",
            "Items:",
            itemLines,
          ].join("\n"),
        });
      } catch (err) {
        console.error("[shop-pay] admin email failed:", err);
      }
    }

    return NextResponse.json({
      ok: true,
      testMode: testMode || charge.testMode,
      orderNumber: order.orderNumber,
      transId: charge.transId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
