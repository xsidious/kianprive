import { NextResponse } from "next/server";
import { ProductStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";
import { asMoney, serializeAdminProduct } from "@/lib/commerce/serialize-product";
import { revalidatePath } from "next/cache";

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

function parseGallery(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { variants: { orderBy: { createdAt: "asc" } }, collection: true },
  });
  return NextResponse.json({ products: products.map(serializeAdminProduct) });
}

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const body = await req.json();
  const variants = (Array.isArray(body.variants) ? body.variants : []) as VariantInput[];
  const hasVariants = Boolean(body.hasVariants) && variants.length > 0;
  const price = asMoney(body.price);
  if (price == null) {
    return NextResponse.json({ error: "A valid price is required." }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({
      data: {
        slug: body.slug,
        title: body.title,
        description: body.description,
        status: (body.status as ProductStatus) ?? ProductStatus.DRAFT,
        category: body.category,
        isPrescription: Boolean(body.isPrescription),
        featuredImage: body.featuredImage,
        galleryImages: parseGallery(body.galleryImages),
        hasVariants,
        price,
        compareAtPrice: asMoney(body.compareAtPrice) ?? null,
        currency: body.currency ?? "USD",
        sku: body.sku || null,
        inventoryQty: Number(body.inventoryQty ?? 0),
        trackInventory: body.trackInventory ?? true,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        stripeProductId: body.stripeProductId,
        stripePriceId: body.stripePriceId,
        collectionId: body.collectionId || null,
        variants: hasVariants
          ? {
              create: variants.map((variant) => ({
                title: variant.title,
                sku: variant.sku || null,
                price: asMoney(variant.price) ?? 0,
                compareAtPrice: asMoney(variant.compareAtPrice) ?? null,
                inventoryQty: variant.inventoryQty ?? 0,
                image: variant.image || null,
                options: (variant.options ?? undefined) as Prisma.InputJsonValue | undefined,
              })),
            }
          : undefined,
      },
      include: { variants: true },
    });

    await writeAuditLog({
      userId: guard.userId,
      action: "commerce.product.create",
      entityType: "Product",
      entityId: product.id,
      metadata: { slug: product.slug },
    });

    revalidatePath("/shop");
    revalidatePath(`/shop/${product.slug}`);
    return NextResponse.json({ product: serializeAdminProduct(product) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
