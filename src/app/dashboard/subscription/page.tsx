import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserSubscription } from "@/lib/subscription";
import { SubscriptionManager } from "@/app/dashboard/subscription/subscription-manager";

export default async function DashboardSubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const sub = await getUserSubscription(session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl text-[#1f1a15]">Your Subscription</h1>
      <p className="mt-2 text-[#6f6251]">Sign up for membership, upgrade, or change your current plan.</p>
      <div className="mt-8">
        <SubscriptionManager
          initialSubscription={
            sub
              ? {
                  tier: sub.tier,
                  status: sub.status,
                  currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
