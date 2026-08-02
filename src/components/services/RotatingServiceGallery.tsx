"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ServiceMediaItem } from "@/lib/services/types";

type Props = {
  title?: string;
  items: ServiceMediaItem[];
  className?: string;
  intervalMs?: number;
};

export function RotatingServiceGallery({
  title = "Salon Experience",
  items,
  className = "",
  intervalMs = 4000,
}: Props) {
  const [index, setIndex] = useState(0);
  const slides = items.filter((item) => Boolean(item.src));

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [slides.length, intervalMs]);

  if (!slides.length) return null;

  const active = slides[index] ?? slides[0];

  return (
    <section className={className}>
      {title ? <h2 className="text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">{title}</h2> : null}
      <div className="relative mt-6 overflow-hidden rounded-sm border border-[#b78d4b2d] bg-white shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)]">
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/10]">
          {slides.map((slide, slideIndex) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              className={`object-cover transition-opacity duration-700 ${
                slideIndex === index ? "opacity-100" : "opacity-0"
              }`}
              priority={slideIndex === 0}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1f1a15]/70 to-transparent px-4 pb-4 pt-16">
            <p className="text-sm text-white/95">{active.alt}</p>
            <div className="mt-3 flex gap-2">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.src}
                  type="button"
                  aria-label={`Show photo ${slideIndex + 1}`}
                  onClick={() => setIndex(slideIndex)}
                  className={`h-2 rounded-full transition-all ${
                    slideIndex === index ? "w-6 bg-white" : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
