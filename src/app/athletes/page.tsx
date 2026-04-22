import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Image from "next/image";
import Link from "next/link";

export default function AthletesPage() {
  return (
    <div>
      <SectionWrapper className="pt-18">
        <div className="grid items-center gap-10 rounded-3xl border border-[#b78d4b2e] bg-white p-8 shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)] lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">ATHLETES (LOCKED)</p>
            <h1 className="mt-4 text-4xl text-[#1f1a15] md:text-5xl">Elite Athlete Performance & Recovery Portal</h1>
            <p className="mt-5 text-[#6f6251]">
              This members-only page provides athlete-specific protocols, recovery frameworks, and performance support resources.
            </p>
            <div className="mt-7 flex gap-3">
              <Link href="/book-online" className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
                Book Athlete Session
              </Link>
            </div>
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-3xl border border-[#b78d4b36]">
            <Image src="/images/stock/service-wellness.jpg" alt="Athlete wellness and recovery" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
