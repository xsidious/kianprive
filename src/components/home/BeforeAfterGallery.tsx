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
      afterImage: "/images/facial-treatments.jpg",
    },
    {
      treatment: "Korean Luxury Skincare Series",
      beforeImage: "/images/medicalaesthetics.avif",
      afterImage: "/images/facial-treatments.jpg",
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
            className={`rounded-full border px-4 py-2 text-sm transition ${
              active === category
                ? "border-[#b78d4b] bg-[#fff3df] text-[#8f6f3e]"
                : "border-[#b78d4b3e] bg-white text-[#5f5344] hover:bg-[#fffaf2]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.treatment}
            className="rounded-2xl border border-[#b78d4b2d] bg-white p-4 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]"
          >
            <p className="mb-1 text-xs tracking-[0.18em] text-[#8f6f3e]">{active.toUpperCase()}</p>
            <p className="mb-3 text-lg text-[#2b2218]">{item.treatment}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs tracking-[0.18em] text-[#8f6f3e]">BEFORE</p>
                <div className="relative h-48 overflow-hidden rounded-xl border border-[#b78d4b2d]">
                  <Image src={item.beforeImage} alt={`${item.treatment} before`} fill className="object-cover" />
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs tracking-[0.18em] text-[#8f6f3e]">AFTER</p>
                <div className="relative h-48 overflow-hidden rounded-xl border border-[#b78d4b2d]">
                  <Image src={item.afterImage} alt={`${item.treatment} after`} fill className="object-cover" />
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#8a7a66]">Placeholder imagery — final before & after assets can be added from Canva.</p>
          </article>
        ))}
      </div>
    </>
  );
}
