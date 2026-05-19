"use client";

import { SubscriptionTier } from "@prisma/client";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const isLoggedIn = Boolean(session?.user);

  async function startCheckout(plan: SubscriptionTier) {
    if (!isLoggedIn) {
      window.location.href = "/book-online?service=telemedicine";
      return;
    }

    setLoadingPlan(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    setLoadingPlan(null);
    if (data.url) {
      window.location.assign(data.url);
      return;
    }
    if (data.error) alert(data.error);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <article key={plan.id} className="rounded-3xl border border-[#b78d4b2d] bg-white p-8 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)]">
          <h3 className="text-2xl text-[#1f1a15]">{plan.name}</h3>
          <p className="mt-3 text-[#6f6251]">{plan.description}</p>
          <ul className="mt-5 space-y-2 text-sm text-[#5f5344]">
            {plan.features.map((feature) => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
          {status === "loading" ? (
            <p className="mt-7 text-sm text-[#6f6251]">Checking session...</p>
          ) : isLoggedIn ? (
            <button
              type="button"
              onClick={() => startCheckout(plan.id)}
              disabled={loadingPlan === plan.id}
              className="mt-7 rounded-full bg-[#b78d4b] px-5 py-2 text-white disabled:opacity-60"
            >
              {loadingPlan === plan.id ? "Redirecting..." : `Choose ${plan.name}`}
            </button>
          ) : (
            <div className="mt-7 space-y-3">
              <p className="rounded-xl border border-[#b78d4b30] bg-[#fffaf4] px-4 py-3 text-xs text-[#6f6251]">
                New membership requires consultation, onboarding fee payment, and approval before account activation.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/book-online?service=telemedicine"
                  className="inline-flex rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white"
                >
                  Schedule consultation
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex rounded-full border border-[#b78d4b70] bg-white px-5 py-2 text-sm text-[#3b3024]"
                >
                  Start account onboarding
                </Link>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
