import { NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const body = await req.json();

  const product = await prisma.product.update({
    where: { id },
    data: {
      slug: body.slug,
      title: body.title,
      description: body.description,
      category: body.category,
      featuredImage: body.featuredImage,
      status: body.status as ProductStatus | undefined,
      inventoryQty: body.inventoryQty,
      price: body.price,
      compareAtPrice: body.compareAtPrice,
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "commerce.product.update",
    entityType: "Product",
    entityId: product.id,
    metadata: { slug: product.slug, status: product.status },
  });

  return NextResponse.json({ product });
}

export async function DELETE(_: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;

  const product = await prisma.product.delete({ where: { id } });
  await writeAuditLog({
    userId: guard.userId,
    action: "commerce.product.delete",
    entityType: "Product",
    entityId: id,
    metadata: { slug: product.slug },
  });
  return NextResponse.json({ ok: true });
}
