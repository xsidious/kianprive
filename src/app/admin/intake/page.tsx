"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminModal } from "@/components/admin/AdminModal";
import { IntakeMessageThread } from "@/components/intake/IntakeMessageThread";
import { IntakeTherapyPicker } from "@/components/intake/IntakeTherapyPicker";
import { IntakeFullFormView } from "@/components/intake/IntakeFullFormView";
import { ClinicalIntakeShare } from "@/components/account/ClinicalIntakeQr";
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
import { INTAKE_QUEUES, intakeQueue, type IntakeQueue } from "@/lib/intake/tracking";

type IntakeSubmission = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  programs: string[];
  status: string;
  statusNote?: string | null;
  publicTrackingToken?: string | null;
  createdAt: string;
  referredBy?: string | null;
  clientSignatureDataUrl?: string | null;
  providerSignatureDataUrl?: string | null;
  providerSignedAt?: string | null;
  providerSignedName?: string | null;
  payload?: Record<string, unknown> | null;
  messageCount?: number;
  latestMessage?: {
    id: string;
    authorRole: string;
    authorLabel: string;
    body: string;
    createdAt: string;
  } | null;
  therapy?: {
    status: string;
    paymentStatus: string | null;
    itemCount: number;
  } | null;
};

const statuses = [
  "PENDING_REVIEW",
  "UNDER_PHYSICIAN_REVIEW",
  "NEEDS_LABS",
  "APPROVED",
  "NEEDS_FOLLOW_UP",
  "DECLINED",
] as const;

function sourceLabel(submission: IntakeSubmission) {
  const source = submission.payload?.source;
  if (source === "wellness-hub") return "Wellness Hub";
  if (source === "celexo-exosome") return "Celexo / Exosome";
  if (source === "facial-design") return "Facial Design Studio";
  if (source === "4everglow") return "4everglow Wellness";
  const siteLabel = submission.payload?.siteLabel;
  const location = submission.payload?.ehrLocationLabel;
  if (typeof location === "string" && location) return `Wellness Tech · ${location}`;
  if (typeof siteLabel === "string" && siteLabel) return siteLabel;
  return "Wellness Tech EHR";
}

