"use client";

import { useEffect, useState } from "react";
import { SignaturePad } from "@/components/intake/SignaturePad";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminEyebrow,
  adminInput,
  adminMuted,
  adminPanel,
  adminTitle,
} from "@/components/admin/ui";

type PartnerMe = {
  displayName: string;
  specialty: string | null;
  bio: string | null;
  phone: string | null;
  payoutMethod: string | null;
  payoutDetails: Record<string, unknown> | null;
  partnerCode: string;
  type: string;
  status: string;
  npi: string | null;
  credentialsTitle: string | null;
  signatureDataUrl: string | null;
  signatureUpdatedAt: string | null;
};

export default function ProviderProfilePage() {
  const [partner, setPartner] = useState<PartnerMe | null>(null);
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutNote, setPayoutNote] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/partner/me");
    if (!res.ok) return;
    const payload = (await res.json()) as { partner: PartnerMe };
    setPartner(payload.partner);
    setPhone(payload.partner.phone ?? "");
    setBio(payload.partner.bio ?? "");
    setPayoutMethod(payload.partner.payoutMethod ?? "");
    setPayoutNote(String((payload.partner.payoutDetails as { note?: string } | null)?.note ?? ""));
    setSignature(payload.partner.signatureDataUrl);
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveProfile() {
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/partner/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        bio,
        payoutMethod,
        payoutDetails: { note: payoutNote },
      }),
    });
    setBusy(false);
    setStatus(res.ok ? "Profile saved." : "Could not save profile.");
    if (res.ok) await load();
  }

  async function saveSignature() {
    if (!signature) {
      setStatus("Draw or keep a signature before saving.");
      return;
    }
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/partner/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signatureDataUrl: signature }),
    });
    setBusy(false);
    setStatus(res.ok ? "Saved signature — it will auto-fill on new intake reviews." : "Could not save signature.");
    if (res.ok) await load();
  }

  async function clearSignature() {
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/partner/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearSignature: true }),
    });
    setBusy(false);
    setSignature(null);
    setStatus(res.ok ? "Saved signature cleared." : "Could not clear signature.");
    if (res.ok) await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Account</p>
        <h1 className={adminTitle}>Profile & signature</h1>
        <p className={adminMuted}>
          Contact, payout preferences, and your reusable clinical signature so you do not redraw it on every intake.
        </p>
      </div>
      {status ? <p className="text-sm text-[#1b6568]">{status}</p> : null}

      <section className={`${adminPanel} p-5`}>
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">
          {partner?.type} · {partner?.status} · CODE {partner?.partnerCode}
        </p>
        <h2 className="mt-1 font-serif text-2xl text-[#1f1a15]">{partner?.displayName ?? "—"}</h2>
        <p className="text-sm text-[#6f6251]">
          {[partner?.credentialsTitle, partner?.specialty].filter(Boolean).join(" · ") || "Specialty managed by admin"}
        </p>
        {partner?.npi ? <p className="mt-1 text-xs text-[#8f6f3e]">NPI {partner.npi}</p> : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
            Phone
            <input className={`${adminInput} mt-1.5`} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="block text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
            Payout method
            <input
              className={`${adminInput} mt-1.5`}
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value)}
              placeholder="ACH, Zelle, check…"
            />
          </label>
          <label className="block text-xs uppercase tracking-[0.14em] text-[#8f6f3e] sm:col-span-2">
            Bio
            <textarea className={`${adminInput} mt-1.5 min-h-[88px]`} value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>
          <label className="block text-xs uppercase tracking-[0.14em] text-[#8f6f3e] sm:col-span-2">
            Payout details
            <textarea
              className={`${adminInput} mt-1.5 min-h-[72px]`}
              value={payoutNote}
              onChange={(e) => setPayoutNote(e.target.value)}
              placeholder="Account tip / routing note for finance"
            />
          </label>
        </div>
        <button type="button" disabled={busy} onClick={() => void saveProfile()} className={`${adminBtnPrimary} mt-4`}>
          Save profile
        </button>
      </section>

      <section className={`${adminPanel} p-5`}>
        <h2 className="font-serif text-xl text-[#1f1a15]">Saved clinical signature</h2>
        <p className="mt-1 text-sm text-[#6f6251]">
          Used automatically when you open an unsigned intake. You can still redraw for a single case.
        </p>
        {partner?.signatureUpdatedAt ? (
          <p className="mt-2 text-xs text-[#8f6f3e]">
            Last updated {new Date(partner.signatureUpdatedAt).toLocaleString()}
          </p>
        ) : (
          <p className="mt-2 text-xs text-[#8f6f3e]">No saved signature yet.</p>
        )}
        <div className="mt-4">
          <SignaturePad value={signature} onChange={setSignature} label={`${partner?.displayName || "Provider"} signature`} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => void saveSignature()} className={adminBtnPrimary}>
            Save as my signature
          </button>
          <button type="button" disabled={busy || !partner?.signatureDataUrl} onClick={() => void clearSignature()} className={adminBtnGhost}>
            Clear saved signature
          </button>
        </div>
      </section>
    </div>
  );
}
