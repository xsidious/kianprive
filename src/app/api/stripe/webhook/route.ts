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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
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

  return NextResponse.json({ received: true });
}
