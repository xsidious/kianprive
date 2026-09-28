"use client";

import { PHOTO_VIDEO_CONSENT_ACK, PHOTO_VIDEO_CONSENT_PARAGRAPHS, PHOTO_VIDEO_CONSENT_TITLE } from "@/lib/intake/photo-video-consent";

export type PhotoVideoConsentValue = {
  photoVideoConsentAccepted: boolean;
  photoVideoConsentSignedAt: string;
  photoVideoConsentPrintedName: string;
  photoVideoGuardianName?: string;
  photoVideoGuardianRelationship?: string;
};

type Props = {
  value: PhotoVideoConsentValue;
  onChange: (next: PhotoVideoConsentValue) => void;
  /** Compact mode for booking wizard */
  compact?: boolean;
  className?: string;
};

/** Shared Photo / Video / Testimonial / HIPAA media authorization block for clinical records. */
export function PhotoVideoConsentBlock({ value, onChange, compact = false, className = "" }: Props) {
  function patch(partial: Partial<PhotoVideoConsentValue>) {
    onChange({ ...value, ...partial });
  }

  return (
    <section
      className={`rounded-sm border border-[#e4d9c8] bg-[#fffaf4] ${compact ? "p-4" : "p-5 sm:p-6"} ${className}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8f6f3e]">
        Required medical record consent
      </p>
      <h3 className={`mt-2 font-serif text-[#1f1a15] ${compact ? "text-xl" : "text-2xl"}`}>
        {PHOTO_VIDEO_CONSENT_TITLE}
      </h3>
      <p className="mt-2 text-sm text-[#6f6251]">
        This authorization is part of your confidential clinical record for every medical treatment.
      </p>

      <div
        className={`mt-4 space-y-3 overflow-y-auto rounded-sm border border-[#efe6d9] bg-white p-4 text-sm leading-relaxed text-[#4f4335] ${
          compact ? "max-h-48" : "max-h-72"
        }`}
      >
        {PHOTO_VIDEO_CONSENT_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm text-[#4f4335]">
        <input
          type="checkbox"
          checked={value.photoVideoConsentAccepted}
          onChange={(e) => patch({ photoVideoConsentAccepted: e.target.checked })}
          className="mt-1"
        />
        <span>{PHOTO_VIDEO_CONSENT_ACK} *</span>
      </label>

      <div className={`mt-4 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        <label className="block text-sm text-[#4f4335]">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8b78]">
            Printed name *
          </span>
          <input
            type="text"
            value={value.photoVideoConsentPrintedName}
            onChange={(e) => patch({ photoVideoConsentPrintedName: e.target.value })}
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
            value={value.photoVideoConsentSignedAt}
            onChange={(e) => patch({ photoVideoConsentSignedAt: e.target.value })}
            className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-white px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block text-sm text-[#4f4335]">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8b78]">
            Parent / guardian (if under 18)
          </span>
          <input
            type="text"
            value={value.photoVideoGuardianName ?? ""}
            onChange={(e) => patch({ photoVideoGuardianName: e.target.value })}
            className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-white px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block text-sm text-[#4f4335]">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8b78]">
            Relationship to minor
          </span>
          <input
            type="text"
            value={value.photoVideoGuardianRelationship ?? ""}
            onChange={(e) => patch({ photoVideoGuardianRelationship: e.target.value })}
            className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-white px-3 py-2.5 text-sm"
          />
        </label>
      </div>
    </section>
  );
}
