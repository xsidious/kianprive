import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { createPatientInvoice, sendInvoiceEmail } from "@/lib/commerce/invoices";
import { issueOrderPaymentToken } from "@/lib/commerce/payment-link";
import { writeAuditLog } from "@/lib/ops/audit";

const createSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
  intakeSubmissionId: z.string().optional().nullable(),
  send: z.boolean().optional().default(true),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
        unitPrice: z.number().min(0).optional(),
      }),
    )
    .min(1),
});

function serializeInvoice(order: {
  id: string;
  orderNumber: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  total: unknown;
  paymentStatus: string;
  status: string;
  createdAt: Date;
  paymentToken: string | null;
  paymentTokenExpiresAt: Date | null;
  items: Array<{ id: string; title: string; quantity: number; unitPrice: unknown; lineTotal: unknown }>;
  intakeSubmission: { id: string; fullName: string } | null;
  vendorPayables: Array<{
    id: string;
    status: string;
    amount: unknown;
    reference: string;
    vendor: { name: string };
  }>;
  paymentUrl?: string | null;
}) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    phone: order.phone,
    notes: order.notes,
    total: Number(order.total),
    paymentStatus: order.paymentStatus,
    status: order.status,
    createdAt: order.createdAt,
    paymentTokenExpiresAt: order.paymentTokenExpiresAt,
    patientName: order.intakeSubmission?.fullName ?? null,
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
    vendorPayables: order.vendorPayables.map((payable) => ({
      ...payable,
      amount: Number(payable.amount),
    })),
    paymentUrl: order.paymentUrl ?? null,
  };
}

const invoiceInclude = {
  items: true,
  intakeSubmission: { select: { id: true, fullName: true } },
  vendorPayables: { include: { vendor: { select: { name: true } } } },
} as const;

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const [orders, intakes, products] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [{ orderNumber: { startsWith: "KP-INV-" } }, { orderNumber: { startsWith: "KP-THERAPY-" } }, { paymentToken: { not: null } }],
      },
      orderBy: { createdAt: "desc" },
      take: 80,
      include: invoiceInclude,
    }),
    prisma.therapeuticsIntakeSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { id: true, fullName: true, email: true, phone: true, status: true },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", price: { gt: 0 } },
      orderBy: [{ catalogKind: "asc" }, { title: "asc" }],
      select: { id: true, title: true, price: true, catalogKind: true, category: true, vendorId: true, wholesalePrice: true },
    }),
  ]);

  return NextResponse.json({
    invoices: orders.map((order) =>
      serializeInvoice({
        ...order,
        paymentUrl: order.paymentToken ? `/pay/${order.paymentToken}` : null,
      }),
    ),
    patients: intakes,
    products: products.map((product) => ({
      ...product,
      price: Number(product.price),
      wholesalePrice: product.wholesalePrice != null ? Number(product.wholesalePrice) : null,
    })),
  });
}

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid invoice. Check patient, email, and products." }, { status: 400 });
  }

  try {
    const created = await createPatientInvoice(parsed.data);
    await writeAuditLog({
      userId: guard.userId,
      action: "invoice.create",
      entityType: "Order",
      entityId: created.id,
      metadata: { orderNumber: created.orderNumber, total: Number(created.total), sent: parsed.data.send !== false },
    });
    return NextResponse.json({ invoice: created, paymentUrl: created.paymentUrl }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create invoice." },
      { status: 400 },
    );
  }
}

export async function PATCH(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const body = z
    .object({
      orderId: z.string().min(1),
      action: z.enum(["send"]),
    })
    .safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: body.data.orderId },
    include: { intakeSubmission: { select: { fullName: true } } },
  });
  if (!order || !order.email) {
    return NextResponse.json({ error: "Invoice email is missing." }, { status: 400 });
  }
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ error: "This invoice is already paid." }, { status: 400 });
  }

  const issued = await issueOrderPaymentToken(order.id);
  await sendInvoiceEmail({
    to: order.email,
    fullName: order.intakeSubmission?.fullName || order.email,
    orderNumber: order.orderNumber,
    total: Number(order.total),
    paymentUrl: issued.paymentUrl,
    notes: order.notes,
  });

  return NextResponse.json({ paymentUrl: issued.paymentUrl });
}
