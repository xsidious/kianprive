"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  partnerBtnPrimary,
  partnerEyebrow,
  partnerInput,
  partnerMuted,
  partnerPanel,
  partnerTitle,
} from "@/components/partner/ui";

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
  onboardingComplete: boolean;
  legalName: string | null;
};

export default function PartnerProfilePage() {
  const [partner, setPartner] = useState<PartnerMe | null>(null);
  const [referralBookingUrl, setReferralBookingUrl] = useState("");
  const [referralShopUrl, setReferralShopUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutNote, setPayoutNote] = useState("");
  const [status, setStatus] = useState("");
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
    setStatus(res.ok ? "Profile saved." : "Could not save.");
    if (res.ok) {
      const payload = (await res.json()) as { partner: PartnerMe };
      setPartner(payload.partner);
    }
  }

  async function copyLink(label: string, path: string) {
    const absolute = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setStatus("Could not copy — select the link manually.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className={partnerEyebrow}>ACCOUNT</p>
        <h1 className={partnerTitle}>Profile</h1>
        <p className={partnerMuted}>Contact, payout preferences, and referral links.</p>
      </div>
      {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}

      <section className={`${partnerPanel} p-5`}>
        <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">
          {partner?.type} · {partner?.status} · CODE {partner?.partnerCode}
        </p>
        <h2 className="mt-1 text-2xl text-[#1f1a15]">{partner?.displayName ?? "—"}</h2>
        {partner?.legalName ? <p className="text-sm text-[#6f6251]">Legal: {partner.legalName}</p> : null}
        <p className="text-sm text-[#6f6251]">{partner?.specialty || "Specialty managed by admin"}</p>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#6f6251]">Booking referral:</span>
            <Link href={referralBookingUrl} className="text-[#8f6f3e] underline">
              {referralBookingUrl}
            </Link>
            <button
              type="button"
              className="rounded-sm border border-[#e4d9c8] px-2 py-1 text-xs"
              onClick={() => void copyLink("booking", referralBookingUrl)}
            >
              {copied === "booking" ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#6f6251]">Shop referral:</span>
            <Link href={referralShopUrl} className="text-[#8f6f3e] underline">
              {referralShopUrl}
            </Link>
            <button
              type="button"
              className="rounded-sm border border-[#e4d9c8] px-2 py-1 text-xs"
              onClick={() => void copyLink("shop", referralShopUrl)}
            >
              {copied === "shop" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </section>

      <section className={`grid gap-3 ${partnerPanel} p-5 md:grid-cols-2`}>
        <label className="text-sm">
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={partnerInput} />
        </label>
        <label className="text-sm">
          Payout method
          <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} className={partnerInput}>
            <option value="">Select…</option>
            <option value="Wire">Wire transfer</option>
            <option value="PayPal">PayPal</option>
            <option value="Check">Check</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className={partnerInput} />
        </label>
        <label className="text-sm md:col-span-2">
          Payout details note
          <textarea
            value={payoutNote}
            onChange={(e) => setPayoutNote(e.target.value)}
            rows={2}
            placeholder="Account holder, last 4 of account, PayPal email, etc."
            className={partnerInput}
          />
        </label>
        <button type="button" onClick={() => void save()} className={`${partnerBtnPrimary} md:col-span-2`}>
          Save profile
        </button>
      </section>
    </div>
  );
}
