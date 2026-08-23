import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/rbac";
import { processOrderCardPayment } from "@/lib/commerce/process-order-payment";
import { billToSchema } from "@/lib/commerce/billing-address";

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

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = paySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment payload." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { intakeSubmission: true, therapyProposal: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const admin = canAccessAdmin(session.user.role);
  const owns =
    session.user.id === order.userId ||
    session.user.id === order.intakeSubmission?.userId ||
    session.user.email?.toLowerCase() === order.intakeSubmission?.email?.toLowerCase() ||
    session.user.email?.toLowerCase() === order.email?.toLowerCase();
  if (!admin && !owns) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await processOrderCardPayment({
      orderId: order.id,
      opaqueData: parsed.data.opaqueData,
      billTo: parsed.data.billTo,
      payerAuthentication: parsed.data.payerAuthentication,
      testCardNumber: parsed.data.testCardNumber,
      payerUserId: session.user.id,
      payerEmail: session.user.email,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment failed.";
    const status = message.includes("already paid") || message.includes("not ready") ? 400 : 402;
    return NextResponse.json({ error: message }, { status });
  }
}
