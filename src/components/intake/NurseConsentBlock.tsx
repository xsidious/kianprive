"use client";

import {
  NURSE_CONSENT_ACK,
  NURSE_CONSENT_INTRO,
  NURSE_CONSENT_PARAGRAPHS,
  NURSE_CONSENT_TITLE,
} from "@/lib/intake/nurse-consent";

export type NurseConsentValue = {
  nurseConsentAccepted: boolean;
  nurseConsentSignedAt: string;
  nurseConsentPrintedName: string;
  nurseConsentGuardianName?: string;
  nurseConsentGuardianRelationship?: string;
};

type Props = {
  value: NurseConsentValue;
  onChange: (next: NurseConsentValue) => void;
  compact?: boolean;
  className?: string;
};

function readable(paragraph: string) {
  return paragraph.replaceAll(";•", ";\n•").replaceAll(": •", ":\n•");
}

/** Patient signature for nurse-administered treatment. Charting stays with the nurse. */
export function NurseConsentBlock({ value, onChange, compact = false, className = "" }: Props) {
  function patch(partial: Partial<NurseConsentValue>) {
    onChange({ ...value, ...partial });
  }

  return (
    <section
      className={`rounded-sm border border-[#e4d9c8] bg-[#fffaf4] ${compact ? "p-4" : "p-5 sm:p-6"} ${className}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8f6f3e]">
        IV therapy consent
      </p>
      <h3 className={`mt-2 font-serif text-[#1f1a15] ${compact ? "text-xl" : "text-2xl"}`}>
        {NURSE_CONSENT_TITLE}
      </h3>
      <p className="mt-2 text-sm text-[#6f6251]">{NURSE_CONSENT_INTRO}</p>

      <div
        className={`mt-4 space-y-3 overflow-y-auto rounded-sm border border-[#efe6d9] bg-white p-4 text-sm leading-relaxed text-[#4f4335] ${
          compact ? "max-h-64" : "max-h-96"
        }`}
      >
        {NURSE_CONSENT_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="whitespace-pre-wrap">
            {readable(paragraph)}
          </p>
        ))}
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm text-[#4f4335]">
        <input
          type="checkbox"
          checked={value.nurseConsentAccepted}
          onChange={(event) => patch({ nurseConsentAccepted: event.target.checked })}
          className="mt-1"
        />
        <span>{NURSE_CONSENT_ACK} *</span>
      </label>

      <div className={`mt-4 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        <label className="block text-sm text-[#4f4335]">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8b78]">
            Printed name *
          </span>
          <input
            type="text"
            value={value.nurseConsentPrintedName}
            onChange={(event) => patch({ nurseConsentPrintedName: event.target.value })}
            className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-white px-3 py-2.5 text-sm"
            autoComplete="name"
          />
        </label>
        <label className="block text-sm text-[#4f4335]">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8b78]">
            Date signed *
          </span>
          <input
            type="date"
            value={value.nurseConsentSignedAt}
            onChange={(event) => patch({ nurseConsentSignedAt: event.target.value })}
            className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-white px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block text-sm text-[#4f4335]">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8b78]">
            Parent / guardian (if under 18)
          </span>
          <input
            type="text"
            value={value.nurseConsentGuardianName ?? ""}
            onChange={(event) => patch({ nurseConsentGuardianName: event.target.value })}
            className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-white px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block text-sm text-[#4f4335]">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8b78]">
            Relationship to minor
          </span>
          <input
            type="text"
            value={value.nurseConsentGuardianRelationship ?? ""}
            onChange={(event) => patch({ nurseConsentGuardianRelationship: event.target.value })}
            className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-white px-3 py-2.5 text-sm"
          />
        </label>
      </div>
    </section>
  );
}
