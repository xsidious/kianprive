"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PeptidesInteractiveShowcase } from "@/components/services/PeptidesInteractiveShowcase";

import { NUTRITION_SERVICE_SLUG } from "@/lib/media/nutrition";
import type { ServiceListingItem } from "@/lib/services/types";

function isNutritionService(service: Pick<ServiceListingItem, "slug">) {
  return service.slug === NUTRITION_SERVICE_SLUG;
}

function getServiceBookingHref(service: ServiceListingItem) {
  if (service.externalBookingUrl) return service.externalBookingUrl;
  if (service.slug === "glp1-peptides") return "https://shop.kianprive.com/";
  return service.slug ? `/book-online?service=${service.slug}` : "/book-online";
}

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

type ServiceCardsWithModalProps = {
  services: ServiceListingItem[];
  label: string;
  layout?: "list" | "grid";
};

export function ServiceCardsWithModal({ services, label, layout = "list" }: ServiceCardsWithModalProps) {
  const [selectedService, setSelectedService] = useState<ServiceListingItem | null>(null);
  const { data } = useSession();
  const isPriorityGroup = label === "ADD-ON" || label === "SAME-LOCATION";
  const canViewPricing =
    data?.user?.subscriptionStatus === "ACTIVE" ||
    data?.user?.role === "ADMIN" ||
    data?.user?.role === "OPERATIONS" ||
    data?.user?.role === "EDITOR";

  useEffect(() => {
    if (!selectedService) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedService(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedService]);

  const shortDescription = (text: string, max = 140) =>
    text.length > max ? `${text.slice(0, max).trim()}…` : text;

  return (
    <>
      <div className={layout === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-6"}>
        {services.map((service, index) =>
          layout === "grid" ? (
            <article
              key={service.slug ?? `${service.title}-${index}`}
              className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-[#b78d4b22] bg-white shadow-[0_22px_50px_-38px_rgba(66,45,14,0.5)] transition hover:border-[#b78d4b55] hover:shadow-[0_28px_55px_-32px_rgba(66,45,14,0.45)]"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f1a15]/80 via-[#1f1a15]/10 to-transparent" />
                <p className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium tracking-[0.16em] text-[#8f6f3e]">
                  {label}
                </p>
                <h3 className="absolute bottom-4 left-4 right-4 text-xl font-medium leading-snug text-white">
                  {service.title}
                </h3>
              </div>
              <div className="flex flex-1 flex-col p-5">
                {service.partnerLogo ? (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1f7a7a2e] bg-[#f8fcfc] px-3 py-1">
                    <div className="relative h-5 w-16">
                      <Image src={service.partnerLogo} alt={`${service.partnerName ?? "Partner"} logo`} fill className="object-contain" />
                    </div>
                    <span className="text-[10px] tracking-[0.14em] text-[#1f6f75]">{service.partnerName ?? "PARTNER"}</span>
                  </div>
                ) : null}
                <p className="flex-1 text-sm leading-relaxed text-[#5f5344]">
                  {shortDescription(service.description)}
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  {service.slug ? (
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border-2 border-[#b78d4b44] bg-[#fffaf2] text-sm font-medium text-[#3b3024]"
                    >
                      Full details
                    </Link>
                  ) : null}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedService(service)}
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-2xl border-2 border-[#e8dcc8] text-sm text-[#3b3024]"
                    >
                      Quick view
                    </button>
                    {(() => {
                      const href = getServiceBookingHref(service);
                      return (
                        <Link
                          href={href}
                          target={isExternalHref(href) ? "_blank" : undefined}
                          rel={isExternalHref(href) ? "noreferrer" : undefined}
                          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-[#b78d4b] to-[#a67d42] text-sm font-semibold text-white"
                        >
                          {service.externalBookingUrl ? "Book with Partner" : "Book"}
                        </Link>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </article>
          ) : (
            <article
              key={service.slug ?? `${service.title}-${index}`}
              className={`grid gap-6 overflow-hidden rounded-3xl border p-5 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] md:grid-cols-[0.42fr_0.58fr] md:items-start ${
                isPriorityGroup
                  ? "border-[#1f7a7a4d] bg-[linear-gradient(160deg,#ffffff_35%,#eef8f7_100%)]"
                  : "border-[#b78d4b2d] bg-white"
              }`}
            >
              <div className="relative h-64 overflow-hidden rounded-2xl">
                <Image src={service.image} alt="" fill sizes="(max-width: 768px) 100vw, 42vw" className="object-cover" />
              </div>
              <div>
                <p className={`text-xs tracking-[0.2em] ${isPriorityGroup ? "text-[#1f6f75]" : "text-[#8f6f3e]"}`}>
                  {label} {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-2xl text-[#2b2218]">{service.title}</h3>
                {service.partnerLogo ? (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#1f7a7a2e] bg-[#f8fcfc] px-3 py-1">
                    <div className="relative h-5 w-16">
                      <Image src={service.partnerLogo} alt={`${service.partnerName ?? "Partner"} logo`} fill className="object-contain" />
                    </div>
                    <span className="text-[10px] tracking-[0.14em] text-[#1f6f75]">{service.partnerName ?? "PARTNER"}</span>
                  </div>
                ) : null}
                <p className="mt-4 leading-relaxed text-[#5f5344]">
                  {service.description.length > 280 ? `${service.description.slice(0, 280)}...` : service.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className={`inline-flex rounded-full border px-5 py-2 text-sm ${
                      isPriorityGroup
                        ? "border-[#1f7a7a66] bg-[#e9f7f7] text-[#11464c]"
                        : "border-[#b78d4b70] bg-[#fffaf2] text-[#3b3024]"
                    }`}
                  >
                    View More
                  </button>
                  {service.slug ? (
                    <Link
                      href={`/services/${service.slug}`}
                      className={`inline-flex rounded-full border px-5 py-2 text-sm ${
                        isPriorityGroup
                          ? "border-[#1f7a7a66] bg-white text-[#11464c]"
                          : "border-[#b78d4b70] bg-white text-[#3b3024]"
                      }`}
                    >
                      Service Page
                    </Link>
                  ) : null}
                  {(() => {
                    const href = getServiceBookingHref(service);
                    return (
                      <Link
                        href={href}
                        target={isExternalHref(href) ? "_blank" : undefined}
                        rel={isExternalHref(href) ? "noreferrer" : undefined}
                        className={`inline-flex rounded-full px-5 py-2 text-sm text-white ${
                          isPriorityGroup ? "bg-gradient-to-r from-[#1f7a7a] to-[#174f63]" : "bg-[#b78d4b]"
                        }`}
                      >
                        {service.externalBookingUrl ? "Book with Partner" : "Book Now"}
                      </Link>
                    );
                  })()}
                </div>
              </div>
            </article>
          ),
        )}
      </div>

      {selectedService ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#14100bb3] p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selectedService.title}
          onClick={() => setSelectedService(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl border border-[#1f7a7a3d] bg-[linear-gradient(170deg,#ffffff_10%,#f1f9f8_100%)] p-6 shadow-[0_25px_80px_-45px_rgba(20,58,58,0.65)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h4 className="text-2xl text-[#2b2218]">{selectedService.title}</h4>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="rounded-full border border-[#1f7a7a66] px-3 py-1 text-xs tracking-[0.14em] text-[#1f6f75]"
              >
                CLOSE
              </button>
            </div>
            {selectedService.showPeptidesExperience ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#b78d4b2d]">
                <PeptidesInteractiveShowcase />
              </div>
            ) : (
              <div
                className={`relative mt-4 overflow-hidden rounded-2xl border border-[#b78d4b2d] ${
                  isNutritionService(selectedService) ? "h-[min(70vh,520px)] bg-[#f4efe6]" : "h-56"
                }`}
              >
                {selectedService.video ? (
                  <video
                    src={selectedService.video}
                    controls
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={
                      isNutritionService(selectedService) && selectedService.promoImage
                        ? selectedService.promoImage
                        : selectedService.image
                    }
                    alt={selectedService.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 720px"
                    className={
                      isNutritionService(selectedService) && selectedService.promoImage
                        ? "object-contain p-3"
                        : "object-cover"
                    }
                  />
                )}
              </div>
            )}
            <p className="mt-5 leading-relaxed text-[#5f5344]">{selectedService.description}</p>
            {selectedService.partnerLogo ? (
              <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-[#1f7a7a33] bg-white px-4 py-2">
                <div className="relative h-8 w-24">
                  <Image src={selectedService.partnerLogo} alt={`${selectedService.partnerName ?? "Partner"} logo`} fill className="object-contain" />
                </div>
                <span className="text-xs tracking-[0.12em] text-[#1f6f75]">{selectedService.partnerName ?? "PARTNER SERVICE"}</span>
              </div>
            ) : null}
            {selectedService.details && selectedService.details.length > 0 ? (
              <div className="mt-5">
                <p className="text-xs tracking-[0.16em] text-[#1f6f75]">DETAILS</p>
                <div className="mt-2 space-y-2">
                  {selectedService.details.map((item) => (
                    <p key={item} className="text-sm leading-relaxed text-[#5f5344]">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
            {selectedService.includes && selectedService.includes.length > 0 ? (
              <div className="mt-5">
                <p className="text-xs tracking-[0.16em] text-[#1f6f75]">
                  {isNutritionService(selectedService)
                    ? "PERSONALIZED WELLNESS SUPPORT FOR"
                    : "WHAT THIS SUPPORTS"}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {selectedService.includes.map((item) => (
                    <li key={item} className="text-sm text-[#5f5344]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {selectedService.contentSections && selectedService.contentSections.length > 0 ? (
              <div className="mt-5 space-y-4">
                {selectedService.contentSections
                  .filter(
                    (section) =>
                      !(
                        isNutritionService(selectedService) &&
                        section.title.toLowerCase() === "personalized wellness support for"
                      ),
                  )
                  .map((section) => (
                  <div key={section.title}>
                    <p className="text-xs tracking-[0.16em] text-[#1f6f75]">{section.title.toUpperCase()}</p>
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="mt-2 text-sm leading-relaxed text-[#5f5344]">
                        {paragraph}
                      </p>
                    ))}
                    {section.bullets?.length ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {section.bullets.map((item) => (
                          <li key={item} className="text-sm text-[#5f5344]">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            {selectedService.pricing && selectedService.pricing.length > 0 ? (
              <div className="mt-5 rounded-xl border border-[#1f7a7a30] bg-[#eef8f8] p-3">
                <p className="text-xs tracking-[0.16em] text-[#1f6f75]">PRICING SNAPSHOT</p>
                {canViewPricing ? (
                  <ul className="mt-2 space-y-1">
                    {selectedService.pricing.map((item) => (
                      <li key={item} className="text-sm text-[#28585a]">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-[#28585a]">
                    Pricing is available for active members only. Please login with your membership account.
                  </p>
                )}
              </div>
            ) : null}
            {selectedService.membershipNotes && selectedService.membershipNotes.length > 0 ? (
              <div className="mt-5 rounded-xl border border-[#b78d4b38] bg-[#fffaf2] p-3">
                <p className="text-xs tracking-[0.16em] text-[#8f6f3e]">MEMBERSHIP NOTES</p>
                <ul className="mt-2 space-y-1">
                  {selectedService.membershipNotes.map((item) => (
                    <li key={item} className="text-sm text-[#5f5344]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {selectedService.availability && selectedService.availability.length > 0 ? (
              <div className="mt-5">
                <p className="text-xs tracking-[0.16em] text-[#1f6f75]">AVAILABILITY</p>
                <ul className="mt-2 space-y-1">
                  {selectedService.availability.map((item) => (
                    <li key={item} className="text-sm text-[#5f5344]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-6">
              {(() => {
                const href = getServiceBookingHref(selectedService);
                return (
                  <Link
                    href={href}
                    target={isExternalHref(href) ? "_blank" : undefined}
                    rel={isExternalHref(href) ? "noreferrer" : undefined}
                    className="inline-flex rounded-full bg-gradient-to-r from-[#1f7a7a] to-[#174f63] px-5 py-2 text-sm text-white"
                  >
                    {selectedService.externalBookingUrl ? "Book on Partner Site" : "Book This Service"}
                  </Link>
                );
              })()}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
