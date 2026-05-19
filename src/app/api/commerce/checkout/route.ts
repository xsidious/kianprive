import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateShipping } from "@/lib/commerce/shipping";
import { createOrderFromCart, createStripeCheckoutForOrder } from "@/lib/commerce/service";

const checkoutSchema = z.object({
  cartId: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  shippingAddress: z.record(z.string(), z.unknown()).optional(),
  billingAddress: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const cart = await prisma.cart.findUnique({
      where: { id: parsed.data.cartId, status: "ACTIVE" },
    });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found or expired." }, { status: 404 });
    }

    const shippingTotal = calculateShipping(Number(cart.subtotal));
    const order = await createOrderFromCart(parsed.data.cartId, {
      email: parsed.data.email,
      phone: parsed.data.phone,
      shippingAddress: parsed.data.shippingAddress,
      billingAddress: parsed.data.billingAddress,
      shippingTotal,
    });

    const session = await createStripeCheckoutForOrder(order.id);

    await prisma.cart.update({
      where: { id: parsed.data.cartId },
      data: { status: "CONVERTED" },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not create checkout session." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, orderNumber: order.orderNumber });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
