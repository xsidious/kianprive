"use client";

import Image from "next/image";
import { useState } from "react";
import { icoonePrimaryImage } from "@/lib/media/icoone";

type Category = "Body" | "Face" | "Hair";

type ShowcaseItem = {
  treatment: string;
  beforeImage: string;
  afterImage: string;
};

const beforeAfterByCategory: Record<Category, ShowcaseItem[]> = {
  Body: [
    {
      treatment: "Icoone® Lymphatic Drainage",
      beforeImage: "/images/wellness.avif",
      afterImage: icoonePrimaryImage,
    },
  ],
  Face: [
    {
      treatment: "Skin Renewal Program",
      beforeImage: "/images/esthetics.avif",
      afterImage: "/images/facial-treatments.webp",
    },
    {
      treatment: "Korean Luxury Skincare Series",
      beforeImage: "/images/medicalaesthetics.avif",
      afterImage: "/images/facial-treatments.webp",
    },
  ],
  Hair: [
    {
      treatment: "Beauty & Hair Wellness Program",
      beforeImage: "/images/beauty.avif",
      afterImage: "/images/stock/service-beauty-salon.jpg",
    },
  ],
};

const categories: Category[] = ["Body", "Face", "Hair"];

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
                ? "border-[#7a5c32] bg-[#fff3df] text-[#5c4524]"
                : "border-[#e4d9c8] bg-white text-[#5f5344] hover:bg-[#fffaf2]"
            }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((item) => (
          <article key={item.treatment} className="rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-4">
            <p className="mb-1 text-xs tracking-[0.18em] text-[#8f6f3e]">{active.toUpperCase()}</p>
            <p className="mb-3 font-serif text-lg text-[#2b2218]">{item.treatment}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs tracking-[0.18em] text-[#8f6f3e]">BEFORE</p>
                <div className="relative h-48 overflow-hidden rounded-sm border border-[#e4d9c8]">
                  <Image
                    src={item.beforeImage}
                    alt={`${item.treatment} before`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    quality={70}
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs tracking-[0.18em] text-[#8f6f3e]">AFTER</p>
                <div className="relative h-48 overflow-hidden rounded-sm border border-[#e4d9c8]">
                  <Image
                    src={item.afterImage}
                    alt={`${item.treatment} after`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    quality={70}
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#5f5344]">Placeholder imagery — final before & after assets can be added from Canva.</p>
          </article>
        ))}
      </div>
    </>
  );
}
