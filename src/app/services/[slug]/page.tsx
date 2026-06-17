import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { auth } from "@/lib/auth";
import { IcooneMediaGallery } from "@/components/services/IcooneMediaGallery";
import { nutritionPromoImage, NUTRITION_SERVICE_SLUG } from "@/lib/media/nutrition";
import { getServiceBySlug, serviceCatalog } from "@/lib/services/catalog";

export function generateStaticParams() {
  return serviceCatalog.map((service) => ({ slug: service.slug }));
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
  const bookingHref = service.externalBookingUrl
    ? service.externalBookingUrl
    : service.slug === "glp1-peptides"
      ? "https://shop.kianprive.com/"
      : "/book-online";
  const bookingIsExternal = bookingHref.startsWith("http://") || bookingHref.startsWith("https://");

  return (
    <div>
      <SectionWrapper className="pt-10 sm:pt-12 md:pt-14">
        {isNutrition ? (
          <div className="rounded-3xl border border-[#b78d4b2d] bg-white p-6 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] sm:p-8">
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">NUTRITION SERVICES</p>
            <p className="mt-3 text-center text-sm tracking-[0.22em] text-[#5f5344] sm:text-base">CHERIE JOHNSON</p>
            <p className="mt-1 text-center text-sm text-[#8f6f3e]">Certified Nutritionist · Wellness Educator</p>
            <h1 className="mt-4 text-center text-3xl italic text-[#1f1a15] sm:text-4xl md:text-5xl">Elevate Your Wellness</h1>
            <p className="mx-auto mt-6 max-w-2xl text-center leading-relaxed text-[#5f5344]">{service.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/book-online?service=nutrition"
                className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white"
              >
                Schedule Your Consultation Today
              </Link>
              <Link href="/contact" className="rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-5 py-2 text-sm text-[#3b3024]">
                Contact Us
              </Link>
              <Link href="/services" className="rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-5 py-2 text-sm text-[#3b3024]">
                Back to Services
              </Link>
            </div>
            <div className="relative mx-auto mt-8 max-w-2xl overflow-hidden rounded-2xl border border-[#b78d4b2d] bg-[#f4efe6]">
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
        ) : (
          <div className="grid items-center gap-8 rounded-3xl border border-[#b78d4b2d] bg-white p-6 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">SERVICE DETAIL</p>
              <h1 className="mt-3 text-3xl text-[#1f1a15] sm:text-4xl md:text-5xl">{service.title}</h1>
              <p className="mt-4 text-[#6f6251]">{service.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={bookingHref}
                  target={bookingIsExternal ? "_blank" : undefined}
                  rel={bookingIsExternal ? "noreferrer" : undefined}
                  className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white"
                >
                  {service.externalBookingUrl ? "Book with Partner" : service.slug === "glp1-peptides" ? "Go to Shop" : "Book Consultation"}
                </Link>
                <Link href="/services" className="rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-5 py-2 text-sm text-[#3b3024]">
                  Back to Services
                </Link>
              </div>
            </div>
            <div className="relative h-[300px] overflow-hidden rounded-2xl border border-[#b78d4b2d] sm:h-[360px]">
              <Image src={service.image} alt={service.title} fill className="object-cover" />
            </div>
          </div>
        )}
      </SectionWrapper>

      {service.gallery?.length ? (
        <SectionWrapper>
          <IcooneMediaGallery title="Treatment Experience" items={service.gallery} />
        </SectionWrapper>
      ) : null}

      {service.details?.length ? (
        <SectionWrapper>
          <h2 className="text-2xl text-[#1f1a15] sm:text-3xl">How This Service Works</h2>
          <div className="mt-4 grid gap-3">
            {service.details.map((detail) => (
              <article key={detail} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4 text-[#5f5344]">
                {detail}
              </article>
            ))}
          </div>
        </SectionWrapper>
      ) : null}

      {service.contentSections?.length ? (
        <SectionWrapper>
          <h2 className="text-2xl text-[#1f1a15] sm:text-3xl">
            {isNutrition ? "Nutrition Services Overview" : "Program Details"}
          </h2>
          <div className="mt-4 grid gap-4">
            {service.contentSections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-[#b78d4b2d] bg-white p-5">
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
        </SectionWrapper>
      ) : null}

      {service.includes?.length ? (
        <SectionWrapper>
          <h2 className="text-2xl text-[#1f1a15] sm:text-3xl">
            {isNutrition ? "What You Can Expect" : "What It Supports"}
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {service.includes.map((item) => (
              <article key={item} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4 text-[#5f5344]">
                {item}
              </article>
            ))}
          </div>
        </SectionWrapper>
      ) : null}

      {service.pricing?.length ? (
        <SectionWrapper>
          <h2 className="text-2xl text-[#1f1a15] sm:text-3xl">
            {isNutrition ? "Consultation Pricing" : "Pricing"}
          </h2>
          <div className="mt-4 rounded-2xl border border-[#b78d4b2d] bg-white p-5">
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
                  <Link href="/login" className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
                    Member Login
                  </Link>
                  <Link href="/pricing" className="rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-5 py-2 text-sm text-[#3b3024]">
                    View Membership
                  </Link>
                </div>
              </div>
            )}
          </div>
        </SectionWrapper>
      ) : null}

      {service.availability?.length ? (
        <SectionWrapper>
          <h2 className="text-2xl text-[#1f1a15] sm:text-3xl">Availability</h2>
          <div className="mt-4 rounded-2xl border border-[#b78d4b2d] bg-white p-5">
            <ul className="space-y-2 text-[#5f5344]">
              {service.availability.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </SectionWrapper>
      ) : null}

      {isNutrition ? (
        <SectionWrapper>
          <div className="rounded-3xl border border-[#b78d4b4f] bg-gradient-to-b from-[#fff8ed] to-[#f1e7d7] p-8 text-center shadow-[0_18px_40px_-30px_rgba(66,45,14,0.45)]">
            <h2 className="text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Begin Your Wellness Journey</h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#5f5344]">
              Your health journey deserves support, compassion, and a plan designed specifically for you.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/book-online?service=nutrition"
                className="rounded-full bg-[#b78d4b] px-6 py-3 text-sm text-white"
              >
                Schedule Your Consultation Today
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-[#b78d4b80] bg-white px-6 py-3 text-sm text-[#3b3024]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </SectionWrapper>
      ) : null}
    </div>
  );
}
