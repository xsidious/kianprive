import { EditorialEyebrow, EditorialSection } from "@/components/ui/editorial-primitives";
import { IcooneIntakeForm } from "@/components/intake/IcooneIntakeForm";

export const metadata = {
  title: "Icoone Lymphatic Drainage Intake | KIAN Privé",
  description: "Complete the Icoone lymphatic drainage intake before your appointment at KIAN Privé.",
};

export default function IcooneIntakePage() {
  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <EditorialEyebrow>SECURE INTAKE</EditorialEyebrow>
        <h1 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Icoone Lymphatic Drainage</h1>
        <p className="mt-3 max-w-3xl text-[#6f6251]">
          Please complete this intake form prior to your appointment. Height, weight, and the treatment protocol are filled in by the clinician at the visit.
        </p>
        <div className="mt-8">
          <IcooneIntakeForm />
        </div>
      </EditorialSection>
    </div>
  );
}
