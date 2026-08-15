import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCmsPageContent } from "@/lib/cms/pages";
import { CinematicHero } from "@/components/ui/CinematicHero";
import { ServiceCardsWithModal } from "@/components/services/ServiceCardsWithModal";
import {
  EditorialEyebrow,
  EditorialSection,
  ProtocolCard,
  PeptideCategoryCard,
  TakeHomeCard,
  EditorialCtaLink,
} from "@/components/services/editorial";
import {
  IvPricingTable,
  LabPanelCards,
  PricedMenuTable,
  SectionCtaBar,
  ServiceJumpNav,
  ServicePriceCtaCard,
} from "@/components/services/PricedMenus";
import {
  brandIntro,
  featuredProviderLogos,
  partnerAddOnServices,
  serviceAccessNotes,
} from "@/lib/services/groups";
import {
  addOnLabPanels,
  coreLabPanels,
  icoonePricedMenu,
  ivAddOnMenu,
  ivDripMenu,
  ivInjectionMenu,
  ivMemberBenefits,
  ivMembershipTiers,
  personalTrainingMenu,
  providerVisitMenu,
} from "@/lib/services/pricing-menus";
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

const jumpNav = [
  { href: "#icoone", label: "Icoone®" },
  { href: "#face-body-wellness", label: "Face & Body" },
  { href: "#iv-therapy", label: "IV Therapy" },
  { href: "#lab-panels", label: "Lab Panels" },
  { href: "#provider-visits", label: "Provider Visits" },
  { href: "#personal-training", label: "Training" },
  { href: "#compounding-peptides", label: "Peptides" },
  { href: "#partners", label: "Partners" },
];

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

      <EditorialSection id="all-services" className="!py-10 sm:!py-12">
        <EditorialEyebrow>THE MENU</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#1f1a15] sm:text-4xl">Choose a pathway, then book.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#6f6251] sm:text-base">
          Guest prices are full retail. Member prices are 20% off unless a plan lists a different rate. IV therapy also
          offers 10% and 15% savings on 2× and 3× monthly plans.
        </p>
        <div className="mt-8">
          <ServiceJumpNav items={jumpNav} />
        </div>
      </EditorialSection>

      <EditorialSection id="icoone">
        <EditorialEyebrow>ICOONE® LASER</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#1f1a15] sm:text-4xl md:text-[2.75rem]">
          Lymphatic drainage &amp; body wellness.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#6f6251] sm:text-base">
          Physician-guided Icoone® lymphatic drainage using Roboderm® microstimulation to support detox, circulation,
          and recovery—while helping reduce puffiness, refine contour, and improve skin quality.
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <PricedMenuTable title="40-minute packages" items={icoonePricedMenu.packages40} />
          <PricedMenuTable
            title="50-minute programs"
            items={icoonePricedMenu.packages50}
            footnote="Monthly packages require a one-month security deposit upon signing. 4 month minimum."
          />
        </div>
        <div className="mt-10 max-w-xl">
          <PricedMenuTable title="80-minute programs" items={icoonePricedMenu.packages80} />
        </div>
        <SectionCtaBar
          bookHref="/book-online?service=icoone-laser"
          detailsHref="/services/icoone-laser"
          bookLabel="Book Icoone®"
        />
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
          clinically effective non-invasive therapies, combined into one deeply restorative monthly protocol.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <ProtocolCard eyebrow="PAIN RELIEF & RECOVERY" title="Essential" items={essentialProtocol} />
          <ProtocolCard eyebrow="PAIN RELIEF & RECOVERY" title="Advanced" items={advancedProtocol} featured />
        </div>
        <SectionCtaBar bookHref="/book-online?service=icoone-laser" bookLabel="Start a recovery protocol" />
      </EditorialSection>

      <EditorialSection id="face-body-wellness">
        <EditorialEyebrow>FACE, BODY &amp; WELLNESS</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#1f1a15] sm:text-4xl md:text-[2.75rem]">
          Skin, restoration, and nutrition—each with a clear next step.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <ServicePriceCtaCard
            eyebrow="KOREAN & ORGANIC SKINCARE"
            title="Luxury Facial"
            description="Preventive, hydration-focused facial protocols rooted in Korean methodology and clean organic formulations."
            guestPrice={195}
            memberPrice={156}
            items={["Single facial: $195", "4-session package: $725"]}
            detailsHref="/services/korean-organic-skincare"
            bookHref="/book-online?service=korean-organic-skincare"
          />
          <ServicePriceCtaCard
            eyebrow="REGENERATIVE SKIN"
            title="Microneedling with Exosomes"
            description="Collagen support and texture refinement through microneedling with regenerative signaling."
            guestPrice={600}
            memberPrice={480}
            items={["Single: $600", "4 sessions: $1,800", "5 sessions: $2,700", "10 sessions: $5,000"]}
            detailsHref="/services/microneedling-with-exosomes"
            bookHref="/book-online?service=microneedling-with-exosomes"
          />
          <ServicePriceCtaCard
            eyebrow="HAIR RESTORATION"
            title="Exosome scalp & hair protocols"
            description="Physician-guided diagnostics and regenerative pathways for healthier density and scalp vitality."
            detailsHref="/services/hair-restoration"
            bookHref="/book-online?service=microneedling-with-exosomes"
            bookLabel="Book a consult"
          />
          <ServicePriceCtaCard
            eyebrow="MEDICAL AESTHETICS"
            title="Facial Aesthetics"
            description="Precision aesthetic services focused on natural-looking refinement in a physician-guided setting."
            guestPrice={310}
            memberPrice={248}
            detailsHref="/services/facial-aesthetics"
            bookHref="/book-online?service=facial-aesthetics"
          />
          <ServicePriceCtaCard
            eyebrow="NUTRITION"
            title="Cherie Johnson, Certified Nutritionist"
            description="Personalized consultations, meal planning, and sustainable wellness habits—virtual sessions available."
            guestPrice={150}
            memberPrice={120}
            items={["Follow-up: $150", "4 sessions: $500", "8 sessions: $950"]}
            detailsHref="/services/nutrition"
            bookHref="/book-online?service=nutrition"
            bookLabel="Schedule consultation"
          />
          <ServicePriceCtaCard
            eyebrow="BODY COMPOSITION"
            title="InBody Scan"
            description="Muscle, fat, visceral fat, hydration, and metabolic insights reviewed with your physician."
            guestPrice={30}
            memberPrice={0}
            detailsHref="/services/inbody-scan"
            bookHref="/book-online?service=inbody-scan"
          />
        </div>
      </EditorialSection>

      <EditorialSection id="iv-therapy">
        <EditorialEyebrow>IV THERAPY</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#1f1a15] sm:text-4xl md:text-[2.75rem]">
          Drips, injections, and add-ons—priced for guests and members.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#6f6251] sm:text-base">
          Full retail for non-members. Save 10% on a 2× monthly plan ($49/mo), 15% on 3× ($74/mo), or 20% on 4× ($99/mo)
          and with an active KIAN Privé membership. All services administered by licensed medical professionals.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {ivMembershipTiers.map((tier) => (
            <span
              key={tier.label}
              className="rounded-sm border border-[#e4d9c8] bg-white px-3 py-2 text-xs text-[#5f5344]"
            >
              <span className="font-medium text-[#3b3024]">{tier.label}</span> · {tier.detail}
            </span>
          ))}
        </div>
        <div className="mt-10 space-y-10">
          <IvPricingTable title="IV drips" items={ivDripMenu} />
          <IvPricingTable title="Injections" items={ivInjectionMenu} />
          <IvPricingTable title="IV add-ons" items={ivAddOnMenu} />
        </div>
        <ul className="mt-8 space-y-2">
          {ivMemberBenefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-sm text-[#5f5344]">
              <span className="mt-1 text-[#b78d4b]" aria-hidden>
                ✦
              </span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <SectionCtaBar
          bookHref="/book-online?service=iv-therapy"
          detailsHref="/services/iv-therapy"
          bookLabel="Book IV therapy"
        />
      </EditorialSection>

      <EditorialSection id="lab-panels">
        <EditorialEyebrow>WELLNESS TECH LAB PANELS</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#1f1a15] sm:text-4xl md:text-[2.75rem]">
          Orderable diagnostic panels with physician review.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#6f6251] sm:text-base">
          Core panels use the mid-point of Wellness Tech suggested retail, with 20% member pricing. Add-on panels are
          targeted for brain health, weight management, hormone optimization, and cardiovascular risk.
        </p>
        <div className="mt-10">
          <LabPanelCards panels={coreLabPanels} eyebrow="CORE PANEL" />
        </div>
        <h3 className="mt-14 font-serif text-2xl text-[#1f1a15] sm:text-3xl">Optional add-on panels</h3>
        <p className="mt-3 max-w-3xl text-sm text-[#6f6251]">
          Hormone Optimization and Cardiovascular Risk were not priced on the source sheet; we aligned them with
          similarly sized targeted panels.
        </p>
        <div className="mt-8">
          <LabPanelCards panels={addOnLabPanels} eyebrow="ADD-ON PANEL" />
        </div>
      </EditorialSection>

      <EditorialSection id="provider-visits">
        <EditorialEyebrow>PROVIDER VISITS</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#1f1a15] sm:text-4xl md:text-[2.75rem]">
          Physician, nurse, and peptide consultations.
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <PricedMenuTable
            title="Physician — in person"
            items={providerVisitMenu.inPerson}
            bookHref="/book-online?service=physician-visit"
          />
          <PricedMenuTable
            title="Physician — telemedicine"
            items={providerVisitMenu.telemedicine}
            bookHref="/book-online?service=telemedicine"
          />
          <PricedMenuTable title="Asynchronous" items={providerVisitMenu.async} bookHref="/book-online?service=telemedicine" />
          <PricedMenuTable title="Nurse visits" items={providerVisitMenu.nurse} bookHref="/book-online?service=comprehensive-bloodwork" />
        </div>
        <div className="mt-10 max-w-xl">
          <PricedMenuTable
            title="Peptide optimization"
            items={providerVisitMenu.peptide}
            bookHref="/book-online?service=glp1-peptides"
          />
        </div>
        <SectionCtaBar
          bookHref="/book-online?service=telemedicine"
          detailsHref="/services/telemedicine"
          bookLabel="Book a physician visit"
        />
      </EditorialSection>

      <EditorialSection id="personal-training">
        <EditorialEyebrow>PERSONAL TRAINING</EditorialEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl text-[#1f1a15] sm:text-4xl md:text-[2.75rem]">
          Consults, sessions, packages, and weekly memberships.
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <PricedMenuTable title="Consultations & assessments" items={personalTrainingMenu.assessments} />
          <PricedMenuTable title="Single sessions" items={personalTrainingMenu.sessions} />
          <PricedMenuTable title="Session packages" items={personalTrainingMenu.packages} />
          <PricedMenuTable title="Monthly membership" items={personalTrainingMenu.membership} />
        </div>
        <SectionCtaBar
          bookHref="/book-online?service=personal-training"
          detailsHref="/services/personal-training"
          bookLabel="Book training"
        />
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
          recovery, metabolic optimization, aesthetic renewal, immune support, and sexual wellness. Peptide optimization
          consult: $100 guest / $80 member. Complete secure intake first for physician review.
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
            START INTAKE
          </a>
          <Link
            href="/services/glp1-peptides"
            className="inline-flex min-h-[44px] items-center rounded-sm border border-[#b78d4b80] px-5 text-xs tracking-[0.18em] text-[#3b3024]"
          >
            VIEW PROGRAM DETAILS
          </Link>
          <Link
            href="/book-online?service=glp1-peptides"
            className="inline-flex min-h-[44px] items-center rounded-sm border border-[#b78d4b80] px-5 text-xs tracking-[0.18em] text-[#3b3024]"
          >
            BOOK CONSULT · $100
          </Link>
        </div>
      </EditorialSection>

      {partnerAddOnServices.length > 0 ? (
        <EditorialSection id="partners">
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
