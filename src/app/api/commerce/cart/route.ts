import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrUpdateCartItem, replaceCartItems } from "@/lib/commerce/service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cartId = searchParams.get("cartId");
  if (!cartId) return NextResponse.json({ error: "cartId required" }, { status: 400 });

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } },
  });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  return NextResponse.json({ cart });
}

export async function POST(req: Request) {
  const body = await req.json();
  const session = await auth();

  if (Array.isArray(body.items)) {
    const cart = await replaceCartItems({
      cartId: body.cartId,
      userId: session?.user?.id,
      email: body.email ?? session?.user?.email ?? undefined,
      items: body.items as Array<{ productId: string; quantity: number }>,
    });
    return NextResponse.json({ cart });
  }

  const cart = await createOrUpdateCartItem({
    cartId: body.cartId,
    userId: session?.user?.id,
    email: body.email ?? session?.user?.email ?? undefined,
    productId: body.productId,
    quantity: body.quantity ?? 1,
  });

  return NextResponse.json({ cart });
}
