import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCmsPageContent } from "@/lib/cms/pages";
import { CinematicHero } from "@/components/ui/CinematicHero";
import { ServiceCardsWithModal } from "@/components/services/ServiceCardsWithModal";
import {
  EditorialEyebrow,
  EditorialSection,
  ServiceMenuTable,
  ProtocolCard,
  WellnessInfoCard,
  PeptideCategoryCard,
  TakeHomeCard,
  EditorialCtaLink,
} from "@/components/services/editorial";
import {
  brandIntro,
  featuredProviderLogos,
  partnerAddOnServices,
  serviceAccessNotes,
} from "@/lib/services/groups";
import {
  acceptedPaymentMethods,
  financingAndInsurancePolicies,
  gratuityPolicy,
  medicalDisclaimerParagraphs,
  membershipPolicySummary,
} from "@/lib/policies/kian-prive-policies";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCmsPageContent("services");
  return buildSeoMetadata({
    title: cms.seoTitle || "Services Menu",
    description:
      cms.seoDescription ||
      "Explore KIAN Privé services in Miami — Icoone, peptides, IV therapy, medical aesthetics, blood work, hair restoration, and concierge care.",
    canonicalPath: cms.canonicalUrl?.startsWith("/") ? cms.canonicalUrl : "/services",
    image: cms.seoImage || "/images/og-default.jpg",
    noIndex: Boolean(cms.noIndex),
  });
}

const icooneAlaCarte = [
  "Single Session — 40 minutes",
  "5-Session Package — 40 min",
  "10-Session Package — 40 min",
  "Single Session — 50 minutes",
  "5-Session Package — 50 min",
  "10-Session Package — 50 min",
];

const icooneMonthly50 = [
  "2 × 50-min Treatments / month",
  "4 × 50-min Treatments / month",
  "10 × 50-min Customized",
  "10 × 40-min — Lymphatic Drainage",
];

const icooneMonthly80 = [
  "2 × 80-min Treatments / month",
  "4 × 80-min treatments / month",
  "Single Session — 80 minutes",
  "5-Session Package — 80 min",
  "10-Session Package — 80 min",
];

const aftercareColumns = [
  {
    label: "AFTERCARE · IMMEDIATE",
    text: "A profound sense of lightness. Increased elimination, gentle warmth, deep relaxation.",
  },
  {
    label: "AFTERCARE · SHORT-TERM",
    text: "Visible reduction in puffiness, swelling and water retention. Skin appears toned and radiant.",
  },
  {
    label: "AFTERCARE · CUMULATIVE",
    text: "Measurable contour reduction, firmer skin, lasting improvements in detox and recovery.",
  },
];

const essentialProtocol = [
  "2 Icoone® Laser sessions",
  "1 Holistic Salt Therapy session",
  "1 PEMF Therapy Bed session",
  "1 Red Light Therapy session",
  "Ionic Foot Bath",
  "InBody Scan — recovery tracking",
];

const advancedProtocol = [
  "4 Icoone® Laser sessions",
  "1 Holistic Salt Therapy session",
  "2 PEMF Therapy Bed sessions",
  "Ionic Foot Bath",
  "InBody Scan + Power Plate",
  "Telemedicine access",
];

const koreanFacialMenu = ["Single Session Facial", "4-Session Facial Package"];

const microneedlingMenu = [
  "Single Session",
  "4-Session Package",
  "5-Session Package",
  "10-Session Package",
];

const takeHomeProducts = [
  {
    title: "Post-Procedure Serums",
    description:
      "Growth-factor and peptide formulations that support healing, collagen production and skin renewal after microneedling and regenerative treatments.",
  },
  {
    title: "Barrier-Repair Creams",
    description:
      "Ceramide, lipid and hyaluronic acid formulas that restore barrier integrity, lock in hydration and protect sensitive post-treatment skin.",
  },
  {
    title: "Exosome Recovery Sprays",
    description:
      "Concentrated signaling molecules designed to accelerate repair, calm inflammation and extend regenerative results between visits.",
  },
  {
    title: "Mineral SPF & Photoprotection",
    description:
      "Medical-grade zinc and titanium dioxide protection that shields treated skin from UV and environmental stressors.",
  },
  {
    title: "Calming & Hydrating Masks",
    description:
      "Soothing botanical and hyaluronic sheet and cream masks for immediate relief, deep hydration and visible plumping.",
  },
  {
    title: "Wellness Supplements",
    description:
      "Physician-selected nutraceuticals supporting collagen synthesis, cellular detoxification, mitochondrial energy and gut-skin axis health.",
  },
  {
    title: "Exosome & Skincare",
    description:
      "Targeted exosome and peptide creams and eye serums that continue the work of injectable protocols at the surface level.",
  },
  {
    title: "Scalp & Hair Care",
    description:
      "Exosome-enriched scalp serums and follicle-stimulating formulations that extend hair restoration results between sessions.",
  },
];

