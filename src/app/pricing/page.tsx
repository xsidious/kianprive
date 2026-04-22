import { PricingTable } from "@/components/pricing/PricingTable";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export default function PricingPage() {
  return (
    <SectionWrapper>
      <h1 className="text-5xl">Membership Pricing</h1>
      <p className="mt-4 max-w-3xl text-[#e9deca]">
        Choose your level of access. Premium includes full Icoone Training and all gated practitioner content.
      </p>
      <div className="mt-10">
        <PricingTable />
      </div>
    </SectionWrapper>
  );
}
