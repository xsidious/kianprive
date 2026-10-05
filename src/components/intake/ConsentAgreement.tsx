"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { SignaturePad } from "@/components/intake/SignaturePad";

export type ConsentSection = {
  title: string;
  body: string;
};

type SignatureValue = {
  accepted: boolean;
  signedAt: string;
  printedName: string;
  signatureDataUrl: string;
  guardianName?: string;
  guardianRelationship?: string;
};

type Props = {
  eyebrow: string;
  title: string;
  lede: string;
  highlights: string[];
  sections: ConsentSection[];
  acknowledgment: string;
  patientName: string;
  onPatientNameChange: (value: string) => void;
  dateOfBirth: string;
  onDateOfBirthChange: (value: string) => void;
  serviceDate?: string;
  value: SignatureValue;
  onChange: (next: SignatureValue) => void;
  className?: string;
};

const ROMAN =
  "XXI|XX|XIX|XVIII|XVII|XVI|XV|XIV|XIII|XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I";

export function splitConsentSections(paragraphs: readonly string[]): ConsentSection[] {
  const text = paragraphs.join("\n\n");
  const heading = new RegExp(`(^|\\s)((?:${ROMAN})\\.\\s+[A-Z][A-Z0-9 &'/,\\-]{2,90})(?=\\s)`, "g");
  const matches = [...text.matchAll(heading)];
  if (matches.length === 0) {
    return paragraphs.map((paragraph, index) => {
      const labeled = paragraph.match(/^([^:]{3,60}):\s+([\s\S]+)$/);
      if (labeled) return { title: labeled[1].trim(), body: labeled[2].trim() };
      return { title: index === 0 ? "Authorization" : `Section ${index + 1}`, body: paragraph.trim() };
    });
  }

  const sections: ConsentSection[] = [];
  const preamble = text.slice(0, matches[0].index).trim();
  if (preamble) sections.push({ title: "Agreement", body: tidy(preamble) });

  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[1].length;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? text.length) : text.length;
    const title = match[2].replace(/^[IVX]+\.\s*/, "").trim();
    const rawBody = text.slice(start + match[2].length, end).trim();
    sections.push({ title, body: tidy(rawBody) });
  });

  return sections.filter((section) => section.body.length > 0 || section.title.length > 0);
}

function prettyTitle(title: string) {
  if (title !== title.toUpperCase()) return title;
  return title
    .toLowerCase()
    .replace(/(^|[\s/])([a-z])/g, (_, lead: string, letter: string) => lead + letter.toUpperCase())
    .replace(/\bHipaa\b/g, "HIPAA")
    .replace(/\bFda\b/g, "FDA")
    .replace(/\bPhi\b/g, "PHI");
}

function localDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function tidy(body: string) {
  return body
    .replaceAll(";•", "\n•")
    .replaceAll(": •", ":\n•")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function ConsentAgreement({
  eyebrow,
  title,
  lede,
  highlights,
  sections,
  acknowledgment,
  patientName,
  onPatientNameChange,
  dateOfBirth,
  onDateOfBirthChange,
  serviceDate,
  value,
  onChange,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [guardianOpen, setGuardianOpen] = useState(Boolean(value.guardianName?.trim()));

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function patch(partial: Partial<SignatureValue>) {
    onChange({ ...value, ...partial });
  }

  return (
    <section className={`overflow-hidden rounded-sm border border-[#e4d9c8] bg-[#fffdf8] shadow-[0_18px_40px_-32px_rgba(66,45,14,0.45)] ${className}`}>
      <div className="h-1 bg-gradient-to-r from-[#c6a56a] via-[#8f6f3e] to-[#e7d3a8]" />
      <div className="p-5 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f6f3e]">{eyebrow}</p>
        <h3 className="mt-2 font-serif text-2xl leading-tight text-[#1f1a15]">{title}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6f6251]">{lede}</p>

        <ul className="mt-4 space-y-2">
          {highlights.slice(0, 2).map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-[#3b3024]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b78d4b]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 text-sm font-medium text-[#8a682e] underline decoration-[#b78d4b66] underline-offset-4"
        >
          Read the full agreement
        </button>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-[#4f4335]">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8b78]">Patient name</span>
            <input
              type="text"
              value={patientName}
              onChange={(event) => {
                onPatientNameChange(event.target.value);
                patch({ printedName: event.target.value });
              }}
              className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b78d4b]"
              autoComplete="name"
            />
          </label>
          <label className="block text-sm text-[#4f4335]">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8b78]">Date of birth</span>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(event) => onDateOfBirthChange(event.target.value)}
              className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b78d4b]"
            />
          </label>
          {serviceDate ? (
            <label className="block text-sm text-[#4f4335] sm:col-span-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8b78]">Date of service</span>
              <input
                type="text"
                value={serviceDate}
                readOnly
                className="mt-1 w-full rounded-sm border border-[#e4d9c8] bg-[#faf6ef] px-3 py-2.5 text-sm text-[#3b3024]"
              />
            </label>
          ) : null}
        </div>

        {open
          ? createPortal(
              <div
                className="fixed inset-0 z-[120] flex items-center justify-center bg-[#14100bb3] p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="consent-agreement-title"
                onClick={() => setOpen(false)}
              >
                <div
                  className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-sm border border-[#e4d9c8] bg-[#fffcf7] shadow-[0_30px_80px_-30px_rgba(20,16,11,0.7)]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="h-1 bg-gradient-to-r from-[#c6a56a] via-[#8f6f3e] to-[#e7d3a8]" />
                  <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#efe6d9] bg-[#fffcf7] px-5 py-4 sm:px-6">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f6f3e]">{eyebrow}</p>
                      <h3 id="consent-agreement-title" className="mt-1 font-serif text-2xl text-[#1f1a15]">
                        {title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-[#e4d9c8] text-[#3b3024]"
                      aria-label="Close agreement"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="px-5 py-5 sm:px-6">
                    {sections.map((section, index) => (
                      <article key={`${section.title}-${index}`} className={index === 0 ? "" : "mt-6"}>
                        <h4 className="font-serif text-lg text-[#1f1a15]">{prettyTitle(section.title)}</h4>
                        <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-[#4f4335]">{section.body}</p>
                      </article>
                    ))}
                  </div>
                  <div className="border-t border-[#efe6d9] px-5 py-3 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-sm bg-[#b78d4b] px-4 py-2 text-sm text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )
          : null}

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-sm border border-[#e4d9c8] bg-[#fffaf4] p-4 text-sm leading-relaxed text-[#3b3024]">
          <input
            type="checkbox"
            checked={value.accepted}
            onChange={(event) =>
              patch({
                accepted: event.target.checked,
                printedName: value.printedName || patientName,
                signedAt: value.signedAt || localDate(),
              })
            }
            className="mt-1 h-4 w-4 accent-[#8f6f3e]"
          />
          <span>{acknowledgment}</span>
        </label>

        <div className="mt-4">
          <SignaturePad
            value={value.signatureDataUrl || null}
            onChange={(dataUrl) =>
              patch({
                signatureDataUrl: dataUrl ?? "",
                printedName: value.printedName || patientName,
                signedAt: value.signedAt || localDate(),
              })
            }
            label="Sign here"
            height={140}
          />
          <p className="mt-2 text-xs text-[#8f6f3e]">
            {value.signedAt ? `Signed ${value.signedAt}` : "Your signature and the acceptance box are both required."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setGuardianOpen((current) => !current)}
          className="mt-3 text-xs tracking-wide text-[#8f6f3e] underline decoration-[#b78d4b55] underline-offset-4"
        >
          {guardianOpen ? "Hide parent or guardian fields" : "Signing for someone under 18?"}
        </button>
        {guardianOpen ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm text-[#4f4335]">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8b78]">
                Parent / guardian
              </span>
              <input
                type="text"
                value={value.guardianName ?? ""}
                onChange={(event) => patch({ guardianName: event.target.value })}
                className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b78d4b]"
              />
            </label>
            <label className="block text-sm text-[#4f4335]">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9a8b78]">
                Relationship
              </span>
              <input
                type="text"
                value={value.guardianRelationship ?? ""}
                onChange={(event) => patch({ guardianRelationship: event.target.value })}
                className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b78d4b]"
              />
            </label>
          </div>
        ) : null}
      </div>
    </section>
  );
}
