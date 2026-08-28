import { EditorialEyebrow, EditorialSection } from "@/components/ui/editorial-primitives";
import { PeptidesGlpIntakeForm } from "@/components/intake/PeptidesGlpIntakeForm";
import { auth } from "@/lib/auth";
import { canViewServicePrices } from "@/lib/member-pricing-access";
import { INTAKE_REVIEW_FEE_USD } from "@/lib/intake/review-fee";

export const metadata = {
  title: "Peptide & GLP Intake | KIAN Privé",
  description:
    "Secure HIPAA-aware comprehensive therapeutics intake for peptide therapy and GLP receptor agonist programs at KIAN Privé.",
};

export default async function PeptidesGlpIntakePage() {
  const session = await auth();
  const canViewPrices = canViewServicePrices(session?.user);

  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <EditorialEyebrow>SECURE INTAKE</EditorialEyebrow>
        <h1 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Peptide &amp; GLP Intake</h1>
        <p className="mt-3 max-w-3xl text-[#6f6251]">
          {canViewPrices
            ? `Complete this HIPAA-aware therapeutics intake so our physician team can review eligibility and next steps. A $${INTAKE_REVIEW_FEE_USD} medical review fee is collected before the form is sent to the doctor.`
            : "Complete this HIPAA-aware therapeutics intake so our physician team can review eligibility and next steps. Pricing unlocks after membership approval — sign in to view the medical review fee before submission."}
        </p>
        <div className="mt-8">
          <PeptidesGlpIntakeForm />
        </div>
      </EditorialSection>
    </div>
  );
}
