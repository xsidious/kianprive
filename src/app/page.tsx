import Link from "next/link";
import { BeforeAfterGallery } from "@/components/home/BeforeAfterGallery";
import { GetUpdatesSection } from "@/components/home/GetUpdatesSection";
import { CinematicHero } from "@/components/ui/CinematicHero";
import { pageHeroes } from "@/lib/media/heroes";
import { EditorialEyebrow, EditorialSection } from "@/components/ui/editorial-primitives";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { TrustBadges } from "@/components/layout/TrustBadges";
import { serviceHighlights, whyClientsChooseUs } from "@/lib/site-content";
import type { Metadata } from "next";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildSeoMetadata({
  title: "Concierge Wellness in Miami",
  description:
    "Luxury concierge wellness in Miami and North Miami Beach — clinical aesthetics, Icoone, peptides, IV therapy, and physician-led care at our suite or yours.",
  canonicalPath: "/",
  image: "/images/og-default.jpg",
});

export default function Home() {
  return (
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="CONCIERGE WELLNESS"
        lineOne="Luxury wellness."
        lineTwo="Uncompromising care."
        lineThree="Exclusively yours."
        description="Delivering uninterrupted, personalized care at your location or ours. No busy waiting rooms. No rush. Just elite professionals, precision protocols, and luxury-level results."
        primaryCta={{ label: "Book Consultation", href: "/book-online" }}
        secondaryCta={{ label: "Explore Services", href: "/services" }}
        imageSrc={pageHeroes.home.src}
        imageAlt={pageHeroes.home.alt}
        priority
      />

      <TrustBadges />

      <EditorialSection>
        <div className="animate-fade-up">
          <EditorialEyebrow>SIGNATURE SERVICES</EditorialEyebrow>
          <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">A modern, integrated service stack</h2>
          <p className="mt-3 max-w-2xl text-[#6f6251]">Designed for visible outcomes and long-term wellness.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {serviceHighlights.map((service) => (
              <ServiceCard
                key={service.title}
                title={service.title}
                description={service.description}
                image={service.image}
                href={service.href}
                ctaLabel={service.href?.includes("glp1-peptides") ? "Learn More" : "Book Now"}
              />
            ))}
          </div>
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>RESULTS</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Before &amp; After</h2>
        <p className="mt-3 mb-6 max-w-3xl text-[#6f6251]">
          Client results by category — body contouring, facial renewal, and hair wellness.
        </p>
        <BeforeAfterGallery />
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>WHY KIAN PRIVÉ</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Why clients choose us</h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {whyClientsChooseUs.map((reason) => (
            <li key={reason} className="rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-4 text-sm text-[#4f4335]">
              <span className="mr-2 text-[#b78d4b]" aria-hidden>
                ✦
              </span>
              {reason}
            </li>
          ))}
        </ul>
      </EditorialSection>

      <EditorialSection>
        <GetUpdatesSection />
      </EditorialSection>

      <EditorialSection dark>
        <p className="text-xs tracking-[0.24em] text-[#c9a86a]">READY TO START</p>
        <h2 className="mt-3 font-serif text-2xl text-[#f7f1e8] sm:text-3xl md:text-5xl">Build Your Private Wellness Advantage</h2>
        <p className="mt-4 max-w-3xl text-[#cbbba5]">
          Join KIAN Privé for concierge wellness care and premium practitioner education designed for measurable, long-term results.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact" className="inline-flex min-h-[44px] items-center rounded-sm bg-[#8a682e] px-6 text-[11px] tracking-[0.18em] text-white">
            SCHEDULE CONSULTATION
          </Link>
          <Link href="/book-online" className="inline-flex min-h-[44px] items-center rounded-sm border border-white/80 px-6 text-[11px] tracking-[0.18em] text-white">
            BOOK ONLINE
          </Link>
          <Link href="/pricing" className="inline-flex min-h-[44px] items-center rounded-sm border border-white/80 px-6 text-[11px] tracking-[0.18em] text-white">
            VIEW MEMBERSHIP
          </Link>
        </div>
      </EditorialSection>
    </div>
  );
}
