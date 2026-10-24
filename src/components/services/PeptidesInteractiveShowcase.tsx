"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  title: string;
  body: string;
};

const slides: Slide[] = [
  {
    title: "The Power of GLP Therapy",
    body:
      "Precision biology for metabolic care. GLP pathways act as targeted messengers that support appetite regulation, metabolism, and sustained wellness under physician supervision.",
  },
  {
    title: "What Are GLP Therapies?",
    body:
      "GLP therapies work through glucagon-like peptide receptor pathways. They help regulate blood sugar signaling, digestion pace, and fullness cues as part of a clinician-guided plan.",
  },
  {
    title: "How GLP Therapy Works",
    body:
      "Under physician review, protocols are matched to labs, history, and goals—then fulfilled through licensed compounding partners rather than retail checkout.",
  },
  {
    title: "Where GLP Therapy Fits",
    body:
      "Metabolic health, body composition support, and long-term lifestyle alignment—always prescribed as part of a KIAN Privé wellness plan.",
  },
];

export function PeptidesInteractiveShowcase() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  return (
    <div className="overflow-hidden rounded-sm border border-[#e4d9c8] bg-[#1f1a15] text-[#f7f1e8]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-xs tracking-[0.22em] text-[#c9a86a]">GLP EXPERIENCE</p>
          <p className="mt-1 font-serif text-xl">{slide.title}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous"
            className="rounded-full border border-white/20 p-2"
            onClick={() => setIndex((i) => (i === 0 ? slides.length - 1 : i - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Next"
            className="rounded-full border border-white/20 p-2"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="px-5 py-6">
        <p className="max-w-2xl text-sm leading-relaxed text-[#d9d0c3]">{slide.body}</p>
        <div className="mt-5 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 flex-1 rounded-full ${i === index ? "bg-[#c9a86a]" : "bg-white/20"}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
