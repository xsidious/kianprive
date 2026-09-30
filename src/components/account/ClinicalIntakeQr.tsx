"use client";

import { useState } from "react";
import { BrandedQrCard } from "@/components/ambassador/BrandedQrCard";
import { adminBtnGhost, adminMuted, adminPanel } from "@/components/admin/ui";

const INTAKE_BASE = "https://www.privetherapeutics.solutions/schedule";

function intakeUrl(code?: string | null) {
  const ref = typeof code === "string" ? code.trim() : "";
  if (!ref) return INTAKE_BASE;
  return `${INTAKE_BASE}?ref=${encodeURIComponent(ref.toUpperCase())}`;
}

export function ClinicalIntakeShare({
  code,
  title = "Clinical intake",
}: {
  code?: string | null;
  title?: string;
}) {
  const url = intakeUrl(code);
  const [copied, setCopied] = useState(false);
  const fileCode = (code || "kian").toLowerCase();

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className={`${adminPanel} p-5`}>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-center">
        <BrandedQrCard
          value={url}
          label="Scan for clinical intake"
          filename={`prive-therapeutics-${fileCode}-intake.png`}
          size={220}
        />
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Privé Therapeutics</p>
          <h2 className="mt-2 font-serif text-2xl text-[#1f1a15]">{title}</h2>
          <p className={`${adminMuted} mt-2`}>
            Send customers here to complete the clinical intake. The form opens on Privé Therapeutics.
            {code ? " Their chart keeps your code." : ""}
          </p>
          <p className="mt-3 break-all text-sm text-[#2b2218]">{url}</p>
          <button type="button" className={`${adminBtnGhost} mt-3`} onClick={() => void copy()}>
            {copied ? "Copied" : "Copy intake link"}
          </button>
        </div>
      </div>
    </section>
  );
}
