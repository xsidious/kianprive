import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { PeptidesGlpIntakeForm } from "@/components/intake/PeptidesGlpIntakeForm";

export const metadata = {
  title: "Peptide & GLP Intake | KIAN Privé",
  description:
    "Secure HIPAA-aware comprehensive therapeutics intake for peptide therapy and GLP receptor agonist programs at KIAN Privé.",
};

export default function PeptidesGlpIntakePage() {
  return (
    <div>
      <SectionWrapper className="pt-14 sm:pt-16">
        <PeptidesGlpIntakeForm />
      </SectionWrapper>
    </div>
  );
}
