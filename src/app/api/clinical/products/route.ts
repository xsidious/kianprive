import { NextResponse } from "next/server";
import { ProductCatalogKind, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/rbac";

/**
 * Clinical therapeutics catalog.
 * - Members / providers: no prices in response (unless admin)
 * - Admin: full pricing + wholesale
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category")?.trim() || undefined;
  const q = searchParams.get("q")?.trim() || undefined;
  const isAdmin = canAccessAdmin(session.user.role);

  const products = await prisma.product.findMany({
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
    },
  });

  const categories = await prisma.product.findMany({
    where: { catalogKind: ProductCatalogKind.CLINICAL, status: ProductStatus.ACTIVE },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      price: isAdmin && "price" in p ? Number(p.price ?? 0) : undefined,
      wholesalePrice:
        isAdmin && "wholesalePrice" in p && p.wholesalePrice != null
          ? Number(p.wholesalePrice)
          : undefined,
    })),
    categories: categories.map((c) => c.category).filter(Boolean) as string[],
  });
}
