import Image from "next/image";
import { CinematicHero } from "@/components/ui/CinematicHero";
import {
  EditorialEyebrow,
  EditorialSection,
  EditorialPrimaryLink,
  EditorialSecondaryLink,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

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

function EditorialCard({ title, description }: { title: string; description: string }) {
  return (
    <article className={`${editorialPanel} p-5`}>
      <h3 className="text-xl text-[#2b2218]">{title}</h3>
      <p className="mt-3 text-[#5f5344]">{description}</p>
    </article>
  );
}

export default function PractitionersPage() {
  return (
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="PRACTITIONERS"
        lineOne="Become profitable"
        lineTwo="with Icoone®."
        lineThree="Expert-led training."
        description="Learn from the most experienced Icoone® training program in the United States. Backed by over 8 years of clinical experience, nearly 8,000 hands-on treatment hours, and the distinction of being the first certified hands-on Icoone® training program in both the U.S. and Italy."
        primaryCta={{ label: "Unlock Premium Access", href: "/pricing" }}
        secondaryCta={{ label: "Explore Icoone", href: "/icoone-training" }}
        imageSrc="/images/facial-treatments.webp"
        imageAlt="Practitioner training program"
      />

      <EditorialSection>
        <EditorialEyebrow>WHO IT&apos;S FOR</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Who This Training Is For?</h2>
        <p className="mt-3 max-w-4xl text-[#6f6251]">
          Whether you&apos;re a physician, nurse practitioner, or licensed esthetician, these programs are designed to take practitioners
          from foundational knowledge to confident, results-driven practice — including exclusive one-on-one physician and clinical
          training for those who want a fully personalized learning experience.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {audience.map((item) => (
            <article key={item} className={`${editorialPanel} p-5 text-[#4f4335]`}>
              {item}
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>WHY US</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">What Sets Our Training Apart?</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <article className={`${editorialPanel} p-6 text-[#5f5344]`}>
            <h3 className="text-xl text-[#2b2218]">First and Most Experienced Certified Icoone® Program in the U.S.</h3>
            <p className="mt-3">
              This is not a manufacturer tutorial or a one-day overview. The curriculum is built on nearly 8,000 hours of real-world
              clinical practice and refined through hands-on programs delivered across MedSpas, Medical Practices, and Aesthetic Centers in
              the United States and Italy.
            </p>
          </article>
          <article className={`${editorialPanel} p-6 text-[#5f5344]`}>
            <h3 className="text-xl text-[#2b2218]">One-on-One Physician & Clinical Training</h3>
            <p className="mt-3">
              Private one-on-one training is available for practitioners who want focused instruction. Sessions are tailored to clinical
              background, treatment goals, and patient population — the highest level of personalized Icoone® education.
            </p>
          </article>
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>INTEGRATION</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Maximize What You Already Have</h2>
        <p className="mt-3 mb-6 max-w-4xl text-[#6f6251]">
          Our training teaches practitioners how to strategically incorporate Icoone® alongside existing equipment and advanced treatments to
          create results-driven protocols that significantly increase revenue per patient.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((item) => (
            <EditorialCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </EditorialSection>

      <EditorialSection>
        <div className={`grid items-center gap-8 ${editorialPanel} p-8 lg:grid-cols-[1.1fr_0.9fr]`}>
          <div>
            <EditorialEyebrow>MARKETING</EditorialEyebrow>
            <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Learn How to Market Icoone® Not Just Perform It</h2>
            <p className="mt-4 text-[#5f5344]">
              Our program draws on the experience of one of the longest-practicing Icoone® teams in the U.S. Practitioners learn proven
              strategies for marketing services, communicating treatment value, and showcasing visible results that convert consultations into
              loyal, long-term clients.
            </p>
            <p className="mt-4 text-[#5f5344]">
              Hands-On. Protocol-Driven. Results-Focused. Every training is built around practical application, clinical protocols, and
              repeatable techniques that create measurable patient outcomes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <EditorialPrimaryLink href="/pricing">Unlock Premium Access</EditorialPrimaryLink>
              <EditorialSecondaryLink href="/icoone-training">Explore Icoone</EditorialSecondaryLink>
            </div>
          </div>
          <div className="relative h-[300px] overflow-hidden rounded-sm border border-[#e4d9c8]">
            <Image src="/images/icoone-treatment-session.webp" alt="Icoone lymphatic drainage treatment" fill className="object-cover" />
          </div>
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>PROGRAMS</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Training Programs Available</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {programs.map((program) => (
            <article key={program} className={`${editorialPanel} p-5 text-[#4f4335]`}>
              {program}
            </article>
          ))}
        </div>
      </EditorialSection>
    </div>
  );
}
