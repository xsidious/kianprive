"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, CheckCircle2, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#b78d4b2d] bg-white p-6 shadow-[0_28px_70px_-46px_rgba(72,49,14,0.45)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f2dfbf66]" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#ead0a366]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <aside className="rounded-3xl border border-[#b78d4b2e] bg-[linear-gradient(160deg,#fffdfa_20%,#f8efe2_100%)] p-6 sm:p-8">
            <div className="relative h-14 w-14">
              <Image src="/images/kianprivelogo.png" alt="KIAN Prive logo" fill className="object-contain" />
            </div>
            <p className="mt-5 inline-flex rounded-full border border-[#b78d4b5e] bg-white px-4 py-1 text-xs tracking-[0.18em] text-[#8f6f3e]">
              NEW MEMBERS
            </p>
            <h1 className="mt-4 text-4xl text-[#1f1a15] sm:text-5xl">Apply for Membership Access</h1>
            <p className="mt-3 max-w-xl text-[#6f6251]">
              New accounts are created after a paid consultation and concierge approval. This keeps membership private,
              verified, and personalized.
            </p>

            <div className="mt-7 space-y-3 text-sm text-[#5f5344]">
              <p className="inline-flex w-full items-center gap-2 rounded-xl border border-[#b78d4b30] bg-white/80 px-4 py-3">
                <CalendarCheck2 size={16} className="text-[#8f6f3e]" />
                1) Book a consultation and onboarding review
              </p>
              <p className="inline-flex w-full items-center gap-2 rounded-xl border border-[#b78d4b30] bg-white/80 px-4 py-3">
                <CheckCircle2 size={16} className="text-[#8f6f3e]" />
                2) Pay onboarding fee and select membership tier
              </p>
              <p className="inline-flex w-full items-center gap-2 rounded-xl border border-[#b78d4b30] bg-white/80 px-4 py-3">
                <ShieldCheck size={16} className="text-[#8f6f3e]" />
                3) Receive account activation and secure login access
              </p>
            </div>
          </aside>

          <div className="rounded-3xl border border-[#b78d4b2e] bg-white p-6 shadow-[0_18px_45px_-35px_rgba(72,49,14,0.45)] sm:p-8">
            <h2 className="text-2xl text-[#1f1a15]">Start Your Consultation</h2>
            <p className="mt-2 text-sm text-[#6f6251]">
              Choose the next step below. We will guide setup, approval, and membership activation for you.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/book-online?service=telemedicine"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b78d4b] to-[#a57b3e] px-5 py-3 text-sm text-white shadow-[0_12px_28px_-18px_rgba(66,45,14,0.6)]"
              >
                Book consultation now
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex w-full items-center justify-center rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-5 py-3 text-sm text-[#3b3024]"
              >
                Review membership and fees
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-full border border-[#b78d4b40] bg-white px-5 py-3 text-sm text-[#3b3024]"
              >
                Already approved? Log in
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border border-[#b78d4b2d] bg-[#fffaf4] p-4 text-sm text-[#5f5344]">
              Existing members can sign in immediately. New members must complete consultation and onboarding before
              account credentials are issued.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
