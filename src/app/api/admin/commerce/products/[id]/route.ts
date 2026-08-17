import { NextResponse } from "next/server";
import { ProductStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";
import { asMoney, serializeAdminProduct } from "@/lib/commerce/serialize-product";

type Params = {
  params: Promise<{ id: string }>;
};

type VariantInput = {
  id?: string;
  title: string;
  sku?: string | null;
  price: number;
  compareAtPrice?: number | null;
  inventoryQty?: number;
  image?: string | null;
  options?: Record<string, string> | null;
};

function parseGallery(value: unknown): string[] | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
}

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const body = await req.json();
  const variants = Array.isArray(body.variants) ? (body.variants as VariantInput[]) : null;
  const hasVariants = body.hasVariants != null ? Boolean(body.hasVariants) : undefined;
  const price = body.price != null && body.price !== "" ? asMoney(body.price) : undefined;
  if (body.price != null && body.price !== "" && price == null) {
    return NextResponse.json({ error: "A valid price is required." }, { status: 400 });
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          slug: body.slug,
          title: body.title,
          description: body.description,
          category: body.category,
          isPrescription: body.isPrescription != null ? Boolean(body.isPrescription) : undefined,
          featuredImage: body.featuredImage,
          galleryImages: parseGallery(body.galleryImages),
          hasVariants,
          status: body.status as ProductStatus | undefined,
          inventoryQty: body.inventoryQty != null ? Number(body.inventoryQty) : undefined,
          price,
          compareAtPrice: body.compareAtPrice === undefined ? undefined : asMoney(body.compareAtPrice) ?? null,
          sku: body.sku === "" ? null : body.sku,
          seoTitle: body.seoTitle,
          seoDescription: body.seoDescription,
          trackInventory: body.trackInventory,
        },
      });

      if (variants) {
        const keepIds = variants.map((v) => v.id).filter(Boolean) as string[];
        await tx.productVariant.deleteMany({
          where: {
            productId: id,
            ...(keepIds.length ? { id: { notIn: keepIds } } : {}),
          },
        });

        for (const variant of variants) {
          const data = {
            title: variant.title,
            sku: variant.sku || null,
            price: asMoney(variant.price) ?? 0,
            compareAtPrice: asMoney(variant.compareAtPrice) ?? null,
            inventoryQty: variant.inventoryQty ?? 0,
            image: variant.image || null,
            options: (variant.options ?? undefined) as Prisma.InputJsonValue | undefined,
          };
          if (variant.id) {
            await tx.productVariant.update({ where: { id: variant.id }, data });
          } else {
            await tx.productVariant.create({ data: { ...data, productId: id } });
          }
        }

        await tx.product.update({
          where: { id },
          data: { hasVariants: variants.length > 0 },
        });
      }

      return tx.product.findUnique({
        where: { id: updated.id },
        include: { variants: { orderBy: { createdAt: "asc" } } },
      });
    });

    await writeAuditLog({
      userId: guard.userId,
      action: "commerce.product.update",
      entityType: "Product",
      entityId: id,
      metadata: { slug: product?.slug, status: product?.status },
    });

    revalidatePath("/shop");
    if (product?.slug) revalidatePath(`/shop/${product.slug}`);
    return NextResponse.json({ product: product ? serializeAdminProduct(product) : product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
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
