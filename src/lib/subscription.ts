import { SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getUserSubscription(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
  });
}

export function isSubscriptionActive(
  status?: SubscriptionStatus,
  currentPeriodEnd?: Date | null,
) {
  if (status !== SubscriptionStatus.ACTIVE) return false;
  if (!currentPeriodEnd) return false;
  return currentPeriodEnd.getTime() > Date.now();
}

export function isPremiumTier(tier?: SubscriptionTier) {
  return tier === SubscriptionTier.PREMIUM;
}

export async function hasActivePremiumAccess(userId: string) {
  const sub = await getUserSubscription(userId);
  if (!sub) return false;
  return isSubscriptionActive(sub.status, sub.currentPeriodEnd) && isPremiumTier(sub.tier);
}
