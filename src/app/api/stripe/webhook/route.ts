import { SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventKey = `stripe:${event.id}`;
  const alreadyProcessed = await prisma.idempotencyKey.findUnique({
    where: { key: eventKey },
  });
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.metadata?.checkoutType === "product_order" && session.metadata.orderId) {
      await prisma.order.update({
        where: { id: session.metadata.orderId },
        data: {
          status: "PAID",
          paymentStatus: "PAID",
          stripePaymentIntentId: session.payment_intent?.toString() ?? undefined,
        },
      });
    }

    const userId = session.metadata?.userId;
    const plan = (session.metadata?.plan ?? "BASIC") as SubscriptionTier;
    if (userId) {
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          tier: plan,
          status: SubscriptionStatus.ACTIVE,
          stripeCustomerId: session.customer?.toString(),
          stripeSubscriptionId: session.subscription?.toString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        update: {
          tier: plan,
          status: SubscriptionStatus.ACTIVE,
          stripeCustomerId: session.customer?.toString(),
          stripeSubscriptionId: session.subscription?.toString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { role: "MEMBER" },
      });
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const order = await prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    if (order) {
      await prisma.paymentRecord.create({
        data: {
          orderId: order.id,
          status: "PAID",
          amount: (paymentIntent.amount_received ?? paymentIntent.amount) / 100,
          currency: (paymentIntent.currency ?? "usd").toUpperCase(),
          stripePaymentIntentId: paymentIntent.id,
          metadata: paymentIntent.metadata,
        },
      });
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentStatus: "PAID",
        },
      });
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    if (charge.payment_intent) {
      const order = await prisma.order.findFirst({
        where: { stripePaymentIntentId: charge.payment_intent.toString() },
      });
      if (order) {
        await prisma.refundRecord.create({
          data: {
            orderId: order.id,
            amount: (charge.amount_refunded ?? 0) / 100,
            reason: "stripe_charge_refund",
            metadata: charge.metadata,
          },
        });
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "REFUNDED",
            paymentStatus: "REFUNDED",
          },
        });
      }
    }
  }

  await prisma.idempotencyKey.create({
    data: {
      key: eventKey,
      scope: "stripe.webhook",
      statusCode: 200,
      response: { type: event.type },
    },
  });

  return NextResponse.json({ received: true });
}
