import Link from "next/link";
import {
  acceptedPaymentMethods,
  financingAndInsurancePolicies,
  gratuityPolicy,
  medicalDisclaimerParagraphs,
  membershipPolicySummary,
  policiesFooterNote,
} from "@/lib/policies/kian-prive-policies";

type KianPrivePaymentPoliciesProps = {
  showMembershipSummary?: boolean;
  showFooterNote?: boolean;
  className?: string;
};

export function MembershipPolicySummaryBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-[#b78d4b45] bg-[#fff7eb] p-6 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)] ${className}`}
    >
      <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">MEMBERSHIP POLICY SUMMARY</p>
      <ul className="mt-4 space-y-2.5">
        {membershipPolicySummary.map((rule) => (
          <li key={rule} className="flex gap-2 text-sm leading-relaxed text-[#4f4335]">
            <span className="shrink-0 text-[#b78d4b]" aria-hidden>
              ✦
            </span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KianPrivePaymentPolicies({
  showMembershipSummary = true,
  showFooterNote = true,
  className = "",
}: KianPrivePaymentPoliciesProps) {
  return (
    <div className={className}>
      {showMembershipSummary ? (
        <MembershipPolicySummaryBox className="mb-8" />
      ) : null}

      <div className="rounded-3xl border border-[#b78d4b2d] bg-white p-6 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] sm:p-8">
        <p className="text-xs tracking-[0.22em] text-[#8f6f3e]">KIAN PRIVÉ</p>
        <h2 className="mt-2 text-2xl text-[#1f1a15] sm:text-3xl">Payment & Policies</h2>

        {!showMembershipSummary ? (
          <>
            <h3 className="mt-8 text-lg text-[#2b2218]">Membership Policy Summary</h3>
            <ul className="mt-3 space-y-2">
              {membershipPolicySummary.map((rule) => (
                <li key={rule} className="flex gap-2 text-sm text-[#5f5344]">
                  <span className="shrink-0 text-[#b78d4b]" aria-hidden>
                    ✦
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <h3 className="mt-8 text-lg text-[#2b2218]">Gratuity</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#5f5344]">{gratuityPolicy}</p>

        <h3 className="mt-8 text-lg text-[#2b2218]">Financing & Insurance</h3>
        <ul className="mt-3 space-y-2">
          {financingAndInsurancePolicies.map((item) => (
            <li key={item} className="text-sm leading-relaxed text-[#5f5344]">
              {item}
            </li>
          ))}
        </ul>

        <h3 className="mt-8 text-lg text-[#2b2218]">Accepted Forms of Payment</h3>
        <ul className="mt-3 space-y-2">
          {acceptedPaymentMethods.map((item) => (
            <li key={item} className="text-sm leading-relaxed text-[#5f5344]">
              {item}
            </li>
          ))}
        </ul>

        <h3 className="mt-8 text-lg text-[#2b2218]">Medical Disclaimer</h3>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#5f5344]">
          {medicalDisclaimerParagraphs.map((para, index) => (
            <p key={para} className={index === 0 ? "font-medium text-[#2b2218]" : undefined}>
              {para}
            </p>
          ))}
        </div>

        {showFooterNote ? (
          <>
            <p className="mt-8 text-sm font-medium text-[#2b2218]">{policiesFooterNote.tagline}</p>
            <p className="mt-2 text-sm text-[#6f6251]">{policiesFooterNote.legal}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function PoliciesPageLinks({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm text-[#6f6251] ${className}`}>
      Looking for retreat and event terms?{" "}
      <Link href="/terms-and-conditions" className="text-[#8f6f3e] underline underline-offset-2">
        KIAN Retreats & Events policies
      </Link>
    </p>
  );
}
