"use client";

import { BadgeCheck, Crown, MessageCircleMore, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/contact";

type SubscriptionView = {
  tier: "BASIC" | "PREMIUM";
  status: "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  currentPeriodEnd: string | null;
};

const plans = [
  {
    id: "BASIC",
    title: "Basic Membership",
    description: "Essential access for concierge updates and core account features.",
    features: ["Account dashboard", "Profile management", "Booking history"],
  },
  {
    id: "PREMIUM",
    title: "Premium Membership",
    description: "Full premium access for advanced protocols, member pricing, and priority support.",
    features: ["Premium pricing unlock", "Priority concierge support", "Advanced practitioner resources"],
  },
] as const;

export function SubscriptionManager({ initialSubscription }: { initialSubscription: SubscriptionView | null }) {
  const [subscription, setSubscription] = useState<SubscriptionView | null>(initialSubscription);
  const [statusMessage, setStatusMessage] = useState("");
  const [pendingPlan, setPendingPlan] = useState<"BASIC" | "PREMIUM" | null>(null);

  const renewal = useMemo(() => {
    if (!subscription?.currentPeriodEnd) return "N/A";
    return new Date(subscription.currentPeriodEnd).toLocaleDateString();
  }, [subscription]);

  async function choosePlan(plan: "BASIC" | "PREMIUM") {
    setPendingPlan(plan);
    setStatusMessage("");

    const checkoutResponse = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (checkoutResponse.ok) {
      const payload = (await checkoutResponse.json()) as { url?: string };
      if (payload.url) {
        window.location.href = payload.url;
        return;
      }
    }

    const fallbackResponse = await fetch("/api/subscription/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: plan }),
    });

    if (!fallbackResponse.ok) {
      setStatusMessage("Could not update membership. Please try again.");
      setPendingPlan(null);
      return;
    }

    const payload = (await fallbackResponse.json()) as {
      subscription: SubscriptionView;
    };
    setSubscription(payload.subscription);
    setStatusMessage(`Membership updated to ${plan}.`);
    setPendingPlan(null);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#d7b67666] bg-white p-6 text-[#2b2218]">
        <p className="inline-flex items-center gap-2 text-xs tracking-[0.14em] text-[#8f6f3e]"><Crown size={14} /> MEMBERSHIP OVERVIEW</p>
        <p className="mt-3 text-lg">Tier: {subscription?.tier ?? "BASIC"}</p>
        <p className="mt-2">Status: {subscription?.status ?? "INACTIVE"}</p>
        <p className="mt-2">Renewal: {renewal}</p>
        <a
          href={buildWhatsAppUrl(`Hi KIAN Privé team, I have a question about my membership plan (${subscription?.tier ?? "BASIC"}).`)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#25d36680] bg-[#ecfff3] px-4 py-2 text-sm text-[#1f7e45]"
        >
          <MessageCircleMore size={15} />
          Ask on WhatsApp
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = subscription?.tier === plan.id && subscription?.status === "ACTIVE";
          return (
            <article key={plan.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-5">
              <h2 className="inline-flex items-center gap-2 text-xl text-[#1f1a15]">{plan.id === "PREMIUM" ? <Star size={18} /> : <BadgeCheck size={18} />}{plan.title}</h2>
              <p className="mt-2 text-sm text-[#6f6251]">{plan.description}</p>
              <ul className="mt-3 space-y-1 text-sm text-[#5f5344]">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <button
                onClick={() => void choosePlan(plan.id)}
                disabled={isCurrent || pendingPlan !== null}
                className="mt-4 rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCurrent ? "Current Plan" : pendingPlan === plan.id ? "Updating..." : `Choose ${plan.id}`}
              </button>
            </article>
          );
        })}
      </div>

      {statusMessage ? <p className="text-sm text-[#8f6f3e]">{statusMessage}</p> : null}
    </div>
  );
}
