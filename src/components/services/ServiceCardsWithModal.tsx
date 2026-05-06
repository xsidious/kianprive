"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type ServiceItem = {
  title: string;
  image: string;
  description: string;
};

type ServiceCardsWithModalProps = {
  services: ServiceItem[];
  label: string;
};

export function ServiceCardsWithModal({ services, label }: ServiceCardsWithModalProps) {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
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
            <div className="relative h-64 overflow-hidden rounded-2xl">
              <Image src={service.image} alt={service.title} fill sizes="(max-width: 768px) 100vw, 42vw" className="object-cover" />
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
                <Link
                  href="/book-online"
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
            <div className="relative mt-4 h-56 overflow-hidden rounded-2xl border border-[#b78d4b2d]">
              <Image src={selectedService.image} alt={selectedService.title} fill className="object-cover" />
            </div>
            <p className="mt-5 leading-relaxed text-[#5f5344]">{selectedService.description}</p>
            <div className="mt-6">
              <Link href="/book-online" className="inline-flex rounded-full bg-gradient-to-r from-[#1f7a7a] to-[#174f63] px-5 py-2 text-sm text-white">
                Book This Service
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
