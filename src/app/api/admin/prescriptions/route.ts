import { NextResponse } from "next/server";
import { z } from "zod";
import { ProductCatalogKind, ProductStatus } from "@prisma/client";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { asMoney } from "@/lib/commerce/serialize-product";
import { writeAuditLog } from "@/lib/ops/audit";
import { getShippingConfig } from "@/lib/commerce/shipping";
import {
  getPricingConfig,
  serializeProductWithVendorPricing,
  upsertVendorOffer,
} from "@/lib/commerce/vendor-pricing";

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

  const [catalog, records, vendors, intakes, shipping, pricing] = await Promise.all([
    prisma.product.findMany({
      where: { catalogKind: ProductCatalogKind.CLINICAL },
      orderBy: [{ isPrescription: "desc" }, { title: "asc" }],
      include: {
        vendor: { select: { id: true, name: true } },
        vendorOffers: { include: { vendor: { select: { id: true, name: true } } } },
      },
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
    prisma.therapeuticsIntakeSubmission.findMany({
      orderBy: { updatedAt: "desc" },
      take: 150,
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
        assignedPartner: { select: { displayName: true } },
        therapyProposals: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          include: {
            items: {
              include: { product: { select: { id: true, title: true, isPrescription: true, price: true } } },
              orderBy: { createdAt: "asc" },
            },
            order: { select: { id: true, orderNumber: true, total: true, paymentStatus: true } },
            providerPartner: { select: { displayName: true } },
            subscription: {
              select: { status: true, interval: true, intervalDays: true, nextChargeAt: true },
            },
          },
        },
      },
    }),
    getShippingConfig(),
    getPricingConfig(),
  ]);

  return NextResponse.json({
    catalog: catalog.map((product) => serializeProductWithVendorPricing(product, shipping, pricing)),
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
    shipping,
    pricing,
    intakes: intakes.map((intake) => {
      const proposal = intake.therapyProposals[0] ?? null;
      const items =
        proposal?.items.map((item) => ({
          id: item.id,
          title: item.titleSnapshot || item.product.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice != null ? Number(item.unitPrice) : Number(item.product.price),
          isPrescription: item.product.isPrescription,
        })) ?? [];
      return {
        id: intake.id,
        fullName: intake.fullName,
        email: intake.email,
        status: intake.status,
        createdAt: intake.createdAt,
        provider: proposal?.providerPartner.displayName || intake.assignedPartner?.displayName || "Unassigned",
        hasTherapy: Boolean(proposal && items.length),
        therapy: proposal
          ? {
              id: proposal.id,
              status: proposal.status,
              sentAt: proposal.sentAt,
              paidAt: proposal.paidAt,
              notes: proposal.notes,
              order: proposal.order ? { ...proposal.order, total: Number(proposal.order.total) } : null,
              items,
              total: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
              billing:
                proposal.subscription && proposal.subscription.interval !== "ONE_TIME"
                  ? {
                      status: proposal.subscription.status,
                      interval: proposal.subscription.interval,
                      nextChargeAt: proposal.subscription.nextChargeAt,
                    }
                  : proposal.billingInterval !== "ONE_TIME"
                    ? { status: "PENDING", interval: proposal.billingInterval, nextChargeAt: null }
                    : null,
            }
          : null,
      };
    }),
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

  if (parsed.data.vendorId && parsed.data.wholesalePrice != null) {
    await upsertVendorOffer({
      productId: product.id,
      vendorId: parsed.data.vendorId,
      unitCost: parsed.data.wholesalePrice,
    });
  }

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

  if (body.data.vendorId && body.data.wholesalePrice != null) {
    await upsertVendorOffer({
      productId: product.id,
      vendorId: body.data.vendorId,
      unitCost: body.data.wholesalePrice,
    });
  }

  return NextResponse.json({ product: { ...product, price: Number(product.price) } });
}
