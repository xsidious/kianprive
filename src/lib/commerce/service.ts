import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCatalogProduct } from "@/lib/commerce/products";
import { calculateShipping } from "@/lib/commerce/shipping";
import { stripe } from "@/lib/stripe";

async function resolveProduct(productIdOrSlug: string) {
  const byId = await prisma.product.findUnique({ where: { id: productIdOrSlug } });
  if (byId) return byId;

  const bySlug = await prisma.product.findUnique({ where: { slug: productIdOrSlug } });
  if (bySlug) return bySlug;

  const catalog = getCatalogProduct(productIdOrSlug);
  if (!catalog) return null;

  return prisma.product.upsert({
    where: { slug: catalog.slug },
    update: {
      title: catalog.name,
      category: catalog.category,
      price: catalog.price,
      featuredImage: catalog.image,
      status: "ACTIVE",
    },
    create: {
      slug: catalog.slug,
      title: catalog.name,
      description: `${catalog.name} by KIAN Privé`,
      category: catalog.category,
      price: catalog.price,
      featuredImage: catalog.image,
      status: "ACTIVE",
      inventoryQty: 250,
    },
  });
}

export async function createOrUpdateCartItem(input: {
  cartId?: string;
  userId?: string;
  email?: string;
  productId: string;
  quantity: number;
}) {
  const product = await resolveProduct(input.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const cart =
    (input.cartId
      ? await prisma.cart.findUnique({
          where: { id: input.cartId, status: "ACTIVE" },
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

export async function replaceCartItems(input: {
  cartId?: string;
  userId?: string;
  email?: string;
  items: Array<{ productId: string; quantity: number }>;
}) {
  const cart =
    (input.cartId
      ? await prisma.cart.findUnique({
          where: { id: input.cartId, status: "ACTIVE" },
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

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  for (const item of input.items) {
    if (item.quantity <= 0) continue;
    const product = await resolveProduct(item.productId);
    if (!product) continue;
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal: product.price.mul(item.quantity),
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
    include: { items: { include: { product: true } } },
  });
}

export async function createOrderFromCart(
  cartId: string,
  input: {
    email?: string;
    phone?: string;
    shippingAddress?: unknown;
    billingAddress?: unknown;
    shippingTotal?: number;
  },
) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId, status: "ACTIVE" },
    include: { items: { include: { product: true } } },
  });
  if (!cart) throw new Error("Cart not found");
  if (!cart.items.length) throw new Error("Cart is empty");

  const subtotalNumber = Number(cart.subtotal);
  const shippingTotal = new Prisma.Decimal(input.shippingTotal ?? calculateShipping(subtotalNumber));
  const orderTotal = cart.subtotal.add(shippingTotal);
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
      shippingTotal,
      total: orderTotal,
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

  return order;
}

export async function createStripeCheckoutForOrder(orderId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new Error("Order not found");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: order.currency.toLowerCase(),
      product_data: { name: item.title },
      unit_amount: Math.round(Number(item.unitPrice) * 100),
    },
    quantity: item.quantity,
  }));

  if (Number(order.shippingTotal) > 0) {
    lineItems.push({
      price_data: {
        currency: order.currency.toLowerCase(),
        product_data: { name: "Shipping" },
        unit_amount: Math.round(Number(order.shippingTotal) * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.email ?? undefined,
    line_items: lineItems,
    success_url: `${appUrl}/checkout/success?order=${order.orderNumber}`,
    cancel_url: `${appUrl}/checkout?canceled=1`,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      checkoutType: "product_order",
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return session;
}

export async function markOrderPaidFromCheckoutSession(sessionId: string, paymentIntentId?: string) {
  const order = await prisma.order.findFirst({
    where: { stripeCheckoutSessionId: sessionId },
  });
  if (!order) return null;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paymentStatus: "PAID",
      stripePaymentIntentId: paymentIntentId ?? order.stripePaymentIntentId,
    },
  });

  return order;
}
