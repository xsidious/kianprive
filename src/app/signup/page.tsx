"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, CheckCircle2, ShieldCheck } from "lucide-react";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

export default function SignupPage() {
  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <aside className={`${editorialPanel} p-6 sm:p-8`}>
            <div className="relative h-14 w-14">
              <Image src="/images/kianprivelogo.png" alt="KIAN Prive logo" fill className="object-contain" />
            </div>
            <div className="mt-6">
              <EditorialEyebrow>NEW MEMBERS</EditorialEyebrow>
            </div>
            <h1 className="mt-4 font-serif text-4xl text-[#1f1a15] sm:text-5xl">Apply for Membership Access</h1>
            <p className="mt-3 max-w-xl text-[#6f6251]">
              New accounts are created after a paid consultation and concierge approval. This keeps membership private,
              verified, and personalized.
            </p>

            <div className="mt-7 space-y-3 text-sm text-[#5f5344]">
              <p className={`inline-flex w-full items-center gap-2 ${editorialPanel} px-4 py-3`}>
                <CalendarCheck2 size={16} className="text-[#8f6f3e]" />
                1) Book a consultation and onboarding review
              </p>
              <p className={`inline-flex w-full items-center gap-2 ${editorialPanel} px-4 py-3`}>
                <CheckCircle2 size={16} className="text-[#8f6f3e]" />
                2) Pay onboarding fee and select membership tier
              </p>
              <p className={`inline-flex w-full items-center gap-2 ${editorialPanel} px-4 py-3`}>
                <ShieldCheck size={16} className="text-[#8f6f3e]" />
                3) Receive account activation and secure login access
              </p>
            </div>
          </aside>

          <div className={`${editorialPanel} p-6 sm:p-8`}>
            <h2 className="font-serif text-2xl text-[#1f1a15]">Start Your Consultation</h2>
            <p className="mt-2 text-sm text-[#6f6251]">
              Choose the next step below. We will guide setup, approval, and membership activation for you.
            </p>

            <div className="mt-6 space-y-3">
              <Link href="/book-online?service=telemedicine" className={`w-full ${editorialCtaPrimary}`}>
                BOOK CONSULTATION NOW
                <ArrowRight size={15} className="ml-2" />
              </Link>
              <Link href="/pricing" className={`w-full ${editorialCtaSecondary}`}>
                REVIEW MEMBERSHIP AND FEES
              </Link>
              <Link href="/login" className={`w-full ${editorialCtaSecondary}`}>
                ALREADY APPROVED? LOG IN
              </Link>
            </div>

            <div className={`mt-6 ${editorialPanel} p-4 text-sm text-[#5f5344]`}>
              Existing members can sign in immediately. New members must complete consultation and onboarding before
              account credentials are issued.
            </div>
          </div>
        </div>
      </EditorialSection>
    </div>
  );
}
