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

type ServiceCardsWithModalProps = {
  services: ServiceListingItem[];
  label: string;
};

export function ServiceCardsWithModal({ services, label }: ServiceCardsWithModalProps) {
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

  return (
    <>
      <div className="space-y-6">
        {services.map((service, index) => (
          <article
            key={service.title}
            className={`grid gap-6 overflow-hidden rounded-3xl border p-5 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] md:grid-cols-[0.42fr_0.58fr] md:items-start ${
              isPriorityGroup
                ? "border-[#1f7a7a4d] bg-[linear-gradient(160deg,#ffffff_35%,#eef8f7_100%)]"
                : "border-[#b78d4b2d] bg-white"
            }`}
          >
            <div
              className={`relative overflow-hidden rounded-2xl ${
                isNutritionService(service) ? "h-72 bg-[#f4efe6] sm:h-80" : "h-64"
              }`}
            >
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className={isNutritionService(service) ? "object-contain p-2" : "object-cover"}
              />
            </div>
            <div>
              <p className={`text-xs tracking-[0.2em] ${isPriorityGroup ? "text-[#1f6f75]" : "text-[#8f6f3e]"}`}>
                {label} {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-2xl text-[#2b2218]">{service.title}</h3>
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
                <Link
                  href={service.slug ? `/book-online?service=${service.slug}` : "/book-online"}
                  className={`inline-flex rounded-full px-5 py-2 text-sm text-white ${
                    isPriorityGroup ? "bg-gradient-to-r from-[#1f7a7a] to-[#174f63]" : "bg-[#b78d4b]"
                  }`}
                >
                  Book Now
                </Link>
              </div>
            </div>
          </article>
        ))}
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
                    src={selectedService.image}
                    alt={selectedService.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 720px"
                    className={
                      isNutritionService(selectedService) ? "object-contain p-3" : "object-cover"
                    }
                  />
                )}
              </div>
            )}
            <p className="mt-5 leading-relaxed text-[#5f5344]">{selectedService.description}</p>
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
                <p className="text-xs tracking-[0.16em] text-[#1f6f75]">WHAT THIS SUPPORTS</p>
                <ul className="mt-2 space-y-1">
                  {selectedService.includes.map((item) => (
                    <li key={item} className="text-sm text-[#5f5344]">
                      {item}
                    </li>
                  ))}
                </ul>
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
              <Link
                href={selectedService.slug ? `/book-online?service=${selectedService.slug}` : "/book-online"}
                className="inline-flex rounded-full bg-gradient-to-r from-[#1f7a7a] to-[#174f63] px-5 py-2 text-sm text-white"
              >
                Book This Service
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
