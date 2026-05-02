import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createOrUpdateCartItem(input: {
  cartId?: string;
  userId?: string;
  email?: string;
  productId: string;
  quantity: number;
}) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
  });
  if (!product) {
    throw new Error("Product not found");
  }

  const cart =
    (input.cartId
      ? await prisma.cart.findUnique({
          where: { id: input.cartId },
          include: { items: true },
        })
      : null) ??
    (await prisma.cart.create({
      data: {
        userId: input.userId,
        email: input.email,
      },
      include: { items: true },
    }));

  const existing = cart.items.find((item) => item.productId === product.id);
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + input.quantity,
        lineTotal: product.price.mul(existing.quantity + input.quantity),
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: input.quantity,
        unitPrice: product.price,
        lineTotal: product.price.mul(input.quantity),
      },
    });
  }

  return recalculateCartTotals(cart.id);
}

export async function recalculateCartTotals(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: true },
  });
  if (!cart) throw new Error("Cart not found");

  const subtotal = cart.items.reduce((sum, item) => sum.add(item.lineTotal), new Prisma.Decimal(0));
  const discountTotal = new Prisma.Decimal(0);
  const taxTotal = new Prisma.Decimal(0);
  const total = subtotal.sub(discountTotal).add(taxTotal);

  return prisma.cart.update({
    where: { id: cartId },
    data: {
      subtotal,
      discountTotal,
      taxTotal,
      total,
    },
    include: { items: true },
  });
}

export async function createOrderFromCart(cartId: string, input: { email?: string; phone?: string; shippingAddress?: unknown; billingAddress?: unknown }) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } },
  });
  if (!cart) throw new Error("Cart not found");
  if (!cart.items.length) throw new Error("Cart is empty");

  const orderNumber = `KP-${Date.now()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: cart.userId,
      email: input.email ?? cart.email ?? undefined,
      phone: input.phone,
      currency: cart.currency,
      subtotal: cart.subtotal,
      discountTotal: cart.discountTotal,
      taxTotal: cart.taxTotal,
      total: cart.total,
      shippingAddress: (input.shippingAddress as object | undefined) ?? undefined,
      billingAddress: (input.billingAddress as object | undefined) ?? undefined,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          title: item.product.title,
          sku: item.product.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
      },
    },
    include: { items: true },
  });

  await prisma.cart.update({
    where: { id: cart.id },
    data: { status: "CONVERTED" },
  });

  return order;
}
