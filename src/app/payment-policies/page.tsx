import {
  KianPrivePaymentPolicies,
  PoliciesPageLinks,
} from "@/components/policies/KianPrivePaymentPolicies";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Link from "next/link";

export default function PaymentPoliciesPage() {
  return (
    <SectionWrapper className="pt-14 sm:pt-16">
      <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">KIAN PRIVÉ</p>
      <h1 className="mt-3 text-3xl text-[#1f1a15] sm:text-4xl md:text-5xl">Payment & Policies</h1>
      <p className="mt-4 max-w-3xl text-[#6f6251]">
        Membership, payment, financing, and wellness disclaimers for KIAN Privé concierge services, packages, and
        memberships.
      </p>
      <PoliciesPageLinks className="mt-4" />
      <div className="mt-10">
        <KianPrivePaymentPolicies showMembershipSummary />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/pricing" className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
          View membership pricing
        </Link>
        <Link href="/book-online" className="rounded-full border border-[#b78d4b70] bg-white px-5 py-2 text-sm text-[#3b3024]">
          Book consultation
        </Link>
      </div>
    </SectionWrapper>
  );
}
