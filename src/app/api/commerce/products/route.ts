import { NextResponse } from "next/server";
import { ProductCatalogKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Public shop catalog — retail only. Clinical / therapeutics stay off this feed. */
export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", catalogKind: ProductCatalogKind.RETAIL },
    orderBy: { updatedAt: "desc" },
    include: { variants: true },
  });
  return NextResponse.json({
    products: products.map(({ wholesalePrice: _w, ...product }) => product),
  });
}
