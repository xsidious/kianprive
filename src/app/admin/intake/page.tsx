"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSoft,
  adminEyebrow,
  adminMuted,
  adminPanel,
  adminSelect,
  adminStat,
  adminTitle,
  statusTone,
} from "@/components/admin/ui";

type IntakeSubmission = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  programs: string[];
  status: string;
  createdAt: string;
  referredBy?: string | null;
  clientSignatureDataUrl?: string | null;
  providerSignatureDataUrl?: string | null;
  providerSignedAt?: string | null;
  providerSignedName?: string | null;
  payload?: Record<string, unknown> | null;
};

const statuses = [
  "PENDING_REVIEW",
  "UNDER_PHYSICIAN_REVIEW",
  "APPROVED",
  "NEEDS_FOLLOW_UP",
  "DECLINED",
] as const;

function sourceLabel(submission: IntakeSubmission) {
  if (submission.payload?.source === "wellness-hub") return "Wellness Hub";
  return "Site intake";
}

function payloadText(value: unknown) {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

const DETAIL_SECTIONS: { title: string; fields: [string, string][] }[] = [
  {
    title: "Patient",
    fields: [
      ["Full name", "fullName"],
      ["Date of birth", "dateOfBirth"],
      ["Age", "age"],
      ["Sex at birth", "sexAtBirth"],
      ["Phone", "phone"],
      ["Email", "email"],
      ["Address", "address"],
      ["ID number", "idNumber"],
      ["ID issue place", "idIssuePlace"],
      ["Primary care physician", "primaryCarePhysician"],
      ["First appointment", "firstAppointmentDate"],
      ["Assigned provider", "assignedProvider"],
      ["Referred by", "referredBy"],
    ],
  },
  {
    title: "Medications & allergies",
    fields: [
      ["Prescription medications", "prescriptionMedications"],
      ["Supplements & peptides", "supplementsPeptides"],
      ["Medication allergies", "medicationAllergies"],
      ["Food allergies", "foodAllergies"],
      ["Other allergies", "otherAllergies"],
    ],
  },
  {
    title: "History",
    fields: [
      ["Conditions", "conditions"],
      ["Other conditions", "otherConditions"],
      ["Recent surgeries", "recentSurgeries"],
      ["Pregnant / breastfeeding", "pregnantBreastfeeding"],
      ["Last physical (year/month)", "lastPhysicalDate"],
      ["Last bloodwork (year/month)", "lastBloodworkDate"],
      ["Bloodwork within normal limits", "bloodworkWithinNormalLimits"],
    ],
  },
  {
    title: "GLP / peptide context",
    fields: [
      ["GLP medications", "glpMedications"],
      ["GLP dose", "glpDose"],
      ["GLP duration", "glpDuration"],
      ["Reason stopped", "glpReasonStopped"],
      ["Side effects", "glpSideEffects"],
      ["Contraindications", "contraindications"],
      ["Family MTC / MEN2", "familyMtcMen2"],
      ["Allergic reaction", "allergicReactionAny"],
      ["Allergic reaction details", "allergicReactionDetails"],
    ],
  },
  {
    title: "Notes & signatures",
    fields: [
      ["Scheduling status", "requestedDate"],
      ["Preferred time", "requestedTime"],
      ["Discussion notes", "schedulingNotes"],
      ["Attestation name", "attestationName"],
      ["Attestation date", "attestationDate"],
    ],
  },
];

export default function AdminIntakePage() {
  const [submissions, setSubmissions] = useState<IntakeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"ALL" | (typeof statuses)[number]>("ALL");
  const [modalId, setModalId] = useState<string | null>(null);

  async function loadSubmissions() {
    setLoading(true);
    const response = await fetch("/api/admin/intake/peptides-glp");
    if (!response.ok) {
      setMessage("Could not load intake submissions.");
      setLoading(false);
      return;
    }
    const payload = (await response.json()) as { submissions: IntakeSubmission[] };
    setSubmissions(payload.submissions);
    setLoading(false);
  }

  useEffect(() => {
    void loadSubmissions();
  }, []);

  async function updateStatus(id: string, status: string) {
    const response = await fetch("/api/admin/intake/peptides-glp", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) {
      setMessage("Could not update intake status.");
      return;
    }
    setMessage("Status updated.");
    await loadSubmissions();
  }

  const filtered = useMemo(() => {
    if (filter === "ALL") return submissions;
    return submissions.filter((s) => s.status === filter);
  }, [filter, submissions]);

  const selected = submissions.find((s) => s.id === modalId) ?? null;

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: submissions.length };
    for (const status of statuses) map[status] = 0;
    for (const item of submissions) map[item.status] = (map[item.status] ?? 0) + 1;
    return map;
  }, [submissions]);

  function fieldValue(submission: IntakeSubmission, key: string) {
    if (key in submission) return payloadText((submission as Record<string, unknown>)[key]);
    return payloadText(submission.payload?.[key]);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>HIPAA-protected clinical intake</p>
        <h1 className={adminTitle}>Clinical Intake</h1>
        <p className={adminMuted}>
          Review site and Wellness Hub submissions. Open any record for the full clinical packet.
        </p>
      </div>

      {message ? <p className="text-sm text-[#1b6568]">{message}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["All", "ALL"],
          ["Pending review", "PENDING_REVIEW"],
          ["Physician review", "UNDER_PHYSICIAN_REVIEW"],
          ["Needs follow-up", "NEEDS_FOLLOW_UP"],
        ].map(([label, key]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key as typeof filter)}
            className={`${adminStat} text-left transition ${filter === key ? "border-[#8a682e] ring-1 ring-[#8a682e33]" : "hover:border-[#b78d4b80]"}`}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">{label}</p>
            <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{counts[key] ?? 0}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[#6f6251]">Loading submissions…</p>
      ) : filtered.length === 0 ? (
        <div className={`${adminPanel} p-8 text-sm text-[#6f6251]`}>No intake submissions in this view yet.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((submission) => (
            <article key={submission.id} className={`${adminPanel} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-xl text-[#1f1a15]">{submission.fullName}</p>
                  <p className="mt-1 text-sm text-[#6f6251]">
                    {submission.email} · {submission.phone}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(submission.status)}`}>
                  {submission.status.replaceAll("_", " ")}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#6f6251]">
                <span className="rounded-full bg-[#fff6e8] px-2.5 py-1 text-[#8f6f3e]">{sourceLabel(submission)}</span>
                <span className="rounded-full bg-[#f7f2ea] px-2.5 py-1">{new Date(submission.createdAt).toLocaleString()}</span>
                {submission.programs.slice(0, 2).map((program) => (
                  <span key={program} className="rounded-full bg-[#f7f2ea] px-2.5 py-1">
                    {program}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button type="button" className={adminBtnPrimary} onClick={() => setModalId(submission.id)}>
                  View more
                </button>
                <select
                  value={submission.status}
                  onChange={(event) => void updateStatus(submission.id, event.target.value)}
                  className={adminSelect}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                <a href={`mailto:${submission.email}`} className={adminBtnGhost}>
                  Email
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminModal
        open={Boolean(selected)}
        title={selected?.fullName ?? "Intake"}
        eyebrow="Clinical submission"
        wide
        onClose={() => setModalId(null)}
      >
        {selected ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(selected.status)}`}>
                {selected.status.replaceAll("_", " ")}
              </span>
              <span className={adminBtnSoft}>{sourceLabel(selected)}</span>
              <span className="text-xs text-[#6f6251]">Ref {selected.id}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Update status</span>
                <select
                  value={selected.status}
                  onChange={(event) => void updateStatus(selected.id, event.target.value)}
                  className={`${adminSelect} w-full`}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <div className="text-sm">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Submitted</p>
                <p className="mt-2 text-[#2b2218]">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {DETAIL_SECTIONS.map((section) => (
              <section key={section.title} className="rounded-2xl border border-[#efe4d4] bg-[#fffaf3] p-4">
                <h3 className="font-serif text-lg text-[#1f1a15]">{section.title}</h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {section.fields.map(([label, key]) => (
                    <div key={key}>
                      <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">{label}</dt>
                      <dd className="mt-1 text-sm text-[#2b2218]">{fieldValue(selected, key)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}

            <section className="rounded-2xl border border-[#efe4d4] bg-[#fffaf3] p-4">
              <h3 className="font-serif text-lg text-[#1f1a15]">Signatures</h3>
              <p className="mt-1 text-sm text-[#6f6251]">
                Referred by: {selected.referredBy || fieldValue(selected, "referredBy")}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Client signature</p>
                  {selected.clientSignatureDataUrl || selected.payload?.clientSignatureDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={String(selected.clientSignatureDataUrl || selected.payload?.clientSignatureDataUrl)}
                      alt="Client signature"
                      className="mt-2 max-h-36 rounded-sm border border-[#efe6d8] bg-white p-2"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-[#7c2c2c]">Not captured</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Provider signature</p>
                  {selected.providerSignatureDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.providerSignatureDataUrl}
                      alt="Provider signature"
                      className="mt-2 max-h-36 rounded-sm border border-[#efe6d8] bg-white p-2"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-[#7c2c2c]">Awaiting provider</p>
                  )}
                  {selected.providerSignedAt ? (
                    <p className="mt-2 text-xs text-[#6f6251]">
                      {selected.providerSignedName} · {new Date(selected.providerSignedAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${selected.email}`} className={adminBtnPrimary}>
                Email patient
              </a>
              <button type="button" className={adminBtnGhost} onClick={() => setModalId(null)}>
                Close
              </button>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
