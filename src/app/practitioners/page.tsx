import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Link from "next/link";
import Image from "next/image";
import { PremiumCard } from "@/components/ui/PremiumCard";

const audience = [
  "Physicians and medical practitioners integrating non-invasive modalities",
  "Med spa owners and practitioners expanding their service offerings",
  "Licensed estheticians seeking advanced certification",
  "Practice managers and operators building or scaling their Icoone® programs",
  "Individual clinicians seeking private, one-on-one instruction tailored to specialty and practice goals",
  "Practitioners already using exosomes, stem cells, GLP-1s, or other advanced modalities who want to maximize existing investments",
];

const integrations = [
  {
    title: "Your Current Machines",
    description: "Integrate Icoone® seamlessly with existing technology to enhance outcomes and maximize device ROI.",
  },
  {
    title: "Exosomes",
    description:
      "Amplify cellular regeneration and recovery by pairing Icoone® deep tissue stimulation with exosome therapy for accelerated results.",
  },
  {
    title: "Stem Cells",
    description:
      "Enhance delivery and effectiveness of stem cell treatments through circulation-boosting and lymphatic drainage protocols.",
  },
  {
    title: "GLP-1 Therapies",
    description:
      "Support and accelerate contouring and skin tightening outcomes for GLP-1 patients with targeted treatment planning.",
  },
];

const programs = [
  "Foundational Certification — Core techniques, device mastery, and treatment protocols",
  "Advanced Clinical Protocols — Body sculpting, post-surgical, rehabilitation, and lymphatic applications",
  "One-on-One Physician & Clinical Training — Private, personalized instruction tailored to specialty, practice, and patient goals",
  "Multi-Modality Integration — Combine Icoone® with machines, exosomes, stem cells, and GLP-1 therapies for maximum results",
  "Med Spa & Practice Operator Training — Staff training, workflow integration, and program development",
  "Facial Treatment Protocols — Specialized techniques for facial rejuvenation and skin tightening",
  "Marketing & Client Development — Present, position, and grow Icoone® services using proven messaging",
];

export default function PractitionersPage() {
  return (
    <div>
      <SectionWrapper className="pt-18">
        <div className="grid items-center gap-10 rounded-3xl border border-[#b78d4b2e] bg-white p-8 shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)] lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">PRACTITIONERS</p>
            <h1 className="mt-4 text-4xl text-[#1f1a15] md:text-5xl">Learn How to Become Profitable with Icoone</h1>
            <p className="mt-2 text-lg text-[#5f5344]">Icoone® Certified Practitioner Training</p>
            <p className="mt-5 text-[#6f6251]">
              Learn from the most experienced Icoone® training program in the United States. Backed by over 8 years of clinical experience,
              nearly 8,000 hands-on treatment hours, and the distinction of being the first certified hands-on Icoone® training program in
              both the U.S. and Italy, we offer expert-led certification for medical and aesthetic professionals.
            </p>
            <p className="mt-4 text-[#6f6251]">
              Whether you&apos;re a physician, nurse practitioner, or licensed esthetician, these programs are designed to take practitioners
              from foundational knowledge to confident, results-driven practice — including exclusive one-on-one physician and clinical
              training for those who want a fully personalized learning experience.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/pricing" className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
                Unlock Premium Access
              </Link>
              <Link href="/icoone-training" className="rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-5 py-2 text-sm text-[#3b3024]">
                Explore Icoone
              </Link>
            </div>
          </div>
          <div className="relative h-[380px] overflow-hidden rounded-3xl border border-[#b78d4b36]">
            <Image src="/images/facial-treatments.jpg" alt="Practitioner training program" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-4 text-3xl text-[#1f1a15] md:text-4xl">Who This Training Is For?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {audience.map((item) => (
            <article key={item} className="rounded-2xl border border-[#b78d4b2d] bg-white p-5 text-[#4f4335] shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
              {item}
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-4 text-3xl text-[#1f1a15] md:text-4xl">What Sets Our Training Apart?</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-6 text-[#5f5344] shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
            <h3 className="text-xl text-[#2b2218]">First and Most Experienced Certified Icoone® Program in the U.S.</h3>
            <p className="mt-3">
              This is not a manufacturer tutorial or a one-day overview. The curriculum is built on nearly 8,000 hours of real-world
              clinical practice and refined through hands-on programs delivered across MedSpas, Medical Practices, and Aesthetic Centers in
              the United States and Italy.
            </p>
          </article>
          <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-6 text-[#5f5344] shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
            <h3 className="text-xl text-[#2b2218]">One-on-One Physician & Clinical Training</h3>
            <p className="mt-3">
              Private one-on-one training is available for practitioners who want focused instruction. Sessions are tailored to clinical
              background, treatment goals, and patient population — the highest level of personalized Icoone® education.
            </p>
          </article>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-4 text-3xl text-[#1f1a15] md:text-4xl">Maximize What You Already Have</h2>
        <p className="mb-6 max-w-4xl text-[#6f6251]">
          Our training teaches practitioners how to strategically incorporate Icoone® alongside existing equipment and advanced treatments to
          create results-driven protocols that significantly increase revenue per patient.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((item) => (
            <PremiumCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="grid items-center gap-8 rounded-3xl border border-[#b78d4b2d] bg-white p-8 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)] lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-3xl text-[#1f1a15] md:text-4xl">Learn How to Market Icoone® Not Just Perform It</h2>
            <p className="mt-4 text-[#5f5344]">
              Our program draws on the experience of one of the longest-practicing Icoone® teams in the U.S. Practitioners learn proven
              strategies for marketing services, communicating treatment value, and showcasing visible results that convert consultations into
              loyal, long-term clients.
            </p>
            <p className="mt-4 text-[#5f5344]">
              Hands-On. Protocol-Driven. Results-Focused. Every training is built around practical application, clinical protocols, and
              repeatable techniques that create measurable patient outcomes.
            </p>
          </div>
          <div className="relative h-[300px] overflow-hidden rounded-2xl border border-[#b78d4b2d]">
            <Image src="/images/icoone.avif" alt="Icoone marketing and protocol training" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-4 text-3xl text-[#1f1a15] md:text-4xl">Training Programs Available</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((program) => (
            <article key={program} className="rounded-2xl border border-[#b78d4b2d] bg-white p-5 text-[#4f4335] shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
              {program}
            </article>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
