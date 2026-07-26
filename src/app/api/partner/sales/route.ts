import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";
import { createProductCommissionsForOrder } from "@/lib/commissions";

const saleSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50).default(1),
  email: z.string().email(),
  phone: z.string().optional(),
  fullName: z.string().min(2).optional(),
  note: z.string().optional(),
});

export async function POST(req: Request) {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  if (access.partner.status !== "ACTIVE") {
    return NextResponse.json({ error: "Partner must be ACTIVE to record sales." }, { status: 403 });
  }

  const parsed = saleSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid sale payload" }, { status: 400 });

  const assignment = await prisma.partnerProductAssignment.findFirst({
    where: {
      partnerId: access.partner.id,
      productId: parsed.data.productId,
      active: true,
    },
    include: { product: true },
  });
  if (!assignment) {
    return NextResponse.json({ error: "Product is not assigned to you." }, { status: 403 });
  }

  const product = assignment.product;
  const qty = parsed.data.quantity;
  const unitPrice = Number(product.price);
  const lineTotal = Math.round(unitPrice * qty * 100) / 100;

  if (product.trackInventory && product.inventoryQty < qty) {
    return NextResponse.json({ error: "Insufficient inventory for this sale." }, { status: 400 });
  }

  const order = await prisma.$transaction(async (tx) => {
    if (product.trackInventory) {
      await tx.product.update({
        where: { id: product.id },
        data: { inventoryQty: { decrement: qty } },
      });
    }

    return tx.order.create({
      data: {
        orderNumber: `KP-POS-${Date.now()}`,
        partnerId: access.partner.id,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        currency: product.currency,
        subtotal: lineTotal,
        shippingTotal: 0,
        total: lineTotal,
        status: "PAID",
        paymentStatus: "PAID",
        shippingAddress: {
          firstName: parsed.data.fullName ?? "Partner",
          lastName: "Sale",
          note: parsed.data.note ?? "Recorded via partner portal",
        } as Prisma.InputJsonValue,
        items: {
          create: [
            {
              productId: product.id,
              partnerId: access.partner.id,
              title: product.title,
              sku: product.sku,
              quantity: qty,
              unitPrice,
              lineTotal,
            },
          ],
        },
      },
      include: { items: true },
    });
  });

  await createProductCommissionsForOrder(order.id);
  await writeAuditLog({
    userId: access.userId,
    action: "partner.sale.record",
    entityType: "Order",
    entityId: order.id,
    metadata: { productId: product.id, quantity: qty, total: lineTotal },
  });

  return NextResponse.json({ order }, { status: 201 });
}
