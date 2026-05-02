import { NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { variants: true, collection: true },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      slug: body.slug,
      title: body.title,
      description: body.description,
      status: (body.status as ProductStatus) ?? ProductStatus.DRAFT,
      category: body.category,
      featuredImage: body.featuredImage,
      price: body.price,
      compareAtPrice: body.compareAtPrice,
      currency: body.currency ?? "USD",
      sku: body.sku,
      inventoryQty: body.inventoryQty ?? 0,
      trackInventory: body.trackInventory ?? true,
      stripeProductId: body.stripeProductId,
      stripePriceId: body.stripePriceId,
      collectionId: body.collectionId,
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "commerce.product.create",
    entityType: "Product",
    entityId: product.id,
    metadata: { slug: product.slug },
  });

  return NextResponse.json({ product }, { status: 201 });
}
