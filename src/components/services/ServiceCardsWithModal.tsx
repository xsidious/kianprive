"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PeptidesInteractiveShowcase } from "@/components/services/PeptidesInteractiveShowcase";

import { NUTRITION_SERVICE_SLUG } from "@/lib/media/nutrition";
import type { ServiceListingItem } from "@/lib/services/types";
import { formatUsd } from "@/lib/services/pricing-menus";

function isNutritionService(service: Pick<ServiceListingItem, "slug">) {
  return service.slug === NUTRITION_SERVICE_SLUG;
}

function getServiceBookingHref(service: ServiceListingItem) {
  if (service.externalBookingUrl) return service.externalBookingUrl;
  if (service.slug === "glp1-peptides") return `/services/${service.slug}`;
  return service.slug ? `/book-online?service=${service.slug}` : "/book-online";
}

function getServiceCtaLabel(service: ServiceListingItem) {
  if (service.externalBookingUrl) return "Book with Partner";
  if (service.slug === "glp1-peptides") return "Learn More";
  return "Book Now";
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
  const [sliderIndexByService, setSliderIndexByService] = useState<Record<string, number>>({});
  const isPriorityGroup = label === "ADD-ON" || label === "SAME-LOCATION";

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

  const serviceKey = (service: ServiceListingItem, index: number) => service.slug ?? `${service.title}-${index}`;

  const getSlides = (service: ServiceListingItem) => {
    const sources = [service.image, ...(service.gallery?.map((item) => item.src) ?? [])];
    return [...new Set(sources)];
  };

  useEffect(() => {
    if (!services.some((service) => getSlides(service).length > 1)) return;
    const timer = window.setInterval(() => {
      setSliderIndexByService((previous) => {
        const next = { ...previous };
        services.forEach((service, index) => {
          const slides = getSlides(service);
          if (slides.length <= 1) return;
          const key = serviceKey(service, index);
          next[key] = ((previous[key] ?? 0) + 1) % slides.length;
        });
        return next;
      });
    }, 3500);
    return () => window.clearInterval(timer);
  }, [services]);

  return (
    <>
      <div className={layout === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-6"}>
        {services.map((service, index) => {
          const key = serviceKey(service, index);
          const slides = getSlides(service);
          const activeSlide = slides[sliderIndexByService[key] ?? 0] ?? service.image;
          return layout === "grid" ? (
            <article
              key={key}
              className="flex flex-col overflow-hidden rounded-sm border border-[#e4d9c8] bg-[#fffcf7]"
            >
              <div className="relative h-48 overflow-hidden bg-[#f3ebe0]">
                <Image
                  src={activeSlide}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
                <p className="absolute left-4 top-4 rounded-sm bg-white/90 px-3 py-1 text-[10px] tracking-[0.16em] text-[#8f6f3e]">
                  {label}
                </p>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-serif text-2xl text-[#1f1a15]">{service.title}</h3>
                {service.partnerLogo ? (
                  <div className="mt-3 inline-flex items-center rounded-sm border border-[#e4d9c8] bg-white px-3 py-1.5">
                    <div className="relative h-7 w-24">
                      <Image src={service.partnerLogo} alt={`${service.partnerName ?? "Partner"} logo`} fill className="object-contain" />
                    </div>
                  </div>
                ) : null}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#6f6251]">
                  {shortDescription(service.description)}
                </p>
                {service.guestPrice != null ? (
                  <p className="mt-3 text-sm font-medium text-[#8f6f3e]">
                    From {formatUsd(service.guestPrice)}
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  {(() => {
                    const href = getServiceBookingHref(service);
                    return (
                      <Link
                        href={href}
                        target={isExternalHref(href) ? "_blank" : undefined}
                        rel={isExternalHref(href) ? "noreferrer" : undefined}
                        className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-sm bg-[#b78d4b] px-4 text-[11px] tracking-[0.16em] text-white"
                      >
                        {getServiceCtaLabel(service).toUpperCase()}
                      </Link>
                    );
                  })()}
                  {service.slug ? (
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-[#b78d4b80] px-4 text-[11px] tracking-[0.16em] text-[#3b3024]"
                    >
                      DETAILS
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedService(service)}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-[#b78d4b80] px-4 text-[11px] tracking-[0.16em] text-[#3b3024]"
                    >
                      DETAILS
                    </button>
                  )}
                </div>
              </div>
            </article>
          ) : (
            <article
              key={key}
              className={`grid gap-6 overflow-hidden rounded-sm border p-5 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] md:grid-cols-[0.42fr_0.58fr] md:items-start ${
                isPriorityGroup
                  ? "border-[#1f7a7a4d] bg-[linear-gradient(160deg,#ffffff_35%,#eef8f7_100%)]"
                  : "border-[#b78d4b2d] bg-white"
              }`}
            >
              <div className="relative h-64 overflow-hidden rounded-sm">
                <Image src={activeSlide} alt="" fill sizes="(max-width: 768px) 100vw, 42vw" className="object-cover" />
                {slides.length > 1 ? (
                  <div className="absolute bottom-2 right-3 flex gap-1.5 rounded-sm bg-white/80 px-2 py-1">
                    {slides.map((slide, slideIndex) => (
                      <button
                        key={slide}
                        type="button"
                        onClick={() => setSliderIndexByService((prev) => ({ ...prev, [key]: slideIndex }))}
                        aria-label={`Show slide ${slideIndex + 1}`}
                        className={`h-2 rounded-full transition-all ${
                          slideIndex === (sliderIndexByService[key] ?? 0) ? "w-5 bg-[#8a682e]" : "w-2 bg-[#c4b49a]"
                        }`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <div>
                <p className={`text-xs tracking-[0.2em] ${isPriorityGroup ? "text-[#1f6f75]" : "text-[#8f6f3e]"}`}>
                  {label} {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-2xl text-[#2b2218]">{service.title}</h3>
                {service.partnerLogo ? (
                  <div className="mt-2 inline-flex items-center rounded-sm border border-[#1f7a7a2e] bg-[#f8fcfc] px-3 py-1.5">
                    <div className="relative h-7 w-24">
                      <Image src={service.partnerLogo} alt={`${service.partnerName ?? "Partner"} logo`} fill className="object-contain" />
                    </div>
                  </div>
                ) : null}
                <p className="mt-4 leading-relaxed text-[#5f5344]">
                  {service.description.length > 280 ? `${service.description.slice(0, 280)}...` : service.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className={`inline-flex rounded-sm border px-5 py-2 text-sm ${
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
                      className={`inline-flex rounded-sm border px-5 py-2 text-sm ${
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
                        className={`inline-flex rounded-sm px-5 py-2 text-sm text-white ${
                          isPriorityGroup ? "bg-gradient-to-r from-[#1f7a7a] to-[#174f63]" : "bg-[#b78d4b]"
                        }`}
                      >
                        {getServiceCtaLabel(service)}
                      </Link>
                    );
                  })()}
                </div>
              </div>
            </article>
          );
        })}
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
            className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h4 className="text-2xl text-[#2b2218]">{selectedService.title}</h4>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="rounded-sm border border-[#b78d4b80] px-3 py-1 text-xs tracking-[0.14em] text-[#3b3024]"
              >
                CLOSE
              </button>
            </div>
            {selectedService.showPeptidesExperience ? (
              <div className="mt-4 overflow-hidden rounded-sm border border-[#b78d4b2d]">
                <PeptidesInteractiveShowcase />
              </div>
            ) : (
              <div
                className={`relative mt-4 overflow-hidden rounded-sm border border-[#b78d4b2d] ${
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
              <div className="mt-4 inline-flex items-center rounded-sm border border-[#1f7a7a33] bg-white px-4 py-2">
                <div className="relative h-10 w-28">
                  <Image src={selectedService.partnerLogo} alt={`${selectedService.partnerName ?? "Partner"} logo`} fill className="object-contain" />
                </div>
              </div>
            ) : null}
            {selectedService.details && selectedService.details.length > 0 ? (
              <div className="mt-5">
                <p className="text-xs tracking-[0.16em] text-[#b78d4b]">DETAILS</p>
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
                    <p className="text-xs tracking-[0.16em] text-[#b78d4b]">{section.title.toUpperCase()}</p>
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
              <div className="mt-5 rounded-sm border border-[#e4d9c8] bg-white p-3">
                <p className="text-xs tracking-[0.16em] text-[#b78d4b]">PRICING</p>
                {selectedService.guestPrice != null ? (
                  <p className="mt-2 text-sm font-medium text-[#1f1a15]">
                    From {formatUsd(selectedService.guestPrice)}
                  </p>
                ) : null}
                <ul className="mt-2 space-y-1">
                  {selectedService.pricing.map((item) => (
                    <li key={item} className="text-sm text-[#5f5344]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {selectedService.availability && selectedService.availability.length > 0 ? (
              <div className="mt-5">
                <p className="text-xs tracking-[0.16em] text-[#b78d4b]">AVAILABILITY</p>
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
                    className="inline-flex min-h-[44px] rounded-sm bg-[#b78d4b] px-5 py-2 text-[11px] tracking-[0.16em] text-white"
                  >
                    {selectedService.externalBookingUrl
                      ? "Book on Partner Site"
                      : selectedService.slug === "glp1-peptides"
                        ? "Learn More"
                        : "Book This Service"}
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
