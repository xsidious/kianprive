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
        <article key={plan.id} className="rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-8">
          <h3 className="font-serif text-2xl text-[#1f1a15]">{plan.name}</h3>
          <p className="mt-3 text-[#6f6251]">{plan.description}</p>
          <ul className="mt-5 space-y-2 text-sm text-[#5f5344]">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="text-[#b78d4b]" aria-hidden>
                  ✦
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {status === "loading" ? (
            <p className="mt-7 text-sm text-[#6f6251]">Checking session...</p>
          ) : isLoggedIn ? (
            <button
              type="button"
              onClick={() => startCheckout(plan.id)}
              disabled={loadingPlan === plan.id}
              className="mt-7 rounded-sm bg-[#b78d4b] px-5 py-2 text-[11px] tracking-[0.16em] text-white disabled:opacity-60"
            >
              {loadingPlan === plan.id ? "REDIRECTING..." : `CHOOSE ${plan.name.toUpperCase()}`}
            </button>
          ) : (
            <div className="mt-7 space-y-3">
              <p className="rounded-sm border border-[#e4d9c8] bg-[#fffaf4] px-4 py-3 text-xs text-[#6f6251]">
                New membership requires consultation, onboarding fee payment, and approval before account activation.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/book-online?service=telemedicine"
                  className="inline-flex rounded-sm bg-[#b78d4b] px-5 py-2 text-[11px] tracking-[0.16em] text-white"
                >
                  SCHEDULE CONSULTATION
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex rounded-sm border border-[#b78d4b70] bg-white px-5 py-2 text-[11px] tracking-[0.16em] text-[#3b3024]"
                >
                  START ACCOUNT ONBOARDING
                </Link>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
