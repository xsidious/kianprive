"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ServiceListingItem } from "@/lib/services/types";

type PartnerServicesShowcaseProps = {
  services: ServiceListingItem[];
};

export function PartnerServicesShowcase({ services }: PartnerServicesShowcaseProps) {
  const slides = useMemo(
    () =>
      services
        .filter((service) => Boolean(service.image))
        .map((service) => ({
          key: service.slug ?? service.title,
          image: service.image,
          title: service.title,
          logo: service.partnerLogo,
          partnerName: service.partnerName ?? "Partner Service",
        })),
    [services],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;
  const activeSlide = slides[index];

  return (
    <div className="mb-6 rounded-3xl border border-[#1f7a7a30] bg-white p-4 shadow-[0_18px_45px_-35px_rgba(20,58,58,0.45)] sm:p-6">
      <div className="relative h-56 overflow-hidden rounded-2xl sm:h-72">
        <Image src={activeSlide.image} alt={activeSlide.title} fill className="object-cover" />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-[#1f6f75]">FEATURED PARTNER SERVICE</p>
          <p className="mt-1 text-lg text-[#2b2218]">{activeSlide.title}</p>
        </div>
        {activeSlide.logo ? (
          <div className="rounded-xl border border-[#1f7a7a2e] bg-[#f8fcfc] px-3 py-2">
            <div className="relative h-8 w-24">
              <Image src={activeSlide.logo} alt={`${activeSlide.partnerName} logo`} fill className="object-contain" />
            </div>
          </div>
        ) : null}
      </div>
      {slides.length > 1 ? (
        <div className="mt-3 flex gap-1.5">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => setIndex(slideIndex)}
              aria-label={`Show ${slide.title}`}
              className={`h-2.5 rounded-full transition-all ${index === slideIndex ? "w-7 bg-[#1f7a7a]" : "w-3 bg-[#c6dfdf]"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
