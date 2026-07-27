import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CinematicHero } from "@/components/ui/CinematicHero";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialPanel,
} from "@/components/ui/editorial-primitives";
import { auth } from "@/lib/auth";
import { IcooneMediaGallery } from "@/components/services/IcooneMediaGallery";
import { PeptidesInteractiveShowcase } from "@/components/services/PeptidesInteractiveShowcase";
import { nutritionPromoImage, NUTRITION_SERVICE_SLUG } from "@/lib/media/nutrition";
import { getServiceBySlug, serviceCatalog } from "@/lib/services/catalog";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/json-ld";

export function generateStaticParams() {
  return serviceCatalog.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) {
    return buildSeoMetadata({ title: "Service", canonicalPath: "/services", noIndex: true });
  }
  return buildSeoMetadata({
    title: service.title,
    description: service.description,
    canonicalPath: `/services/${service.slug}`,
    image: service.image,
  });
}

function splitHeroTitle(title: string): { lineOne: string; lineTwo: string; lineThree: string } {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return { lineOne: title, lineTwo: "", lineThree: "" };
  }
  if (words.length <= 3) {
    return {
      lineOne: words[0] ?? title,
      lineTwo: words[1] ?? "",
      lineThree: words.slice(2).join(" "),
    };
  }
  const third = Math.ceil(words.length / 3);
  return {
    lineOne: words.slice(0, third).join(" "),
    lineTwo: words.slice(third, third * 2).join(" "),
    lineThree: words.slice(third * 2).join(" "),
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) redirect("/services");

  const session = await auth();
  const canViewPricing =
    session?.user?.subscriptionStatus === "ACTIVE" ||
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "OPERATIONS" ||
    session?.user?.role === "EDITOR";
  if (service.requiresLogin && !session?.user?.id) {
    redirect("/login");
  }

  const isNutrition = slug === NUTRITION_SERVICE_SLUG;
  const showPricing = canViewPricing || isNutrition;
  const heroImage = isNutrition ? service.promoImage ?? nutritionPromoImage : service.image;
  const isPeptides = slug === "glp1-peptides";
  const bookingHref = service.externalBookingUrl
    ? service.externalBookingUrl
    : service.slug === "glp1-peptides"
      ? `/services/${service.slug}`
      : "/book-online";
  const bookingIsExternal = bookingHref.startsWith("http://") || bookingHref.startsWith("https://");
  const bookingLabel = service.externalBookingUrl
    ? "Book with Partner"
    : service.slug === "glp1-peptides"
      ? "Learn More"
      : "Book Consultation";
  const heroTitle = splitHeroTitle(service.title);

  return (
    <div className="-mt-[1px]">
      <JsonLd
        data={[
          serviceJsonLd({
            name: service.title,
            description: service.description,
            slug: service.slug,
            image: service.image,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
        ]}
      />
      {isNutrition ? (
        <EditorialSection>
          <div className={`${editorialPanel} p-6 sm:p-8`}>
            <EditorialEyebrow>NUTRITION SERVICES</EditorialEyebrow>
            <p className="mt-3 text-center text-sm tracking-[0.22em] text-[#5f5344] sm:text-base">CHERIE JOHNSON</p>
            <p className="mt-1 text-center text-sm text-[#8f6f3e]">Certified Nutritionist · Wellness Educator</p>
            <h1 className="mt-4 text-center font-serif text-3xl italic text-[#1f1a15] sm:text-4xl md:text-5xl">Elevate Your Wellness</h1>
            <p className="mx-auto mt-6 max-w-2xl text-center leading-relaxed text-[#5f5344]">{service.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/book-online?service=nutrition" className={editorialCtaPrimary}>
                SCHEDULE YOUR CONSULTATION TODAY
              </Link>
              <Link href="/contact" className={editorialCtaSecondary}>
                CONTACT US
              </Link>
              <Link href="/services" className={editorialCtaSecondary}>
                BACK TO SERVICES
              </Link>
            </div>
            <div className={`relative mx-auto mt-8 max-w-2xl overflow-hidden rounded-sm border border-[#e4d9c8] bg-[#f4efe6]`}>
              <div className="relative aspect-[3/4] w-full sm:aspect-[4/5]">
                <Image
                  src={heroImage}
                  alt="Cherie Johnson Nutrition Services — holistic wellness and personalized nutrition support"
                  fill
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="object-contain p-4"
                  priority
                />
              </div>
            </div>
          </div>
        </EditorialSection>
      ) : (
        <CinematicHero
          eyebrow="SERVICE DETAIL"
          lineOne={heroTitle.lineOne}
          lineTwo={heroTitle.lineTwo}
          lineThree={heroTitle.lineThree}
          description={service.description}
          primaryCta={isPeptides ? null : { label: bookingLabel, href: bookingHref }}
          secondaryCta={isPeptides ? null : { label: "Back to Services", href: "/services" }}
          imageSrc={service.image}
          imageAlt={service.title}
          priority={false}
        />
      )}

      {!isNutrition && !isPeptides ? (
        <EditorialSection>
          <div className="flex flex-wrap gap-3">
            <Link
              href={bookingHref}
              target={bookingIsExternal ? "_blank" : undefined}
              rel={bookingIsExternal ? "noreferrer" : undefined}
              className={editorialCtaPrimary}
            >
              {bookingLabel.toUpperCase()}
            </Link>
            <Link href="/services" className={editorialCtaSecondary}>
              BACK TO SERVICES
            </Link>
          </div>
        </EditorialSection>
      ) : null}

      {isPeptides ? (
        <EditorialSection className="!py-8 sm:!py-10">
          <PeptidesInteractiveShowcase />
          <div className={`mt-4 ${editorialPanel} p-5`}>
            <p className="text-xs tracking-[0.18em] text-[#8a682e]">START YOUR WELLNESS JOURNEY</p>
            <h2 className="mt-2 font-serif text-2xl text-[#1f1a15]">Complete your therapeutics intake first</h2>
            <p className="mt-3 max-w-3xl text-sm text-[#5f5344]">
              Submit the HIPAA-protected intake form so our team and your reviewing physician can evaluate eligibility.
              After approval, you will be contacted with booking and purchasing next steps.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="https://www.privetherapeutics.solutions/"
                target="_blank"
                rel="noreferrer"
                className={editorialCtaPrimary}
              >
                START NOW
              </a>
            </div>
          </div>
        </EditorialSection>
      ) : null}

      {service.gallery?.length ? (
        <EditorialSection>
          <IcooneMediaGallery title="Treatment Experience" items={service.gallery} />
        </EditorialSection>
      ) : null}

      {service.details?.length ? (
        <EditorialSection className={isPeptides ? "!py-8 sm:!py-10" : undefined}>
          <EditorialEyebrow>PROCESS</EditorialEyebrow>
          <h2 className="mt-3 font-serif text-2xl text-[#1f1a15] sm:text-3xl">How This Service Works</h2>
          <div className="mt-3 grid gap-3">
            {service.details.map((detail) => (
              <article key={detail} className={`${editorialPanel} p-4 text-[#5f5344]`}>
                {detail}
              </article>
            ))}
          </div>
        </EditorialSection>
      ) : null}

      {service.contentSections?.length ? (
        <EditorialSection className={isPeptides ? "!py-8 sm:!py-10" : undefined}>
          <EditorialEyebrow>DETAILS</EditorialEyebrow>
          <h2 className="mt-3 font-serif text-2xl text-[#1f1a15] sm:text-3xl">
            {isNutrition ? "Nutrition Services Overview" : "Program Details"}
          </h2>
          <div className="mt-3 grid gap-3">
            {service.contentSections.map((section) => (
              <article key={section.title} className={`${editorialPanel} p-5`}>
                <h3 className="text-xl text-[#2b2218]">{section.title}</h3>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 leading-relaxed text-[#5f5344]">
                    {paragraph}
                  </p>
                ))}
                {section.bullets?.length ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-[#5f5344]">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </EditorialSection>
      ) : null}

      {service.includes?.length ? (
        <EditorialSection className={isPeptides ? "!py-8 sm:!py-10" : undefined}>
          <EditorialEyebrow>INCLUDES</EditorialEyebrow>
          <h2 className="mt-3 font-serif text-2xl text-[#1f1a15] sm:text-3xl">
            {isNutrition ? "What You Can Expect" : "What It Supports"}
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {service.includes.map((item) => (
              <article key={item} className={`${editorialPanel} p-4 text-[#5f5344]`}>
                {item}
              </article>
            ))}
          </div>
        </EditorialSection>
      ) : null}

      {service.pricing?.length ? (
        <EditorialSection>
          <EditorialEyebrow>PRICING</EditorialEyebrow>
          <h2 className="mt-4 font-serif text-2xl text-[#1f1a15] sm:text-3xl">
            {isNutrition ? "Consultation Pricing" : "Pricing"}
          </h2>
          <div className={`mt-4 ${editorialPanel} p-5`}>
            {showPricing ? (
              <ul className="space-y-2 text-[#5f5344]">
                {service.pricing.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <div>
                <p className="text-[#5f5344]">
                  Pricing is only visible for logged-in members with active access.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/login" className={editorialCtaPrimary}>
                    MEMBER LOGIN
                  </Link>
                  <Link href="/pricing" className={editorialCtaSecondary}>
                    VIEW MEMBERSHIP
                  </Link>
                </div>
              </div>
            )}
          </div>
        </EditorialSection>
      ) : null}

      {service.availability?.length ? (
        <EditorialSection>
          <EditorialEyebrow>AVAILABILITY</EditorialEyebrow>
          <h2 className="mt-4 font-serif text-2xl text-[#1f1a15] sm:text-3xl">Availability</h2>
          <div className={`mt-4 ${editorialPanel} p-5`}>
            <ul className="space-y-2 text-[#5f5344]">
              {service.availability.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </EditorialSection>
      ) : null}

      {isNutrition ? (
        <EditorialSection>
          <div className={`${editorialPanel} border-[#b78d4b4f] bg-gradient-to-b from-[#fff8ed] to-[#f1e7d7] p-8 text-center`}>
            <h2 className="font-serif text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Begin Your Wellness Journey</h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#5f5344]">
              Your health journey deserves support, compassion, and a plan designed specifically for you.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/book-online?service=nutrition" className={editorialCtaPrimary}>
                SCHEDULE YOUR CONSULTATION TODAY
              </Link>
              <Link href="/contact" className={editorialCtaSecondary}>
                CONTACT US
              </Link>
            </div>
          </div>
        </EditorialSection>
      ) : null}
    </div>
  );
}
