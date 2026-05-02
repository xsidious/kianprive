import { NextResponse } from "next/server";
import { createOrderFromCart } from "@/lib/commerce/service";

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.cartId) return NextResponse.json({ error: "cartId required" }, { status: 400 });

  const order = await createOrderFromCart(body.cartId, {
    email: body.email,
    phone: body.phone,
    shippingAddress: body.shippingAddress,
    billingAddress: body.billingAddress,
  });

  return NextResponse.json({ order }, { status: 201 });
}
