"use client";

import Image from "next/image";
import { useState } from "react";

type Category = "Body" | "Face" | "Hair";

type ShowcaseItem = {
  treatment: string;
  beforeImage?: string;
  afterImage?: string;
  /** Designed before/after graphic shown as one frame. */
  combinedImage?: string;
  note?: string;
  placeholder?: boolean;
};

const beforeAfterByCategory: Record<Category, ShowcaseItem[]> = {
  Body: [
    {
      treatment: "Icoone® Body Contouring",
      combinedImage: "/images/results/body-before-after.webp",
    },
  ],
  Face: [
    {
      treatment: "Skin Renewal Program",
      beforeImage: "/images/esthetics.avif",
      afterImage: "/images/facial-treatments.webp",
      placeholder: true,
    },
    {
      treatment: "Korean Luxury Skincare Series",
      beforeImage: "/images/medicalaesthetics.avif",
      afterImage: "/images/facial-treatments.webp",
      placeholder: true,
    },
  ],
  Hair: [
    {
      treatment: "Lymphatic Drainage & Exosomes",
      combinedImage: "/images/results/hair-before-after.webp",
      note: "Noticeable growth and increased thickness after 4 days.",
    },
  ],
};

const categories: Category[] = ["Body", "Face", "Hair"];

function ResultImage({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1600}
      height={1600}
      sizes={sizes}
      quality={85}
      className="h-auto w-full bg-[#f3ebe0]"
      loading="lazy"
    />
  );
}

export function BeforeAfterGallery() {
  const [active, setActive] = useState<Category>("Body");
  const items = beforeAfterByCategory[active];

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-sm border px-4 py-2 text-[11px] tracking-[0.16em] transition ${
              active === category
                ? "border-[#7a5c32] bg-[#fff3df] text-[#5c4524] shadow-[0_1px_0_rgba(183,141,75,0.25)]"
                : "border-[#e4d9c8] bg-white text-[#5f5344] hover:border-[#c9b48a] hover:bg-[#fffaf2]"
            }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.treatment}
            className={`rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-3 sm:p-4 ${item.combinedImage ? "lg:col-span-2" : ""}`}
          >
            <p className="mb-1 text-xs tracking-[0.18em] text-[#8f6f3e]">{active.toUpperCase()}</p>
            <p className="mb-3 font-serif text-lg text-[#2b2218]">{item.treatment}</p>
            {item.combinedImage ? (
              <div className="overflow-hidden rounded-sm border border-[#e4d9c8] bg-[#f3ebe0]">
                <ResultImage
                  src={item.combinedImage}
                  alt={`${item.treatment} before and after`}
                  sizes="100vw"
                />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs tracking-[0.18em] text-[#8f6f3e]">BEFORE</p>
                  <div className="overflow-hidden rounded-sm border border-[#e4d9c8] bg-[#f3ebe0]">
                    <ResultImage
                      src={item.beforeImage ?? ""}
                      alt={`${item.treatment} before`}
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs tracking-[0.18em] text-[#8f6f3e]">AFTER</p>
                  <div className="overflow-hidden rounded-sm border border-[#e4d9c8] bg-[#f3ebe0]">
                    <ResultImage
                      src={item.afterImage ?? ""}
                      alt={`${item.treatment} after`}
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            )}
            {item.note ? <p className="mt-3 text-sm text-[#5f5344]">{item.note}</p> : null}
            {item.placeholder ? (
              <p className="mt-3 text-xs text-[#5f5344]">Placeholder imagery — final before & after assets can be added from Canva.</p>
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}
