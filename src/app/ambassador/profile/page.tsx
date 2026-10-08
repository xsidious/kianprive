"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  adminBtnPrimary,
  adminEyebrow,
  adminInput,
  adminMuted,
  adminPanel,
  adminTitle,
} from "@/components/admin/ui";

type PartnerMe = {
  displayName: string;
  bio: string | null;
  phone: string | null;
  payoutMethod: string | null;
  payoutDetails: Record<string, unknown> | null;
  partnerCode: string;
  type: string;
  status: string;
};

export default function AmbassadorProfilePage() {
  const [partner, setPartner] = useState<PartnerMe | null>(null);
  const [referralBookingUrl, setReferralBookingUrl] = useState("");
  const [referralShopUrl, setReferralShopUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutNote, setPayoutNote] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    void fetch("/api/partner/me").then(async (res) => {
      if (!res.ok) return;
      const payload = (await res.json()) as {
        partner: PartnerMe;
        referralBookingUrl: string;
        referralShopUrl: string;
      };
      setPartner(payload.partner);
      setReferralBookingUrl(payload.referralBookingUrl);
      setReferralShopUrl(payload.referralShopUrl);
      setPhone(payload.partner.phone ?? "");
      setBio(payload.partner.bio ?? "");
      setPayoutMethod(payload.partner.payoutMethod ?? "");
      setPayoutNote(String((payload.partner.payoutDetails as { note?: string } | null)?.note ?? ""));
    });
  }, []);

  async function save() {
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
    setStatus(res.ok ? "Profile saved." : "Could not save.");
    if (res.ok) {
      const payload = (await res.json()) as { partner: PartnerMe };
      setPartner(payload.partner);
    }
  }

  async function copyLink(label: string, path: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setStatus("Could not copy — select the link manually.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Account</p>
        <h1 className={adminTitle}>Profile & payouts</h1>
        <p className={adminMuted}>Contact details, payout preferences, and your referral links.</p>
      </div>
      {status ? <p className="text-sm text-[#1b6568]">{status}</p> : null}

      <section className={`${adminPanel} p-5`}>
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">
          {partner?.type} · {partner?.status} · CODE {partner?.partnerCode}
        </p>
        <h2 className="mt-1 font-serif text-2xl text-[#1f1a15]">{partner?.displayName ?? "—"}</h2>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#6f6251]">Booking:</span>
            <Link href={referralBookingUrl} className="text-[#8f6f3e] underline">
              {referralBookingUrl}
            </Link>
            <button type="button" className="rounded-sm border border-[#e4d9c8] px-2 py-1 text-xs" onClick={() => void copyLink("booking", referralBookingUrl)}>
              {copied === "booking" ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#6f6251]">Shop:</span>
            <Link href={referralShopUrl} className="text-[#8f6f3e] underline">
              {referralShopUrl}
            </Link>
            <button type="button" className="rounded-sm border border-[#e4d9c8] px-2 py-1 text-xs" onClick={() => void copyLink("shop", referralShopUrl)}>
              {copied === "shop" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

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
            />
          </label>
        </div>
        <button type="button" disabled={busy} onClick={() => void save()} className={`${adminBtnPrimary} mt-4`}>
          Save profile
        </button>
      </section>
    </div>
  );
}
