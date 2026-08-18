import { NextResponse } from "next/server";
import { z } from "zod";
import { ProductCatalogKind, ProductStatus } from "@prisma/client";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { asMoney } from "@/lib/commerce/serialize-product";
import { writeAuditLog } from "@/lib/ops/audit";

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || `rx-${Date.now()}`
  );
}

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const [catalog, records, vendors] = await Promise.all([
    prisma.product.findMany({
      where: { catalogKind: ProductCatalogKind.CLINICAL },
      orderBy: [{ isPrescription: "desc" }, { title: "asc" }],
      include: { vendor: { select: { id: true, name: true } } },
    }),
    prisma.intakeTherapyProposal.findMany({
      orderBy: { updatedAt: "desc" },
      take: 120,
      include: {
        items: {
          include: { product: { select: { id: true, title: true, isPrescription: true, price: true } } },
          orderBy: { createdAt: "asc" },
        },
        intakeSubmission: { select: { id: true, fullName: true, email: true, status: true } },
        order: { select: { id: true, orderNumber: true, total: true, paymentStatus: true } },
        providerPartner: { select: { displayName: true } },
        subscription: {
          select: { status: true, interval: true, intervalDays: true, nextChargeAt: true },
        },
      },
    }),
    prisma.vendor.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return NextResponse.json({
    catalog: catalog.map((product) => ({
      ...product,
      price: Number(product.price),
      wholesalePrice: product.wholesalePrice != null ? Number(product.wholesalePrice) : null,
    })),
    records: records.map((row) => ({
      id: row.id,
      status: row.status,
      sentAt: row.sentAt,
      paidAt: row.paidAt,
      notes: row.notes,
      patient: row.intakeSubmission,
      provider: row.providerPartner.displayName,
      order: row.order
        ? { ...row.order, total: Number(row.order.total) }
        : null,
      items: row.items.map((item) => ({
        id: item.id,
        title: item.titleSnapshot || item.product.title,
        quantity: item.quantity,
        unitPrice: item.unitPrice != null ? Number(item.unitPrice) : Number(item.product.price),
        isPrescription: item.product.isPrescription,
      })),
      total: row.items.reduce((sum, item) => {
        const unit = item.unitPrice != null ? Number(item.unitPrice) : Number(item.product.price);
        return sum + unit * item.quantity;
      }, 0),
      billingInterval: row.billingInterval,
      billing:
        row.subscription && row.subscription.interval !== "ONE_TIME"
          ? {
              status: row.subscription.status,
              interval: row.subscription.interval,
              nextChargeAt: row.subscription.nextChargeAt,
            }
          : row.billingInterval !== "ONE_TIME"
            ? { status: "PENDING", interval: row.billingInterval, nextChargeAt: null }
            : null,
    })),
    vendors,
  });
}

const createSchema = z.object({
  title: z.string().min(2).max(200),
  category: z.string().max(80).optional().nullable(),
  form: z.string().max(80).optional().nullable(),
  strength: z.string().max(80).optional().nullable(),
  price: z.number().min(0),
  wholesalePrice: z.number().min(0).optional().nullable(),
  vendorId: z.string().optional().nullable(),
  sku: z.string().max(80).optional().nullable(),
});

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const body = await req.json();

  if (body?.action === "markAllPrescriptions") {
    const result = await prisma.product.updateMany({
      where: { catalogKind: ProductCatalogKind.CLINICAL, isPrescription: false },
      data: { isPrescription: true },
    });
    await writeAuditLog({
      userId: guard.userId,
      action: "prescriptions.mark_all",
      entityType: "Product",
      metadata: { count: result.count },
    });
    return NextResponse.json({ updated: result.count });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid prescription." }, { status: 400 });
  }

  let slug = slugify(parsed.data.title);
  const clash = await prisma.product.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const product = await prisma.product.create({
    data: {
      slug,
      title: parsed.data.title.trim(),
      category: parsed.data.category?.trim() || "Peptides",
      form: parsed.data.form?.trim() || null,
      strength: parsed.data.strength?.trim() || null,
      price: parsed.data.price,
      wholesalePrice: parsed.data.wholesalePrice ?? null,
      vendorId: parsed.data.vendorId || null,
      sku: parsed.data.sku?.trim() || null,
      catalogKind: ProductCatalogKind.CLINICAL,
      isPrescription: true,
      status: ProductStatus.ACTIVE,
      inventoryQty: 0,
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "prescription.create",
    entityType: "Product",
    entityId: product.id,
  });

  return NextResponse.json({ product: { ...product, price: Number(product.price) } }, { status: 201 });
}

export async function PATCH(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const body = z
    .object({
      id: z.string().min(1),
      price: z.number().min(0).optional(),
      wholesalePrice: z.number().min(0).nullable().optional(),
      vendorId: z.string().nullable().optional(),
      isPrescription: z.boolean().optional(),
      status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
      title: z.string().min(2).optional(),
      category: z.string().optional().nullable(),
    })
    .safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: body.data.id },
    data: {
      price: body.data.price,
      wholesalePrice:
        body.data.wholesalePrice === undefined ? undefined : asMoney(body.data.wholesalePrice) ?? null,
      vendorId: body.data.vendorId === undefined ? undefined : body.data.vendorId,
      isPrescription: body.data.isPrescription,
      status: body.data.status as ProductStatus | undefined,
      title: body.data.title?.trim(),
      category: body.data.category === undefined ? undefined : body.data.category,
    },
  });

  return NextResponse.json({ product: { ...product, price: Number(product.price) } });
}
