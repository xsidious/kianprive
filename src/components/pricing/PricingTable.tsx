"use client";

import { SubscriptionTier } from "@prisma/client";
import { useState } from "react";

const plans = [
  {
    id: SubscriptionTier.BASIC,
    name: "Basic Membership",
    description: "Access core concierge services, events updates, and member dashboard.",
    features: ["Priority scheduling", "Private updates", "Member dashboard access"],
  },
  {
    id: SubscriptionTier.PREMIUM,
    name: "Premium Access",
    description: "Includes all premium training, Icoone education, and one-on-one guidance.",
    features: ["All Basic benefits", "Icoone Training unlock", "Premium protocol library"],
  },
];

export function PricingTable() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function startCheckout(plan: SubscriptionTier) {
    setLoadingPlan(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) window.location.assign(data.url);
    setLoadingPlan(null);
    if (data.error) alert(data.error);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <article key={plan.id} className="rounded-3xl border border-[#d7b67666] bg-[#15120f] p-8">
          <h3 className="text-2xl text-[#f4ecd9]">{plan.name}</h3>
          <p className="mt-3 text-[#e7ddca]">{plan.description}</p>
          <ul className="mt-5 space-y-2 text-sm text-[#f2eadbb3]">
            {plan.features.map((feature) => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
          <button
            onClick={() => startCheckout(plan.id)}
            disabled={loadingPlan === plan.id}
            className="mt-7 rounded-full bg-[#d7b676] px-5 py-2 text-black disabled:opacity-60"
          >
            {loadingPlan === plan.id ? "Redirecting..." : `Choose ${plan.name}`}
          </button>
        </article>
      ))}
    </div>
  );
}
