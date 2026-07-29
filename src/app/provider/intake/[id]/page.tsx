"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SignaturePad } from "@/components/intake/SignaturePad";
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

export default function ProviderIntakeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch(`/api/provider/intake/${id}`);
    if (!res.ok) {
      setMessage("Could not load submission.");
      return;
    }
    const payload = (await res.json()) as { submission: Submission };
    setSubmission(payload.submission);
    setSignature(payload.submission.providerSignatureDataUrl);
  }

  useEffect(() => {
    void load();
  }, [id]);

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
        providerSignedName: "Dr. Carmen Ramirez",
      }),
    });
    setBusy(false);
    setMessage(res.ok ? "Signature saved." : "Could not save signature.");
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
        </div>
        <Link href="/provider/intake" className={adminBtnGhost}>
          ← All submissions
        </Link>
      </div>

      {message ? <p className="text-sm text-[#1b6568]">{message}</p> : null}

      <section className={`${adminPanel} grid gap-3 p-5 sm:grid-cols-2`}>
        <p className="text-sm"><span className="text-[#8f6f3e]">DOB:</span> {submission.dateOfBirth}</p>
        <p className="text-sm"><span className="text-[#8f6f3e]">Status:</span> {submission.status}</p>
        <p className="text-sm"><span className="text-[#8f6f3e]">Requested:</span> {field(payload, "requestedDate")} at {field(payload, "requestedTime")}</p>
        <p className="text-sm"><span className="text-[#8f6f3e]">Provider:</span> {field(payload, "assignedProvider")}</p>
        <p className="text-sm sm:col-span-2"><span className="text-[#8f6f3e]">Conditions:</span> {field(payload, "conditions")}</p>
        <p className="text-sm sm:col-span-2"><span className="text-[#8f6f3e]">Meds:</span> {field(payload, "prescriptionMedications")}</p>
        <p className="text-sm sm:col-span-2"><span className="text-[#8f6f3e]">GLP history:</span> {field(payload, "glpMedications")}</p>
        <p className="text-sm sm:col-span-2"><span className="text-[#8f6f3e]">Contraindications:</span> {field(payload, "contraindications")}</p>
      </section>

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
          Sign below to complete the clinical intake. You can then download or email the dual-signed PDF.
        </p>
        <div className="mt-4">
          <SignaturePad value={signature} onChange={setSignature} label="Dr. Carmen Ramirez signature" />
        </div>
        {submission.providerSignedAt ? (
          <p className="mt-2 text-xs text-[#6f6251]">
            Saved {new Date(submission.providerSignedAt).toLocaleString()}
            {submission.providerSignedName ? ` as ${submission.providerSignedName}` : ""}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => void saveSignature()} className={adminBtnPrimary}>
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
