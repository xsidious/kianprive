"use client";

import { useMemo, useState } from "react";
import {
  PEPTIDE_CATEGORIES,
  PEPTIDE_GUIDELINES,
  PEPTIDE_LIBRARY_DISCLAIMER,
  PEPTIDE_LIBRARY_INTRO,
  PEPTIDE_LIBRARY_TITLE,
  PEPTIDE_LIBRARY_VERSION,
  type PeptideClinicalCategory,
  type PeptideGuideline,
} from "@/lib/partners/peptide-guidelines-data";

const categoryTone: Record<PeptideClinicalCategory, string> = {
  Metabolic: "bg-[#fff1df] text-[#8f6f3e]",
  Repair: "bg-[#eef6f0] text-[#3d6b4f]",
  "Neuro/Mood": "bg-[#eef2f8] text-[#4a5d7a]",
  Immune: "bg-[#f7efe8] text-[#7a5540]",
  Hormonal: "bg-[#f3eef7] text-[#6a4f78]",
  Cosmetic: "bg-[#f8eef2] text-[#7a4a5d]",
  Other: "bg-[#f1eee8] text-[#5f5344]",
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#9a8b78]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#1f1a15]">{value}</p>
    </div>
  );
}

function PeptideCard({ peptide }: { peptide: PeptideGuideline }) {
  return (
    <article className="flex h-full flex-col rounded-sm border border-[#e4d9c8] bg-white p-5 shadow-[0_1px_0_rgba(31,26,21,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-2xl leading-tight text-[#1f1a15]">{peptide.name}</h3>
          <p className="mt-1 text-sm text-[#6f6251]">{peptide.action}</p>
        </div>
        <span
          className={`shrink-0 rounded-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${categoryTone[peptide.category]}`}
        >
          {peptide.category}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-b border-[#efe6d9] pb-5">
        <Metric label="Dosing" value={peptide.dosing} />
        <Metric label="Microdose" value={peptide.microdose} />
        <Metric label="Frequency" value={peptide.frequency} />
        <Metric label="Cycle" value={peptide.cycle} />
      </div>

      <div className="mt-4 grid flex-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a3b3b]">
            Contraindications
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[#4f4335]">
            {peptide.contraindications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5f5344]">
            Side Effects
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[#4f4335]">
            {peptide.sideEffects.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

type Props = {
  eyebrow?: string;
  showAck?: boolean;
  acknowledged?: boolean;
  onAcknowledge?: () => void;
  ackStatus?: string;
};

export function PeptideGuidelinesLibrary({
  eyebrow = "WELLNESS TECH",
  showAck = false,
  acknowledged = false,
  onAcknowledge,
  ackStatus,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof PEPTIDE_CATEGORIES)[number]>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PEPTIDE_GUIDELINES.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      const hay = [
        p.name,
        p.action,
        p.category,
        p.dosing,
        ...p.contraindications,
        ...p.sideEffects,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, category]);

  function exportPdf() {
    window.print();
  }

  return (
    <div className="peptide-guidelines-print space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs tracking-[0.22em] text-[#b78d4b]">{eyebrow}</p>
          <h1 className="mt-2 font-serif text-4xl text-[#1f1a15] sm:text-5xl">{PEPTIDE_LIBRARY_TITLE}</h1>
          <p className="mt-3 text-[#6f6251]">{PEPTIDE_LIBRARY_INTRO}</p>
          <p className="mt-2 text-xs tracking-[0.14em] text-[#8f6f3e]">VERSION {PEPTIDE_LIBRARY_VERSION}</p>
        </div>
        <button
          type="button"
          onClick={exportPdf}
          className="print:hidden rounded-sm border border-[#b78d4b80] bg-white px-4 py-2.5 text-sm text-[#4f4335] transition hover:bg-[#fff6e8]"
        >
          Export PDF
        </button>
      </div>

      {showAck ? (
        <div className="print:hidden rounded-sm border border-[#e4d9c8] bg-[#fffaf4] p-4">
          {acknowledged ? (
            <p className="text-sm text-[#3d6b4f]">Library acknowledgment on file.</p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#6f6251]">
                Acknowledge that you will use these protocols under clinical supervision only.
              </p>
              <button
                type="button"
                onClick={onAcknowledge}
                className="rounded-sm bg-[#b78d4b] px-4 py-2 text-sm text-white hover:bg-[#a07a3f]"
              >
                Acknowledge required reading
              </button>
            </div>
          )}
          {ackStatus ? <p className="mt-2 text-sm text-[#8f6f3e]">{ackStatus}</p> : null}
        </div>
      ) : null}

      <div className="print:hidden flex flex-col gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search peptide, action, contraindication…"
          className="w-full rounded-sm border border-[#e4d9c8] bg-white px-4 py-3 text-sm text-[#1f1a15] outline-none focus:border-[#b78d4b]"
        />
        <div className="flex flex-wrap gap-2">
          {PEPTIDE_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-sm border px-3 py-2 text-sm transition ${
                category === c
                  ? "border-[#b78d4b] bg-[#fff6e8] text-[#8f6f3e]"
                  : "border-[#e4d9c8] bg-white text-[#4f4335] hover:bg-[#fffaf4]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#9a8b78]">
          Showing {filtered.length} of {PEPTIDE_GUIDELINES.length} protocols
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((peptide) => (
          <PeptideCard key={peptide.id} peptide={peptide} />
        ))}
      </div>

      {!filtered.length ? (
        <p className="rounded-sm border border-[#e4d9c8] bg-white p-6 text-sm text-[#6f6251]">
          No peptides match this search.
        </p>
      ) : null}

      <p className="rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-4 text-xs leading-relaxed text-[#6f6251]">
        {PEPTIDE_LIBRARY_DISCLAIMER}
      </p>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            body * { visibility: hidden; }
            .peptide-guidelines-print, .peptide-guidelines-print * { visibility: visible; }
            .peptide-guidelines-print { position: absolute; left: 0; top: 0; width: 100%; background: white; }
            .print\\:hidden { display: none !important; }
          }
        `,
        }}
      />
    </div>
  );
}
