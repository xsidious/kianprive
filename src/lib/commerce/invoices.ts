import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { buildInvoiceEmail } from "@/lib/email-templates";
import { issueOrderPaymentToken, orderPaymentUrl } from "@/lib/commerce/payment-link";

export async function createPatientInvoice(input: {
  fullName: string;
  email: string;
  phone?: string | null;
  notes?: string | null;
  intakeSubmissionId?: string | null;
  /** Create/link a MEMBER account when none exists for this email. */
  createUser?: boolean;
  /** Create a lightweight intake chart when none exists. */
  createIntake?: boolean;
  items: Array<{ productId: string; quantity: number; unitPrice?: number }>;
  send?: boolean;
}) {
  if (!input.items.length) throw new Error("Add at least one product.");

  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((item) => item.productId) }, status: "ACTIVE" },
  });
  if (products.length !== input.items.length) {
    throw new Error("One or more selected products are invalid.");
  }
  const byId = new Map(products.map((product) => [product.id, product]));

  const lineItems = input.items.map((item) => {
    const product = byId.get(item.productId)!;
    const unit = item.unitPrice != null && item.unitPrice > 0 ? item.unitPrice : Number(product.price);
    const qty = Math.max(1, item.quantity);
    if (unit <= 0) {
      throw new Error(`Set a patient price for ${product.title} before invoicing.`);
    }
    return {
      productId: product.id,
      title: product.title,
      sku: product.sku,
      quantity: qty,
      unitPrice: unit,
      lineTotal: unit * qty,
    };
  });
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const phone = input.phone?.trim() || "";

  let user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
  if (!user && input.createUser !== false) {
    user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        role: Role.MEMBER,
        mustSetPassword: true,
        memberOnboardingComplete: false,
      },
      select: { id: true, name: true },
    });
  } else if (user && !user.name && fullName) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: fullName },
      select: { id: true, name: true },
    });
  }

  let intake = input.intakeSubmissionId
    ? await prisma.therapeuticsIntakeSubmission.findUnique({
        where: { id: input.intakeSubmissionId },
        select: { id: true, email: true, phone: true, userId: true, fullName: true },
      })
    : await prisma.therapeuticsIntakeSubmission.findFirst({
        where: { email },
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, phone: true, userId: true, fullName: true },
      });

  if (!intake && input.createIntake !== false) {
    intake = await prisma.therapeuticsIntakeSubmission.create({
      data: {
        userId: user?.id,
        fullName,
        email,
        phone: phone || "—",
        dateOfBirth: "",
        programs: [],
        status: "APPROVED",
        statusNote: "Created from admin invoice desk",
        payload: {
          source: "admin_invoice",
          createdAt: new Date().toISOString(),
        },
      },
      select: { id: true, email: true, phone: true, userId: true, fullName: true },
    });
  } else if (intake && user && !intake.userId) {
    intake = await prisma.therapeuticsIntakeSubmission.update({
      where: { id: intake.id },
      data: { userId: user.id },
      select: { id: true, email: true, phone: true, userId: true, fullName: true },
    });
  }

  const order = await prisma.order.create({
    data: {
      orderNumber: `KP-INV-${Date.now()}`,
      userId: user?.id ?? intake?.userId ?? undefined,
      intakeSubmissionId: intake?.id ?? undefined,
      email,
      phone: phone || intake?.phone || undefined,
      status: "PENDING",
      paymentStatus: "UNPAID",
      fulfillmentStatus: "UNFULFILLED",
      subtotal,
      total: subtotal,
      notes: input.notes?.trim() || `Invoice for ${fullName}`,
      items: {
        create: lineItems.map((item) => ({
          ...item,
          unitPrice: new Prisma.Decimal(item.unitPrice.toFixed(2)),
          lineTotal: new Prisma.Decimal(item.lineTotal.toFixed(2)),
        })),
      },
    },
    include: { items: true },
  });

  const issued = await issueOrderPaymentToken(order.id);
  if (input.send !== false) {
    await sendInvoiceEmail({
      to: email,
      fullName,
      orderNumber: order.orderNumber,
      total: subtotal,
      paymentUrl: issued.paymentUrl,
      notes: input.notes,
    });
  }

  return { ...order, paymentUrl: issued.paymentUrl, paymentTokenExpiresAt: issued.paymentTokenExpiresAt };
}

export async function sendInvoiceEmail(input: {
  to: string;
  fullName: string;
  orderNumber: string;
  total: number;
  paymentUrl: string;
  notes?: string | null;
  recurringLabel?: string | null;
  subtotal?: number;
  shippingTotal?: number;
  lineItems?: Array<{ title: string; quantity: number; lineTotal: number }>;
}) {
  const content = buildInvoiceEmail(input);
  await sendTransactionalEmail({
    to: input.to,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });
}

export function invoicePaymentUrlFromToken(token: string | null | undefined) {
  if (!token) return null;
  return orderPaymentUrl(token);
}
