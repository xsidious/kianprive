import Link from "next/link";
import Image from "next/image";
import { BeforeAfterGallery } from "@/components/home/BeforeAfterGallery";
import { GetUpdatesSection } from "@/components/home/GetUpdatesSection";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { TrustBadges } from "@/components/layout/TrustBadges";
import { homepageStats, serviceHighlights, whyClientsChooseUs } from "@/lib/site-content";
import { getCmsPageContent } from "@/lib/cms/pages";

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
                <Link href="/book-online" className="rounded-full bg-[#b78d4b] px-6 py-3 text-white shadow-sm">
                  Book Concierge Consultation
                </Link>
                <Link href="/pricing" className="rounded-full border border-[#b78d4b80] bg-white px-6 py-3 text-[#3b3024]">
                  Unlock Premium Access
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

      <TrustBadges />

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
        <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Before & After</h2>
        <p className="mb-6 max-w-3xl text-[#6f6251]">
          Transformation examples organized by category. Final creatives can be produced in Canva for Body, Face, and Hair.
        </p>
        <BeforeAfterGallery />
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Why Clients Choose Us</h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {whyClientsChooseUs.map((reason) => (
            <li key={reason} className="rounded-xl border border-[#b78d4b30] bg-[#fffaf2] p-4 text-sm text-[#4f4335]">
              {reason}
            </li>
          ))}
        </ul>
      </SectionWrapper>

      <SectionWrapper>
        <GetUpdatesSection />
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

