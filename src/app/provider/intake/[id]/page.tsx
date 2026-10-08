"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SignaturePad } from "@/components/intake/SignaturePad";
import { IntakeMessageThread } from "@/components/intake/IntakeMessageThread";
import { IntakeTherapyPicker } from "@/components/intake/IntakeTherapyPicker";
import { IntakeFullFormView } from "@/components/intake/IntakeFullFormView";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminEyebrow,
  adminMuted,
  adminPanel,
  adminTitle,
} from "@/components/admin/ui";

type Submission = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  status: string;
  statusNote?: string | null;
  referredBy: string | null;
  clientSignatureDataUrl: string | null;
  providerSignatureDataUrl: string | null;
  providerSignedName: string | null;
  providerSignedAt: string | null;
  payload: Record<string, unknown> | null;
};

function field(payload: Record<string, unknown> | null, key: string) {
  const value = payload?.[key];
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

const STATUS_ACTIONS = [
  { value: "UNDER_PHYSICIAN_REVIEW", label: "Under review" },
  { value: "NEEDS_LABS", label: "Needs labs" },
  { value: "NEEDS_FOLLOW_UP", label: "Needs follow-up" },
  { value: "APPROVED", label: "Approve" },
  { value: "DECLINED", label: "Decline" },
] as const;

export default function ProviderIntakeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [createOrderDraft, setCreateOrderDraft] = useState(true);
  const [canPrescribe, setCanPrescribe] = useState(true);
  const [signerName, setSignerName] = useState("Assigned physician");
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  async function load() {
    const res = await fetch(`/api/provider/intake/${id}`);
    if (!res.ok) {
      setMessage("Could not load submission.");
      return;
    }
    const payload = (await res.json()) as { submission: Submission; canPrescribe?: boolean };
    setSubmission(payload.submission);
    setCanPrescribe(payload.canPrescribe !== false);
    setStatusNote(payload.submission.statusNote || "");
    return payload.submission;
  }

  useEffect(() => {
    void (async () => {
      const [submissionRow, meRes] = await Promise.all([load(), fetch("/api/partner/me")]);
      let profileSig: string | null = null;
      if (meRes.ok) {
        const data = (await meRes.json()) as {
          partner?: { displayName?: string; signatureDataUrl?: string | null };
        };
        const name = data?.partner?.displayName;
        if (typeof name === "string" && name.trim()) setSignerName(name.trim());
        profileSig = data?.partner?.signatureDataUrl ?? null;
        setSavedSignature(profileSig);
      }
      const existing = submissionRow?.providerSignatureDataUrl ?? null;
      setSignature(existing || profileSig);
    })();
  }, [id]);

  function useSavedSignature() {
    if (!savedSignature) {
      setMessage("No saved signature on your profile yet. Draw once and check “Save as my default”.");
      return;
    }
    setSignature(savedSignature);
    setMessage("Applied your saved signature.");
  }

  async function saveSignature() {
    if (!signature) {
      setMessage("Please add your signature first.");
      return;
    }
    setBusy(true);
    setMessage("");
    const res = await fetch(`/api/provider/intake/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sign",
        providerSignatureDataUrl: signature,
        providerSignedName: signerName,
      }),
    });
    if (res.ok && (saveAsDefault || !savedSignature)) {
      await fetch("/api/partner/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureDataUrl: signature }),
      });
      setSavedSignature(signature);
      setSaveAsDefault(false);
    }
    setBusy(false);
    setMessage(res.ok ? "Signature saved on this intake." : "Could not save signature.");
    if (res.ok) await load();
  }

  async function emailClient() {
    setBusy(true);
    setMessage("");
    const res = await fetch(`/api/provider/intake/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "email-client" }),
    });
    setBusy(false);
    setMessage(res.ok ? "Signed PDF emailed to the client." : "Could not email PDF. Sign first if needed.");
  }

  async function setClinicalStatus(status: string) {
    setBusy(true);
    setMessage("");
    const res = await fetch(`/api/provider/intake/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        statusNote,
        notifyPatient: true,
        createOrderDraft: status === "APPROVED" ? createOrderDraft : false,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "Could not update status.");
      return;
    }
    setMessage(
      `${data.statusLabel || "Status updated"}.${data.order ? ` Order draft ${data.order.orderNumber} created.` : ""} Patient notified.`,
    );
    await load();
  }

  if (!submission) {
    return <p className="text-sm text-[#6f6251]">{message || "Loading submission…"}</p>;
  }

  const payload = submission.payload;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={adminEyebrow}>Clinical intake</p>
          <h1 className={adminTitle}>{submission.fullName}</h1>
          <p className={adminMuted}>
            {submission.email} · {submission.phone}
            {submission.referredBy ? ` · Referred by ${submission.referredBy}` : ""}
          </p>
          <p className="mt-1 text-xs text-[#8a7d6c]">Ref {submission.id}</p>
        </div>
        <Link href="/provider/intake" className={adminBtnGhost}>
          ← All submissions
        </Link>
      </div>

      {message ? <p className="text-sm text-[#1b6568]">{message}</p> : null}

      <section className={`${adminPanel} space-y-2 p-5 text-sm text-[#5f5344]`}>
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Wellness Tech EHR</p>
        <p>
          This chart is copied into the central Wellness Tech record
          {field(payload, "ehrLocationLabel") !== "—" ? ` from ${field(payload, "ehrLocationLabel")}` : ""}. Assigned
          physician: {field(payload, "assignedProvider")}.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Patient completes the forms and checks the medical disclaimer.</li>
          <li>The chart is stored here and sent to the assigned physician. Only a medical director or supervising physician can prescribe peptides or order labs.</li>
          <li>The physician reviews the signed attestation that the information is true and correct.</li>
          <li>Request labs, or approve, build the therapy, and order peptides or medication.</li>
        </ol>
      </section>

      {canPrescribe ? (
        <IntakeTherapyPicker intakeSubmissionId={id} onSaved={() => void load()} />
      ) : (
        <section className={`${adminPanel} p-5 text-sm text-[#6f6251]`}>
          You can review this chart. Ordering labs, approving therapy, and prescribing peptides is limited to the medical director or supervising physician.
        </section>
      )}

      <IntakeMessageThread
        title="Request messages"
        hint="Tell the patient what else they need to deliver (labs, documents, clarifications). They can reply on this same request."
        placeholder="e.g. Please send fasting labs from the last 90 days, and confirm current medications…"
        submitLabel="Send to patient"
        selfAuthorRole="PROVIDER"
        selfAuthorLabel="Clinical team"
        reloadKey={id}
        loadMessages={async () => {
          const res = await fetch(`/api/provider/intake/${id}/messages`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Could not load messages.");
          return data.messages ?? [];
        }}
        sendMessage={async (body) => {
          const res = await fetch(`/api/provider/intake/${id}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body, notifyPatient: true }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Could not send message.");
          if (!data.message) throw new Error("Message was not returned from the server.");
          setMessage("Message sent and patient emailed.");
          // Soft-refresh intake metadata without remounting the thread
          void load();
          return data.message;
        }}
      />

      <section className={`${adminPanel} space-y-4 p-5`}>
        <div>
          <h2 className="font-serif text-xl text-[#1f1a15]">Clinical decision</h2>
          <p className="mt-1 text-sm text-[#6f6251]">
            Current status: <strong>{submission.status}</strong>. Approve creates an order draft and emails the
            patient. Needs labs / decline also notify the patient with your note (saved into the message thread).
          </p>
        </div>
        <label className="block text-xs uppercase tracking-[0.16em] text-[#8f6f3e]">
          Note with status change (optional)
          <textarea
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-[#e0d4c0] bg-white px-3 py-2 text-sm text-[#1f1a15]"
            placeholder="Optional note included when you change status…"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-[#6f6251]">
          <input
            type="checkbox"
            checked={createOrderDraft}
            onChange={(e) => setCreateOrderDraft(e.target.checked)}
            className="accent-[#8f6f3e]"
          />
          Create unpaid order draft when approving (links intake → database order)
        </label>
        <div className="flex flex-wrap gap-2">
          {STATUS_ACTIONS.filter((action) => canPrescribe || (action.value !== "NEEDS_LABS" && action.value !== "APPROVED")).map((action) => (
            <button
              key={action.value}
              type="button"
              disabled={busy}
              onClick={() => void setClinicalStatus(action.value)}
              className={action.value === "APPROVED" ? adminBtnPrimary : adminBtnGhost}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>

      <section className={`${adminPanel} grid gap-3 p-5 sm:grid-cols-2`}>
        <p className="text-sm"><span className="text-[#8f6f3e]">DOB:</span> {submission.dateOfBirth}</p>
        <p className="text-sm"><span className="text-[#8f6f3e]">Status:</span> {submission.status}</p>
        <p className="text-sm"><span className="text-[#8f6f3e]">Last physical:</span> {field(payload, "lastPhysicalDate")}</p>
        <p className="text-sm"><span className="text-[#8f6f3e]">Last bloodwork:</span> {field(payload, "lastBloodworkDate")}</p>
        <p className="text-sm sm:col-span-2"><span className="text-[#8f6f3e]">Bloodwork normal limits:</span> {field(payload, "bloodworkWithinNormalLimits")}</p>
        <p className="text-sm"><span className="text-[#8f6f3e]">Provider:</span> {field(payload, "assignedProvider")}</p>
        <p className="text-sm sm:col-span-2"><span className="text-[#8f6f3e]">Conditions:</span> {field(payload, "conditions")}</p>
        <p className="text-sm sm:col-span-2"><span className="text-[#8f6f3e]">Meds:</span> {field(payload, "prescriptionMedications")}</p>
        <p className="text-sm sm:col-span-2"><span className="text-[#8f6f3e]">GLP history:</span> {field(payload, "glpMedications")}</p>
        <p className="text-sm sm:col-span-2"><span className="text-[#8f6f3e]">Contraindications:</span> {field(payload, "contraindications")}</p>
      </section>

      <IntakeFullFormView submission={submission} payload={payload} />

      <section className={`${adminPanel} p-5`}>
        <h2 className="font-serif text-xl text-[#1f1a15]">Client signature</h2>
        <p className="mt-1 text-sm text-[#6f6251]">
          Printed name: {field(payload, "attestationName")} · Date: {field(payload, "attestationDate")}
        </p>
        {submission.clientSignatureDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={submission.clientSignatureDataUrl}
            alt="Client signature"
            className="mt-4 max-h-40 rounded-sm border border-[#efe6d8] bg-white p-2"
          />
        ) : (
          <p className="mt-3 text-sm text-[#7c2c2c]">No client signature on file.</p>
        )}
      </section>

      <section className={`${adminPanel} p-5`}>
        <h2 className="font-serif text-xl text-[#1f1a15]">Provider signature</h2>
        <p className="mt-1 text-sm text-[#6f6251]">
          Sign below to complete the clinical intake. Your saved signature is applied automatically when this chart is
          unsigned — or tap “Use saved signature”.
        </p>
        {savedSignature ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-[#efe6d8] bg-[#fffaf3] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={savedSignature} alt="Saved signature preview" className="h-12 max-w-[180px] object-contain" />
            <button type="button" disabled={!canPrescribe} onClick={useSavedSignature} className={adminBtnGhost}>
              Use saved signature
            </button>
            <Link href="/provider/profile" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
              Manage on profile
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-xs text-[#8f6f3e]">
            No profile signature yet — draw once and save it as your default below.{" "}
            <Link href="/provider/profile" className="underline">
              Open profile
            </Link>
          </p>
        )}
        <div className="mt-4">
          <SignaturePad value={signature} onChange={setSignature} label={`${signerName} signature`} />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-[#6f6251]">
          <input
            type="checkbox"
            checked={saveAsDefault || !savedSignature}
            onChange={(e) => setSaveAsDefault(e.target.checked)}
            className="accent-[#8f6f3e]"
            disabled={!canPrescribe}
          />
          Save as my default signature for future intakes
        </label>
        {submission.providerSignedAt ? (
          <p className="mt-2 text-xs text-[#6f6251]">
            On this chart: {new Date(submission.providerSignedAt).toLocaleString()}
            {submission.providerSignedName ? ` as ${submission.providerSignedName}` : ""}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy || !canPrescribe} onClick={() => void saveSignature()} className={adminBtnPrimary}>
            Save signature
          </button>
          <a href={`/api/provider/intake/${id}/pdf`} className={adminBtnGhost}>
            Download PDF
          </a>
          <button type="button" disabled={busy} onClick={() => void emailClient()} className={adminBtnGhost}>
            Email signed PDF to client
          </button>
        </div>
      </section>
    </div>
  );
}
