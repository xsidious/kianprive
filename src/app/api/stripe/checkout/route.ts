import { SubscriptionTier } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const planToPrice: Record<string, string | undefined> = {
  BASIC: process.env.STRIPE_PRICE_BASIC,
  PREMIUM: process.env.STRIPE_PRICE_PREMIUM,
};

export async function POST(req: Request) {
  const idempotencyKey = req.headers.get("x-idempotency-key");
  if (idempotencyKey) {
    const existing = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });
    if (existing?.response) {
      return NextResponse.json(existing.response);
    }
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: SubscriptionTier };
  const priceId = planToPrice[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Plan not configured." }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe key missing. Add STRIPE_SECRET_KEY for live checkout." },
      { status: 503 },
    );
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: dbUser.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`,
    metadata: { userId: dbUser.id, plan },
  });

  const response = { url: checkoutSession.url };
  if (idempotencyKey) {
    await prisma.idempotencyKey.upsert({
      where: { key: idempotencyKey },
      create: {
        key: idempotencyKey,
        scope: "stripe.checkout.subscription",
        statusCode: 200,
        response,
      },
      update: {
        statusCode: 200,
        response,
      },
    });
  }

  return NextResponse.json(response);
}
