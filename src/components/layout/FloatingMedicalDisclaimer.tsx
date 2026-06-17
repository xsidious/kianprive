"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { medicalDisclaimerParagraphs } from "@/lib/policies/kian-prive-policies";

export function FloatingMedicalDisclaimer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-50 max-w-xs">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-[#b78d4b66] bg-white px-4 py-2 text-xs tracking-[0.12em] text-[#8f6f3e] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]"
      >
        Medical Disclaimer
        <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="mt-2 rounded-xl border border-[#b78d4b44] bg-[#fffaf2] p-3 text-xs leading-relaxed text-[#5f5344] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]">
          {medicalDisclaimerParagraphs.slice(0, 2).map((paragraph) => (
            <p key={paragraph} className="mb-2 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
