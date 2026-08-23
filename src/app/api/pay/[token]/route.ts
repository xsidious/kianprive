import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isPaymentTokenValid } from "@/lib/commerce/payment-link";
import { processOrderCardPayment } from "@/lib/commerce/process-order-payment";
import { billToSchema } from "@/lib/commerce/billing-address";

type Params = { params: Promise<{ token: string }> };

export async function GET(_: Request, { params }: Params) {
  const { token } = await params;
  const order = await prisma.order.findUnique({
    where: { paymentToken: token },
    select: {
      id: true,
      orderNumber: true,
      email: true,
      notes: true,
      total: true,
      paymentStatus: true,
      paymentTokenExpiresAt: true,
      authorizeNetTransId: true,
      updatedAt: true,
      items: { select: { id: true, title: true, quantity: true, unitPrice: true, lineTotal: true } },
      intakeSubmission: { select: { fullName: true } },
    },
  });
  if (!order) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }
  if (!isPaymentTokenValid(order) && order.paymentStatus !== "PAID") {
    return NextResponse.json({ error: "This payment link has expired. Ask your care team to resend it." }, { status: 410 });
  }

  return NextResponse.json({
    invoice: {
      orderNumber: order.orderNumber,
      patientName: order.intakeSubmission?.fullName ?? null,
      notes: order.notes,
      total: Number(order.total),
      paymentStatus: order.paymentStatus,
      paid: order.paymentStatus === "PAID",
      transId: order.authorizeNetTransId,
      paidAt: order.updatedAt?.toISOString?.() ?? null,
      items: order.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
    },
  });
}

const paySchema = z.object({
  opaqueData: z.object({
    dataDescriptor: z.string().min(1),
    dataValue: z.string().min(1),
  }),
  billTo: billToSchema,
  payerAuthentication: z
    .object({
      cavv: z.string().optional(),
      eciFlag: z.string().optional(),
    })
    .optional(),
  testCardNumber: z.string().optional(),
});

export async function POST(req: Request, { params }: Params) {
  const { token } = await params;
  const order = await prisma.order.findUnique({
    where: { paymentToken: token },
    select: {
      id: true,
      paymentStatus: true,
      paymentTokenExpiresAt: true,
      email: true,
    },
  });
  if (!order) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ error: "This invoice is already paid." }, { status: 400 });
  }
  if (!isPaymentTokenValid(order)) {
    return NextResponse.json({ error: "This payment link has expired." }, { status: 410 });
  }

  const parsed = paySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment payload." }, { status: 400 });
  }

  try {
    const result = await processOrderCardPayment({
      orderId: order.id,
      opaqueData: parsed.data.opaqueData,
      billTo: parsed.data.billTo,
      payerAuthentication: parsed.data.payerAuthentication,
      testCardNumber: parsed.data.testCardNumber,
      payerEmail: order.email,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment failed." },
      { status: 402 },
    );
  }
}
