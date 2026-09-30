"use client";

import { useEffect, useState } from "react";
import { ClinicalIntakeShare } from "@/components/account/ClinicalIntakeQr";
import { partnerEyebrow, partnerMuted, partnerTitle } from "@/components/partner/ui";

export default function PartnerIntakeLinkPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/partner/dashboard")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load your intake link.");
        const payload = (await res.json()) as { onboarding: { partnerCode: string } };
        setCode(payload.onboarding.partnerCode);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className={partnerEyebrow}>SHARE</p>
        <h1 className={partnerTitle}>Clinical intake</h1>
        <p className={partnerMuted}>
          Give customers this Privé Therapeutics link or QR code so they can complete the clinical intake.
        </p>
      </div>
      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}
      {code ? <ClinicalIntakeShare code={code} /> : <p className="text-sm text-[#6f6251]">Loading…</p>}
    </div>
  );
}
