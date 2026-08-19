import { NextResponse } from "next/server";
import { ProductCatalogKind, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canAccessAdmin, canAccessProviderPortal } from "@/lib/rbac";
import { getPricingConfig, serializeProductWithVendorPricing } from "@/lib/commerce/vendor-pricing";
import { getShippingConfig } from "@/lib/commerce/shipping";

/**
 * Clinical therapeutics catalog for physicians and admin only.
 * Not a public or member storefront.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const role = session.user.role;
  if (!canAccessAdmin(role) && !canAccessProviderPortal(role)) {
    return NextResponse.json({ error: "Clinical catalog is limited to the care team." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category")?.trim() || undefined;
  const q = searchParams.get("q")?.trim() || undefined;
  const isAdmin = canAccessAdmin(session.user.role);

  const [products, categories, shipping, pricing] = await Promise.all([
    prisma.product.findMany({
      where: {
        catalogKind: ProductCatalogKind.CLINICAL,
        status: ProductStatus.ACTIVE,
        ...(category ? { category } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { sku: { contains: q, mode: "insensitive" } },
                { subcategory: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ category: "asc" }, { title: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        form: true,
        strength: true,
        deliveryMethod: true,
        featuredImage: true,
        isPrescription: true,
        price: isAdmin,
        wholesalePrice: isAdmin,
        status: isAdmin,
        vendorId: isAdmin,
        sku: isAdmin,
        vendor: isAdmin ? { select: { id: true, name: true } } : false,
        vendorOffers: isAdmin
          ? { include: { vendor: { select: { id: true, name: true } } } }
          : false,
      },
    }),
    prisma.product.findMany({
      where: { catalogKind: ProductCatalogKind.CLINICAL, status: ProductStatus.ACTIVE },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    isAdmin ? getShippingConfig() : Promise.resolve(null),
    isAdmin ? getPricingConfig() : Promise.resolve(null),
  ]);

  return NextResponse.json({
    products: products.map((p) => {
      if (!isAdmin) {
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          description: p.description,
          category: p.category,
          subcategory: p.subcategory,
          form: p.form,
          strength: p.strength,
          deliveryMethod: p.deliveryMethod,
          featuredImage: p.featuredImage,
          isPrescription: p.isPrescription,
        };
      }
      const enriched = shipping && pricing
        ? serializeProductWithVendorPricing(p as Parameters<typeof serializeProductWithVendorPricing>[0], shipping, pricing)
        : null;
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        category: p.category,
        subcategory: p.subcategory,
        form: p.form,
        strength: p.strength,
        deliveryMethod: p.deliveryMethod,
        featuredImage: p.featuredImage,
        isPrescription: p.isPrescription,
        price: Number((p as { price?: unknown }).price ?? 0),
        wholesalePrice:
          (p as { wholesalePrice?: unknown }).wholesalePrice != null
            ? Number((p as { wholesalePrice: unknown }).wholesalePrice)
            : undefined,
        vendorOffers: enriched?.vendorOffers,
        bestVendor: enriched?.bestVendor,
        suggestedPrice: enriched?.suggestedPrice,
        landedCost: enriched?.landedCost,
      };
    }),
    categories: categories.map((c) => c.category).filter(Boolean) as string[],
    ...(isAdmin && shipping && pricing
      ? { shipping, pricing }
      : {}),
  });
}
