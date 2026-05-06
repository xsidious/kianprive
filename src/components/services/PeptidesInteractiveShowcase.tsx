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
    <section className="relative overflow-hidden rounded-3xl border border-[#1f7a7a4d] bg-[#0c1e23] p-6 shadow-[0_24px_70px_-40px_rgba(12,37,43,0.82)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(31,122,122,0.28),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(27,78,96,0.24),transparent_45%)]" />
      <div className="relative z-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-xs tracking-[0.2em] text-[#91ddda]">PEPTIDES EXPERIENCE</p>
          <button
            type="button"
            onClick={() => setPlaying((prev) => !prev)}
            className="rounded-full border border-[#5cc2c277] px-3 py-1 text-xs tracking-[0.14em] text-[#c9f0ef]"
          >
            {playing ? "PAUSE" : "PLAY"}
          </button>
        </div>

        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-[#ffffff1f]">
          <motion.div
            key={`${activeIndex}-${tick}-${playing ? "play" : "pause"}`}
            initial={{ width: "0%" }}
            animate={{ width: playing ? "100%" : "0%" }}
            transition={{ duration: playing ? DURATION_MS / 1000 : 0.2, ease: "linear" }}
            className="h-full bg-gradient-to-r from-[#1f7a7a] via-[#2d8f9c] to-[#3ca7b2]"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-[0.58fr_0.42fr] md:items-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-xs tracking-[0.2em] text-[#8ad6dc]">{activeSlide.eyebrow}</p>
              <h3 className="mt-3 text-3xl text-[#fafaf7] md:text-4xl">{activeSlide.title}</h3>
              <p className="mt-4 max-w-2xl leading-relaxed text-[#c9d0dd]">{activeSlide.content}</p>
            </motion.div>
          </AnimatePresence>

          <div className="rounded-2xl border border-[#ffffff1a] bg-[#ffffff0d] p-4 backdrop-blur">
            <p className="text-xs tracking-[0.18em] text-[#8fe2df]">QUICK NAVIGATION</p>
            <div className="mt-4 grid gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    index === activeIndex
                      ? "border-[#5cc2c28a] bg-[#1f7a7a3d] text-[#fafaf7]"
                      : "border-[#ffffff1f] bg-[#ffffff08] text-[#d5d9e1]"
                  }`}
                >
                  <span className="mr-2 text-xs text-[#8ad6dc]">{String(index + 1).padStart(2, "0")}</span>
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