const peptideCategories = [
  {
    title: "Longevity & Repair",
    description: "Cellular regeneration, mitochondrial support, tissue repair and systemic anti-aging protocols.",
  },
  {
    title: "Metabolic & Body Composition",
    description: "GLP-1 class therapies, lean-mass preservation, appetite regulation and metabolic optimization.",
  },
  {
    title: "Recovery & Performance",
    description: "Injury recovery, joint and tendon support, sleep quality, cognition and energy.",
  },
  {
    title: "Aesthetic & Skin",
    description: "Collagen synthesis, pigment regulation, hair restoration and dermal renewal.",
  },
  {
    title: "Immune & Hormonal",
    description: "Immune modulation, thymic support and hormonal balance for women and men.",
  },
  {
    title: "Sexual Wellness",
    description: "Libido, performance and intimacy protocols for women and men.",
  },
];

const paymentMethodsClean = acceptedPaymentMethods.map((item) =>
  item
    .replace(/\s*—\s*a 3% processing fee applies\./gi, ".")
    .replace(/\s*—\s*a 3% processing fee applies/gi, "")
    .replace(/\s*with no additional fee\./gi, ".")
    .trim(),
);

export default async function ServicesPage() {
  const cms = await getCmsPageContent("services");

  return (
    <div className="-mt-[1px]">
      <CinematicHero
        description={cms.description ?? brandIntro.lead}
        primaryCta={{ label: "View the Menu", href: "#all-services" }}
        secondaryCta={{ label: "Reserve a Session", href: "/book-online" }}
        imageSrc="/images/facial-treatments.webp"
        imageAlt="KIAN Privé luxury wellness treatment suite"
        priority={false}
      />

      <EditorialSection id="all-services">
        <EditorialEyebrow>ICOONE® LASER</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#1f1a15] sm:text-4xl md:text-[2.75rem]">
          Lymphatic drainage &amp; body wellness.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#6f6251] sm:text-base">
          Physician-guided Icoone® lymphatic drainage using Roboderm® microstimulation to support detox, circulation,
          and recovery—while helping reduce puffiness, refine contour, and improve skin quality. Sessions support
          swelling, post-travel recovery, contour refinement, and inflammation reduction within your wellness plan.
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <ServiceMenuTable title="À la carte & minute packages" services={icooneAlaCarte} />
          <ServiceMenuTable
            title="50-minute monthly programs"
            services={icooneMonthly50}
            footnote="Monthly packages require a one-month security deposit upon signing. 3 month minimum."
          />
        </div>
        <div className="mt-10 max-w-xl">
          <ServiceMenuTable title="80-minute monthly programs" services={icooneMonthly80} />
        </div>
        <div className="mt-8">
          <Link href="/services/icoone-laser" className="text-sm text-[#b78d4b] underline underline-offset-4">
            View full Icoone® service details
              </Link>
            </div>
      </EditorialSection>

      <section className="bg-[#1a1612] px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3 md:gap-8">
          {aftercareColumns.map((column) => (
            <article key={column.label}>
              <p className="text-[11px] tracking-[0.22em] text-[#c9a86a]">{column.label}</p>
              <p className="mt-4 font-serif text-xl leading-snug text-[#f7f1e8] sm:text-[1.35rem]">{column.text}</p>
            </article>
          ))}
        </div>
      </section>

      <EditorialSection id="recovery">
        <EditorialEyebrow>PAIN RELIEF &amp; SURGICAL RECOVERY</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#1f1a15] sm:text-4xl md:text-[2.75rem]">
          Physician-supported monthly recovery protocols.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#6f6251] sm:text-base">
          Designed for clients managing chronic pain or preparing for and recovering from surgical procedures. The most
          clinically effective non-invasive therapies, combined into one deeply restorative monthly protocol —
          personalized to your condition and timeline.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <ProtocolCard eyebrow="PAIN RELIEF & RECOVERY" title="Essential" items={essentialProtocol} />
          <ProtocolCard eyebrow="PAIN RELIEF & RECOVERY" title="Advanced" items={advancedProtocol} featured />
        </div>
      </EditorialSection>

      <EditorialSection id="face-body-wellness">
        <EditorialEyebrow>KOREAN &amp; ORGANIC SKINCARE</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#1f1a15] sm:text-4xl md:text-[2.75rem]">
          Bespoke facial protocols and regenerative microneedling.
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <ServiceMenuTable title="Korean & Organic Facial" services={koreanFacialMenu} />
          <ServiceMenuTable title="Microneedling with Exosomes" services={microneedlingMenu} />
        </div>

        <div className="mt-16">
          <EditorialEyebrow>HAIR RESTORATION</EditorialEyebrow>
          <h3 className="mt-4 font-serif text-3xl text-[#1f1a15] sm:text-4xl">Exosome-based scalp &amp; hair protocols.</h3>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#6f6251] sm:text-base">
            Physician-guided hair restoration programs combining diagnostics and regenerative options to support
            healthier density and scalp vitality. Treatment planning may include regenerative pathways, protocol
            sequencing, and follow-up optimization.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/services/hair-restoration" className="text-sm text-[#b78d4b] underline underline-offset-4">
              Hair restoration details
            </Link>
            <Link href="/services/microneedling-with-exosomes" className="text-sm text-[#b78d4b] underline underline-offset-4">
              Microneedling details
            </Link>
            <Link href="/services/korean-organic-skincare" className="text-sm text-[#b78d4b] underline underline-offset-4">
              Skincare details
            </Link>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection dark>
        <EditorialEyebrow tone="dark">TAKE-HOME CARE</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#f7f1e8] sm:text-4xl md:text-[2.75rem]">
          Maintain your results between visits.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#cbbba5] sm:text-base">
          Physician-curated products selected to support healing, barrier repair, photoprotection, and ongoing
          regenerative progress at home — coordinated with your in-suite protocols.
        </p>
        <EditorialCtaLink href="/shop">ASK FOR PRODUCT RECOMMENDATIONS →</EditorialCtaLink>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {takeHomeProducts.map((product) => (
            <TakeHomeCard key={product.title} title={product.title} description={product.description} />
          ))}
        </div>
        <p className="mt-8 max-w-4xl text-xs italic leading-relaxed text-[#a89884]">
          All take-home products are recommended by your provider based on your treatment history, skin type and wellness
          goals. Ask your specialist during your next visit for a personalized home-care regimen.
        </p>
      </EditorialSection>

      <EditorialSection id="compounding-peptides">
        <EditorialEyebrow>PHYSICIAN-LED PEPTIDE THERAPY</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#1f1a15] sm:text-4xl md:text-[2.75rem]">
          Over 100 peptides, precisely prescribed.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#6f6251] sm:text-base">
          Board-certified physicians curate personalized protocols from a clinical formulary spanning longevity,
          recovery, metabolic optimization, aesthetic renewal, immune support, and sexual wellness. Complete secure
          intake first for physician review and approval.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {peptideCategories.map((category) => (
            <PeptideCategoryCard key={category.title} title={category.title} description={category.description} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="https://www.privetherapeutics.solutions/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-sm bg-[#b78d4b] px-5 text-xs tracking-[0.18em] text-white"
          >
            START NOW
          </a>
          <Link
            href="/services/glp1-peptides"
            className="inline-flex min-h-[44px] items-center rounded-sm border border-[#b78d4b80] px-5 text-xs tracking-[0.18em] text-[#3b3024]"
          >
            VIEW PROGRAM DETAILS
          </Link>
        </div>
      </EditorialSection>

      <EditorialSection id="physician">
        <EditorialEyebrow>BODY &amp; WELLNESS</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#1f1a15] sm:text-4xl md:text-[2.75rem]">
          Composition, nutrition, vibration.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <WellnessInfoCard
            eyebrow="BODY COMPOSITION ANALYSIS"
            title="InBody Scan"
            description="Comprehensive, non-invasive assessment — muscle mass, body fat, visceral fat, hydration and metabolic rate. Reviewed alongside your physician's wellness roadmap."
            items={["Single Scan (non-member)", "Members — monthly"]}
          />
          <WellnessInfoCard
            eyebrow="WITH CERTIFIED SPECIALISTS"
            title="Nutrition & Wellness Coaching"
            description="Individualized nutrition plans rooted in science and lifestyle — from weight optimization to hormonal balance and sustained energy. Led by Cherie Johnson, Certified Nutritionist."
            items={["Single Session", "4-Session Package", "8-Session Package"]}
          />
          <WellnessInfoCard
            eyebrow="WHOLE-BODY VIBRATION THERAPY"
            title="Power Plate"
            description="Precision Vibration Technology™ stimulating muscles up to 50 times per second — circulation, recovery, balance and bone density."
            items={["9-Minute Session (non-member)", "Active membership — Included"]}
          />
          <WellnessInfoCard
            eyebrow="VIRTUAL PHYSICIAN CONSULTATIONS"
            title="Telemedicine"
            description="Board-certified physicians available for virtual visits — prescription management, peptide protocols, wellness reviews and ongoing care coordination from wherever you are."
            items={["Initial Consultation", "Follow-up Visit"]}
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/services/nutrition" className="text-[#b78d4b] underline underline-offset-4">
            Nutrition details
          </Link>
          <Link href="/services/telemedicine" className="text-[#b78d4b] underline underline-offset-4">
            Telemedicine details
          </Link>
          <Link href="/services/comprehensive-bloodwork" className="text-[#b78d4b] underline underline-offset-4">
            Blood work details
          </Link>
          <Link href="/services/iv-therapy" className="text-[#b78d4b] underline underline-offset-4">
            IV therapy details
          </Link>
        </div>
      </EditorialSection>

      {partnerAddOnServices.length > 0 ? (
        <EditorialSection>
          <EditorialEyebrow>PARTNER ENHANCEMENTS</EditorialEyebrow>
          <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] sm:text-4xl">Add-ons &amp; partner services</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#6f6251] sm:text-base">
            MindTap, beauty partner services, salt therapy, PEMF, infrared, and additional partner offerings coordinated
            by KIAN Privé concierge.
          </p>
          <div className="mt-10">
            <ServiceCardsWithModal services={partnerAddOnServices} label="PARTNER" layout="grid" />
          </div>
          <div className="mt-8">
            <p className="text-[11px] tracking-[0.18em] text-[#b78d4b]">FEATURED PROVIDER PROGRAMS</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {featuredProviderLogos.map((provider) => (
                <div key={provider.name} className="relative h-14 w-28">
                  <Image src={provider.logo} alt={provider.name} fill className="object-contain" />
                </div>
              ))}
            </div>
          </div>
        </EditorialSection>
      ) : null}

      <EditorialSection dark id="policies">
        <EditorialEyebrow tone="dark">PAYMENT &amp; POLICIES</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#f7f1e8] sm:text-4xl md:text-[2.75rem]">
          Transparent terms, considered care.
        </h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-sm border border-[#c9a86a33] bg-[#221c17] p-6 sm:p-7">
            <h3 className="font-serif text-2xl text-[#c9a86a]">Membership Summary</h3>
            <ul className="mt-5 space-y-3">
              {membershipPolicySummary.map((rule) => (
                <li key={rule} className="flex items-start gap-3 text-sm leading-relaxed text-[#e8dccb]">
                  <span className="mt-1 text-[#c9a86a]" aria-hidden>
                    ✦
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </article>
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-xl text-[#c9a86a]">Gratuity</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#e8dccb]">{gratuityPolicy}</p>
        </div>
            <div>
              <h3 className="font-serif text-xl text-[#c9a86a]">Financing &amp; Insurance</h3>
              <ul className="mt-2 space-y-2">
                {financingAndInsurancePolicies.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-[#e8dccb]">
                    {item}
              </li>
            ))}
          </ul>
        </div>
            <div>
              <h3 className="font-serif text-xl text-[#c9a86a]">Accepted Payments</h3>
              <ul className="mt-2 space-y-2">
                {paymentMethodsClean.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-[#e8dccb]">
                    {item}
                  </li>
                ))}
              </ul>
                    </div>
                </div>
              </div>
        <div className="mt-10 max-w-4xl space-y-2 text-xs leading-relaxed text-[#a89884]">
          {medicalDisclaimerParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/payment-policies"
            className="inline-flex min-h-[44px] items-center border border-[#c9a86a] px-5 text-[11px] tracking-[0.18em] text-[#c9a86a]"
          >
            FULL POLICY PAGES
          </Link>
          <Link
            href="/book-online"
            className="inline-flex min-h-[44px] items-center bg-[#b78d4b] px-5 text-[11px] tracking-[0.18em] text-white"
          >
            RESERVE A SESSION
          </Link>
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>SERVICE AVAILABILITY</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] sm:text-4xl">Where care happens</h2>
        <ul className="mt-6 max-w-3xl space-y-3">
          {serviceAccessNotes.map((note) => (
            <li key={note} className="flex items-start gap-3 text-sm leading-relaxed text-[#5f5344]">
              <span className="mt-1 text-[#b78d4b]" aria-hidden>
                ✦
              </span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-[#8a7a66]">{brandIntro.team}</p>
      </EditorialSection>
    </div>
  );
}