function payloadText(value: unknown) {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

export default function AdminIntakePage() {
  const searchParams = useSearchParams();
  const [submissions, setSubmissions] = useState<IntakeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"ALL" | IntakeQueue>("ALL");
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

  useEffect(() => {
    const open = searchParams.get("open");
    if (open) setModalId(open);
  }, [searchParams]);

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

  async function deleteSubmission(id: string, name: string) {
    if (!window.confirm(`Delete clinical intake for ${name}? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/intake/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Could not delete intake submission.");
      return;
    }
    setMessage("Intake submission deleted.");
    if (modalId === id) setModalId(null);
    await loadSubmissions();
  }

  const grouped = useMemo(() => {
    const buckets: Record<IntakeQueue, IntakeSubmission[]> = {
      IN_REVIEW: [],
      APPROVED: [],
      OTHER: [],
    };
    for (const submission of submissions) {
      buckets[intakeQueue(submission.status)].push(submission);
    }
    return buckets;
  }, [submissions]);

  const visibleQueues = filter === "ALL" ? INTAKE_QUEUES : INTAKE_QUEUES.filter((item) => item.id === filter);

  const selected = submissions.find((s) => s.id === modalId) ?? null;

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: submissions.length, IN_REVIEW: 0, APPROVED: 0, OTHER: 0 };
    for (const item of submissions) {
      const queue = intakeQueue(item.status);
      map[queue] = (map[queue] ?? 0) + 1;
    }
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

      <ClinicalIntakeShare title="Send a customer to clinical intake" />

      <div className="grid gap-3 sm:grid-cols-3">
        {INTAKE_QUEUES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter((current) => (current === item.id ? "ALL" : item.id))}
            className={`${adminStat} text-left transition ${filter === item.id ? "border-[#8a682e] ring-1 ring-[#8a682e33]" : "hover:border-[#b78d4b80]"}`}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">{item.label}</p>
            <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{counts[item.id] ?? 0}</p>
            <p className="mt-1 text-xs text-[#6f6251]">{item.hint}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[#6f6251]">Loading submissions…</p>
      ) : (
        <div className="space-y-8">
          {visibleQueues.map((queue) => {
            const rows = grouped[queue.id];
            return (
              <section key={queue.id} className="space-y-3">
                <div>
                  <h2 className="font-serif text-2xl text-[#1f1a15]">{queue.label}</h2>
                  <p className="text-sm text-[#6f6251]">{queue.hint}</p>
                </div>
                {rows.length === 0 ? (
                  <div className={`${adminPanel} p-6 text-sm text-[#6f6251]`}>Nothing in {queue.label.toLowerCase()}.</div>
                ) : (
                  <div className="grid gap-3">
                    {rows.map((submission) => (
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
                {(submission.messageCount ?? 0) > 0 ? (
                  <span className="rounded-full bg-[#eef6f6] px-2.5 py-1 text-[#1b6568]">
                    {submission.messageCount} message{(submission.messageCount ?? 0) === 1 ? "" : "s"}
                    {submission.latestMessage?.authorRole === "PATIENT" ? " · patient replied" : ""}
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(
                    submission.therapy?.paymentStatus || submission.therapy?.status || "NO THERAPY",
                  )}`}
                >
                  {submission.therapy
                    ? submission.therapy.paymentStatus || submission.therapy.status
                    : "No therapy"}
                </span>
                {submission.programs.slice(0, 2).map((program) => (
                  <span key={program} className="rounded-full bg-[#f7f2ea] px-2.5 py-1">
                    {program}
                  </span>
                ))}
              </div>
              {submission.statusNote ? (
                <p className="mt-3 text-sm text-[#8f6f3e]">{submission.statusNote}</p>
              ) : null}
              {submission.latestMessage ? (
                <p className="mt-3 line-clamp-2 rounded-lg bg-[#fcfaf6] px-3 py-2 text-sm text-[#2b2218]">
                  <span className="text-[#8f6f3e]">{submission.latestMessage.authorLabel}:</span>{" "}
                  {submission.latestMessage.body}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button type="button" className={adminBtnPrimary} onClick={() => setModalId(submission.id)}>
                  View / reply
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
                <Link href={`/admin/prescriptions?intake=${submission.id}`} className={adminBtnGhost}>
                  {submission.therapy ? "Therapy" : "Assign therapy"}
                </Link>
                <Link href={`/admin/invoices?patient=${submission.id}`} className={adminBtnGhost}>
                  Invoice
                </Link>
                <button
                  type="button"
                  className="rounded-sm border border-[#d07b7b80] px-4 py-2 text-sm text-[#7c2c2c] hover:bg-[#fdeeee]"
                  onClick={() => void deleteSubmission(submission.id, submission.fullName)}
                >
                  Delete
                </button>
              </div>
            </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
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
              <span className="font-mono text-xs tracking-[0.12em] text-[#6f6251]">
                {selected.publicTrackingToken || selected.id}
              </span>
            </div>

            <IntakeMessageThread
              title="Request messages"
              hint="Ask for labs, documents, or clarifications. Patient replies appear here and on their track page."
              placeholder="e.g. Please send fasting labs from the last 90 days…"
              submitLabel="Send to patient"
              selfAuthorRole="PROVIDER"
              selfAuthorLabel="Clinical team"
              reloadKey={selected.id}
              loadMessages={async () => {
                const res = await fetch(`/api/admin/intake/${selected.id}/messages`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Could not load messages.");
                return data.messages ?? [];
              }}
              sendMessage={async (body) => {
                const res = await fetch(`/api/admin/intake/${selected.id}/messages`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ body, notifyPatient: true }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Could not send message.");
                if (!data.message) throw new Error("Message was not returned from the server.");
                setMessage("Message sent. Patient can see it on their track page.");
                // Refresh list counts in background — do not block the thread UI
                window.setTimeout(() => void loadSubmissions(), 800);
                return data.message;
              }}
            />

            <IntakeFullFormView submission={selected} payload={selected.payload ?? null} />

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

            <IntakeTherapyPicker
              intakeSubmissionId={selected.id}
              allowPricing
              onSaved={() => void loadSubmissions()}
            />

            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${selected.email}`} className={adminBtnPrimary}>
                Email patient
              </a>
              <button type="button" className={adminBtnGhost} onClick={() => setModalId(null)}>
                Close
              </button>
              <button
                type="button"
                className="rounded-sm border border-[#d07b7b80] px-4 py-2 text-sm text-[#7c2c2c] hover:bg-[#fdeeee]"
                onClick={() => void deleteSubmission(selected.id, selected.fullName)}
              >
                Delete submission
              </button>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
