import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { homepageStats, practitionerTeam, serviceHighlights } from "@/lib/site-content";
import { getCmsPageContent } from "@/lib/cms/pages";

const pathwaySteps = [
  "Assess your current lifestyle and identify gaps.",
  "Set personalized wellness and performance goals.",
  "Implement clinical and holistic protocol changes.",
  "Monitor progress and optimize monthly.",
  "Celebrate wins and scale your results.",
];

const coreValues = [
  { title: "Commitment", description: "Dedication to your long-term transformation with accountability at every stage." },
  { title: "Clarity", description: "Science-backed guidance that makes decisions simple and actionable." },
  { title: "Consistency", description: "Daily habits and structured routines that produce sustainable results." },
  { title: "Change", description: "Progressive support for the evolution of body, mind, and lifestyle." },
];

const icooneBenefits = [
  "Lymphatic drainage and detox support",
  "Inflammation reduction and pain management",
  "Athletic recovery and mobility improvement",
  "Skin tightening and body contouring",
];

const programTracks = [
  "Foundational Certification",
  "Advanced Clinical Protocols",
  "One-on-One Physician & Clinical Training",
  "Multi-Modality Integration (GLP-1, Exosomes, Stem Cells)",
  "Marketing & Client Development",
];

const testimonials = [
  {
    quote:
      "My energy, skin, and recovery all improved within weeks. The KIAN team built a plan that finally felt personal and sustainable.",
    name: "Sophia M.",
    title: "Concierge Wellness Client",
  },
  {
    quote:
      "The protocols are premium but practical. I now have clear monthly targets and measurable progress without the usual clinic friction.",
    name: "Daniel R.",
    title: "Performance Member",
  },
  {
    quote:
      "This is the first place where medical insight and aesthetics were coordinated as one strategy. Results have been consistent and visible.",
    name: "Alyssa T.",
    title: "Aesthetics Client",
  },
];

const beforeAfterShowcase = [
  {
    treatment: "Lymphatic + Contouring Protocol",
    beforeImage: "/images/wellness.avif",
    afterImage: "/images/icoone.avif",
  },
  {
    treatment: "Skin Renewal Program",
    beforeImage: "/images/esthetics.avif",
    afterImage: "/images/facial-treatments.jpg",
  },
];

