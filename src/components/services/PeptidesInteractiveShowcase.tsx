"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type PeptideSlide = {
  title: string;
  eyebrow: string;
  content: string;
};

const slides: PeptideSlide[] = [
  {
    eyebrow: "A Science of Cellular Renewal",
    title: "The Power of Peptides",
    content:
      "Precision biology for peak performance. Peptides act as targeted messengers that support recovery, metabolism, skin quality, and cellular renewal.",
  },
  {
    eyebrow: "Definition",
    title: "What Are Peptides?",
    content:
      "Peptides are short chains of amino acids. They direct cellular communication and trigger regenerative pathways that influence health, appearance, and vitality.",
  },
  {
    eyebrow: "Mechanism of Action",
    title: "How Peptides Work",
    content:
      "They bind to receptors, activate signaling cascades, regulate protein synthesis, and support collagen, tissue repair, and cellular protection.",
  },
  {
    eyebrow: "Clinical Applications",
    title: "Where Peptides Transform",
    content:
      "Applications include skin rejuvenation, body composition support, immune modulation, hair restoration, and tissue recovery in physician-guided protocols.",
  },
];

const DURATION_MS = 6500;

export function PeptidesInteractiveShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [tick, setTick] = useState(0);

  const activeSlide = useMemo(() => slides[activeIndex], [activeIndex]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
      setTick((prev) => prev + 1);
    }, DURATION_MS);
    return () => clearInterval(timer);
  }, [playing]);

  const goTo = (index: number) => {
    setActiveIndex(index);
    setTick((prev) => prev + 1);
  };

  return (
    <section className="relative overflow-hidden rounded-sm border border-[#e4d9c8] bg-[#1a1510] p-5 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(185,141,75,0.22),transparent_42%),radial-gradient(circle_at_80%_60%,rgba(138,104,46,0.18),transparent_48%)]" />
      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs tracking-[0.22em] text-[#c9a86a]">PEPTIDES EXPERIENCE</p>
          <button
            type="button"
            onClick={() => setPlaying((prev) => !prev)}
            className="rounded-sm border border-[#c9a86a66] px-3 py-1 text-xs tracking-[0.14em] text-[#e8dcc8]"
          >
            {playing ? "PAUSE" : "PLAY"}
          </button>
        </div>

        <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-[#ffffff1f]">
          <motion.div
            key={`${activeIndex}-${tick}-${playing ? "play" : "pause"}`}
            initial={{ width: "0%" }}
            animate={{ width: playing ? "100%" : "0%" }}
            transition={{ duration: playing ? DURATION_MS / 1000 : 0.2, ease: "linear" }}
            className="h-full bg-gradient-to-r from-[#8a682e] via-[#b78d4b] to-[#c9a86a]"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[0.58fr_0.42fr] md:items-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xs tracking-[0.2em] text-[#c9a86a]">{activeSlide.eyebrow}</p>
              <h3 className="mt-2 font-serif text-2xl text-[#fafaf7] md:text-3xl">{activeSlide.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#e8dfd0] md:text-base">{activeSlide.content}</p>
            </motion.div>
          </AnimatePresence>

          <div className="rounded-sm border border-[#c9a86a33] bg-[#ffffff0a] p-3 backdrop-blur">
            <p className="text-xs tracking-[0.18em] text-[#c9a86a]">QUICK NAVIGATION</p>
            <div className="mt-3 grid gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`rounded-sm border px-3 py-2 text-left text-sm transition ${
                    index === activeIndex
                      ? "border-[#c9a86a88] bg-[#8a682e55] text-[#fafaf7]"
                      : "border-[#ffffff1f] bg-[#ffffff08] text-[#d5d9e1]"
                  }`}
                >
                  <span className="mr-2 text-xs text-[#c9a86a]">{String(index + 1).padStart(2, "0")}</span>
                  {slide.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
