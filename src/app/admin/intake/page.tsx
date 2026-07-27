"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminBtnGhost,
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

export default function AdminIntakePage() {
  const [submissions, setSubmissions] = useState<IntakeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"ALL" | (typeof statuses)[number]>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const selected = filtered.find((s) => s.id === selectedId) ?? submissions.find((s) => s.id === selectedId) ?? null;

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: submissions.length };
    for (const status of statuses) map[status] = 0;
    for (const item of submissions) map[item.status] = (map[item.status] ?? 0) + 1;
    return map;
  }, [submissions]);

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>HIPAA-protected clinical intake</p>
        <h1 className={adminTitle}>Clinical Intake</h1>
        <p className={adminMuted}>
          Review therapeutics intake from the site workflow and Wellness Hub Provider Connect submissions.
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
            className={`${adminStat} text-left transition ${filter === key ? "border-[#8a682e]" : "hover:border-[#b78d4b80]"}`}
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
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-3">
            {filtered.map((submission) => {
              const active = selected?.id === submission.id;
              return (
                <button
                  key={submission.id}
                  type="button"
                  onClick={() => setSelectedId(submission.id)}
                  className={`${adminPanel} w-full p-5 text-left transition ${
                    active ? "border-[#8a682e] ring-1 ring-[#8a682e33]" : "hover:border-[#b78d4b80]"
                  }`}
                >
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
                    <span className="rounded-sm bg-[#fff6e8] px-2 py-1 text-[#8f6f3e]">{sourceLabel(submission)}</span>
                    <span className="rounded-sm bg-[#f7f2ea] px-2 py-1">
                      {new Date(submission.createdAt).toLocaleString()}
                    </span>
                    {submission.programs.slice(0, 2).map((program) => (
                      <span key={program} className="rounded-sm bg-[#f7f2ea] px-2 py-1">
                        {program}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <aside className={`${adminPanel} sticky top-6 h-fit p-5`}>
            {selected ? (
              <div className="space-y-5">
                <div>
                  <p className={adminEyebrow}>Submission detail</p>
                  <h2 className="mt-1 font-serif text-2xl text-[#1f1a15]">{selected.fullName}</h2>
                  <p className="mt-1 text-sm text-[#6f6251]">Ref {selected.id}</p>
                </div>

                <div className="grid gap-3 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Status</p>
                    <select
                      value={selected.status}
                      onChange={(event) => void updateStatus(selected.id, event.target.value)}
                      className={`${adminSelect} mt-1 w-full`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Source</p>
                      <p className="mt-1 text-[#2b2218]">{sourceLabel(selected)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">DOB</p>
                      <p className="mt-1 text-[#2b2218]">{selected.dateOfBirth || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Programs</p>
                    <p className="mt-1 text-[#2b2218]">{selected.programs.join(", ") || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Requested visit</p>
                    <p className="mt-1 text-[#2b2218]">
                      {payloadText(selected.payload?.requestedDate)}
                      {selected.payload?.requestedTime ? ` · ${payloadText(selected.payload.requestedTime)}` : ""}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#efe6d8] pt-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Key clinical fields</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    {[
                      ["Assigned provider", selected.payload?.assignedProvider],
                      ["Medications", selected.payload?.prescriptionMedications],
                      ["Supplements / peptides", selected.payload?.supplementsPeptides],
                      ["Medication allergies", selected.payload?.medicationAllergies],
                      ["Conditions", selected.payload?.conditions],
                      ["GLP medications", selected.payload?.glpMedications],
                      ["Scheduling notes", selected.payload?.schedulingNotes],
                    ].map(([label, value]) => (
                      <div key={String(label)}>
                        <dt className="text-xs text-[#8f6f3e]">{label}</dt>
                        <dd className="text-[#2b2218]">{payloadText(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <a href={`mailto:${selected.email}`} className={adminBtnGhost}>
                  Email patient
                </a>
              </div>
            ) : (
              <p className="text-sm text-[#6f6251]">Select a submission to review details.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
