import { NextResponse } from "next/server";
import { SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const allowedTiers = new Set<SubscriptionTier>([SubscriptionTier.BASIC, SubscriptionTier.PREMIUM]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { tier?: SubscriptionTier };
  const tier = body?.tier;
  if (!tier || !allowedTiers.has(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const subscription = await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      tier,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
    update: {
      tier,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  return NextResponse.json({
    ok: true,
    subscription: {
      tier: subscription.tier,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
    },
  });
}
