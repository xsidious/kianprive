import { EditorialEyebrow, EditorialSection } from "@/components/ui/editorial-primitives";
import { CelexoIntakeForm } from "@/components/intake/CelexoIntakeForm";

export const metadata = {
  title: "Korean Exosome Therapy Intake | KIAN Privé",
  description:
    "Secure Celexo / Korean Exosome Therapy intake for plant-based and Black Label adipose exosome protocols at KIAN Privé.",
};

export default function CelexoIntakePage() {
  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <EditorialEyebrow>SECURE INTAKE</EditorialEyebrow>
        <h1 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Korean Exosome Therapy</h1>
        <p className="mt-2 text-sm tracking-[0.16em] text-[#8f6f3e]">CELEXO · ABIO MATERIALS KOREA</p>
        <p className="mt-3 max-w-3xl text-[#6f6251]">
          Complete this confidential intake before your Celexo appointment. Your responses help our team select the
          right protocol (plant-based Centella Exo-Cica or Black Label adipose-derived), delivery method, and aftercare
          plan.
        </p>
        <div className="mt-8">
          <CelexoIntakeForm />
        </div>
      </EditorialSection>
    </div>
  );
}