export default function Home() {
  const cmsPromise = getCmsPageContent("home");
  return (
    <div>
      <SectionWrapper className="pt-14 sm:pt-16 md:pt-20">
        <FadeIn>
          <div className="mt-3 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <HomeHeading cmsPromise={cmsPromise} />
              <p className="mt-6 max-w-2xl text-base text-[#5f5344] sm:text-lg">
                Delivering uninterrupted, personalized care at your location or ours. No busy
                waiting rooms. No rush. Just elite professionals, precision protocols, and luxury-level results.
              </p>
              <p className="mt-4 max-w-2xl text-[#6f6251]">
                We unify physicians, nurses, licensed aestheticians, nutrition specialists, and wellness experts to elevate every dimension
                of your well-being.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="rounded-full bg-[#b78d4b] px-6 py-3 text-white shadow-sm">
                  Book Concierge Consultation
                </Link>
                <Link href="/pricing" className="rounded-full border border-[#b78d4b80] bg-white px-6 py-3 text-[#3b3024]">
                  Unlock Premium Access
                </Link>
                <Link href="/icoone-training" className="rounded-full border border-[#b78d4b80] bg-white px-6 py-3 text-[#3b3024]">
                  Explore Icoone Training
                </Link>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {homepageStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[#b78d4b3a] bg-white p-4 shadow-[0_10px_30px_-24px_rgba(71,45,10,0.45)]">
                    <p className="text-2xl text-[#2b2218]">{stat.value}</p>
                    <p className="text-sm text-[#6f6251]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[380px] overflow-hidden rounded-[2rem] border border-[#b78d4b38] shadow-[0_30px_70px_-40px_rgba(92,65,20,0.45)] sm:h-[480px] lg:h-[560px]">
              <Image src="/images/facial-treatments.jpg" alt="Facial treatment luxury care" fill className="object-cover object-center" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#f8f4eecc] via-transparent to-[#fffdf9a8]" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#f8f4ee8f]" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-[#b78d4b45] bg-[#fffaf2e8] p-4 backdrop-blur-sm">
                <p className="text-xs tracking-[0.18em] text-[#8f6f3e]">PRIVATE CARE</p>
                <p className="mt-1 text-sm text-[#3b3024]">In-home and on-location service available.</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </SectionWrapper>

      <SectionWrapper>
        <div className="grid gap-8 rounded-3xl border border-[#b78d4b30] bg-white p-8 shadow-[0_18px_45px_-35px_rgba(72,49,14,0.45)] md:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.22em] text-[#8f6f3e]">HIGH-CONVERTING CLARITY</p>
            <h2 className="mt-3 text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Why Clients Choose This Experience</h2>
            <p className="mt-4 text-[#6f6251]">
              We blend modern medicine, advanced aesthetics, regenerative therapies, and luxury wellness into a single personalized system.
              Every protocol is customized around your goals, lifestyle, and biology.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/services" className="rounded-full border border-[#b78d4b69] bg-[#fffaf2] px-5 py-2 text-sm text-[#3b3024]">
                View Services
              </Link>
            </div>
          </div>
          <div className="grid gap-3">
            {coreValues.map((value) => (
              <article key={value.title} className="rounded-2xl border border-[#b78d4b33] bg-[#fffaf2] p-4">
                <p className="text-lg text-[#2b2218]">{value.title}</p>
                <p className="text-sm text-[#6f6251]">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Signature Services</h2>
        <p className="mb-6 max-w-2xl text-[#6f6251]">A modern, integrated service stack designed for visible outcomes and long-term wellness.</p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {serviceHighlights.map((service) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              image={service.image}
              href={service.href}
            />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Client Testimonials</h2>
        <p className="mb-6 max-w-3xl text-[#6f6251]">Real feedback from clients following personalized concierge protocols.</p>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-2xl border border-[#b78d4b2d] bg-white p-5 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
              <p className="text-[#4f4335]">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-4 text-[#2b2218]">{item.name}</p>
              <p className="text-sm text-[#8f6f3e]">{item.title}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Before & After</h2>
        <p className="mb-6 max-w-3xl text-[#6f6251]">Examples of visible transformation from structured KIAN treatment plans.</p>
        <div className="grid gap-5 lg:grid-cols-2">
          {beforeAfterShowcase.map((item) => (
            <article key={item.treatment} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
              <p className="mb-3 text-lg text-[#2b2218]">{item.treatment}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs tracking-[0.18em] text-[#8f6f3e]">BEFORE</p>
                  <div className="relative h-48 overflow-hidden rounded-xl border border-[#b78d4b2d]">
                    <Image src={item.beforeImage} alt={`${item.treatment} before`} fill className="object-cover" />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs tracking-[0.18em] text-[#8f6f3e]">AFTER</p>
                  <div className="relative h-48 overflow-hidden rounded-xl border border-[#b78d4b2d]">
                    <Image src={item.afterImage} alt={`${item.treatment} after`} fill className="object-cover" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="grid items-center gap-8 rounded-3xl border border-[#b78d4b30] bg-white p-8 shadow-[0_18px_45px_-35px_rgba(72,49,14,0.45)] lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs tracking-[0.22em] text-[#8f6f3e]">ICOONE CERTIFIED TRAINING</p>
            <h2 className="mt-3 text-2xl text-[#1f1a15] sm:text-3xl md:text-5xl">Learn How to Become Profitable with Icoone</h2>
            <p className="mt-4 text-[#6f6251]">
              Learn from one of the most experienced Icoone training teams in the United States, backed by 8+ years of clinical experience
              and nearly 8,000 hands-on treatment hours.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {icooneBenefits.map((benefit) => (
                <p key={benefit} className="rounded-xl border border-[#b78d4b33] bg-[#fffaf2] px-4 py-3 text-sm text-[#4f4335]">
                  {benefit}
                </p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/icoone-training" className="rounded-full bg-[#b78d4b] px-6 py-3 text-white">
                Apply for Training
              </Link>
              <Link href="/pricing" className="rounded-full border border-[#b78d4b80] bg-[#fffaf2] px-6 py-3 text-[#3b3024]">
                Unlock Premium Training
              </Link>
            </div>
            <p className="mt-3 text-xs text-[#8a7a66]">Premium access required for full practitioner training content.</p>
          </div>
          <div className="relative h-[320px] overflow-hidden rounded-3xl border border-[#b78d4b35] sm:h-[420px] lg:h-[500px]">
            <Image src="/images/icoone.avif" alt="Icoone practitioner training" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Icoone Programs That Convert Knowledge Into Revenue</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {programTracks.map((program) => (
            <article key={program} className="rounded-2xl border border-[#b78d4b33] bg-white p-5 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
              <p className="text-lg text-[#2b2218]">{program}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="grid gap-8 rounded-3xl border border-[#b78d4b30] bg-white p-6 sm:p-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl text-[#1f1a15] md:text-4xl">The Lifestyle Framework</h2>
            <p className="mt-4 text-[#6f6251]">
              Lasting transformation goes beyond diet and exercise. We combine education-first care, natural solutions, and clinical
              precision to create sustainable progress.
            </p>
          </div>
          <ol className="space-y-3">
            {pathwaySteps.map((step, idx) => (
              <li key={step} className="rounded-xl border border-[#b78d4b30] bg-[#fffaf2] p-4 text-sm text-[#4f4335]">
                <span className="mr-2 text-[#8f6f3e]">0{idx + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-6 text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Meet The Team</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {practitionerTeam.map((member) => (
            <article key={member.name} className="rounded-2xl border border-[#b78d4b2e] bg-white p-4 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
              <div className="relative h-56 overflow-hidden rounded-xl">
                <Image src={member.image} alt={member.name} fill className="object-cover" />
              </div>
              <p className="mt-4 text-lg text-[#2b2218]">{member.name}</p>
              <p className="text-sm text-[#6f6251]">{member.role}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="rounded-3xl border border-[#b78d4b4f] bg-gradient-to-b from-[#fff8ed] to-[#f1e7d7] p-9 text-center shadow-[0_18px_40px_-30px_rgba(66,45,14,0.45)]">
          <p className="text-xs tracking-[0.24em] text-[#8f6f3e]">READY TO START</p>
          <h2 className="mt-3 text-2xl text-[#1f1a15] sm:text-3xl md:text-5xl">Build Your Private Wellness Advantage</h2>
          <p className="mx-auto mt-4 max-w-3xl text-[#5f5344]">
            Join KIAN Privé for concierge wellness care and premium practitioner education designed for measurable, long-term results.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="rounded-full bg-[#b78d4b] px-6 py-3 text-white">
              Schedule Consultation
            </Link>
            <Link href="/book-online" className="rounded-full border border-[#b78d4b80] bg-white px-6 py-3 text-[#3b3024]">
              Book Online
            </Link>
            <Link href="/pricing" className="rounded-full border border-[#b78d4b80] bg-white px-6 py-3 text-[#3b3024]">
              View Membership Plans
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}

async function HomeHeading({
  cmsPromise,
}: {
  cmsPromise: ReturnType<typeof getCmsPageContent>;
}) {
  const content = await cmsPromise;
  return (
    <>
      <p className="inline-flex rounded-full border border-[#b78d4b47] bg-white/80 px-4 py-1 text-xs tracking-[0.2em] text-[#8f6f3e]">
        {content.eyebrow ?? "CONCIERGE WELLNESS"}
      </p>
      <h1 className="mt-5 max-w-3xl text-3xl leading-[1.2] text-[#1f1a15] sm:text-4xl md:text-5xl">{content.title}</h1>
    </>
  );
}
