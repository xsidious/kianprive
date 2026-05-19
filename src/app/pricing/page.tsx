import {
  KianPrivePaymentPolicies,
  MembershipPolicySummaryBox,
  PoliciesPageLinks,
} from "@/components/policies/KianPrivePaymentPolicies";
import { PricingTable } from "@/components/pricing/PricingTable";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div>
      <SectionWrapper className="pt-14 sm:pt-16">
        <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">MEMBERSHIP</p>
        <h1 className="mt-3 text-3xl text-[#1f1a15] sm:text-4xl md:text-5xl">Membership Pricing</h1>
        <p className="mt-4 max-w-3xl text-[#6f6251]">
          Existing members can log in and subscribe directly. New members begin with a paid consultation and approval before account activation.
        </p>
        <PoliciesPageLinks className="mt-4" />

        <MembershipPolicySummaryBox className="mt-10" />

        <div className="mt-10">
          <PricingTable />
        </div>

        <p className="mt-6 text-sm text-[#6f6251]">
          Full payment and policy details below.{" "}
          <Link href="/payment-policies" className="text-[#8f6f3e] underline underline-offset-2">
            View standalone policy page
          </Link>
        </p>
      </SectionWrapper>

      <SectionWrapper>
        <KianPrivePaymentPolicies showMembershipSummary={false} />
      </SectionWrapper>
    </div>
  );
}
