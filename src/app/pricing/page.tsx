import type { Metadata } from "next";
import Link from "next/link";
import {
  KianPrivePaymentPolicies,
  MembershipPolicySummaryBox,
  PoliciesPageLinks,
} from "@/components/policies/KianPrivePaymentPolicies";
import { PricingTable } from "@/components/pricing/PricingTable";
import { CinematicHero } from "@/components/ui/CinematicHero";
import { pageHeroes } from "@/lib/media/heroes";
import { EditorialEyebrow, EditorialSection } from "@/components/ui/editorial-primitives";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildSeoMetadata({
  title: "Membership Pricing",
  description:
    "KIAN Privé membership plans — priority access to concierge wellness, aesthetics, and physician-led care in Miami.",
  canonicalPath: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="MEMBERSHIP"
        lineOne="Membership."
        lineTwo="Priority access."
        lineThree="Elevated care."
        description="Existing members can log in and subscribe directly. New members begin with a paid consultation and approval before account activation."
        primaryCta={{ label: "View Plans", href: "#plans" }}
        secondaryCta={{ label: "Book Consultation", href: "/book-online" }}
        imageSrc={pageHeroes.pricing.src}
        imageAlt={pageHeroes.pricing.alt}
        priority={false}
      />

      <EditorialSection id="plans">
        <EditorialEyebrow>PLANS</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Membership Pricing</h2>
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
      </EditorialSection>

      <EditorialSection>
        <KianPrivePaymentPolicies showMembershipSummary={false} />
      </EditorialSection>
    </div>
  );
}
