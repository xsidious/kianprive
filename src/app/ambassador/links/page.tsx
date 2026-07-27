"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ambassadorReferralLinks, qrCodeImageUrl } from "@/lib/ambassador";
import { adminBtnGhost, adminEyebrow, adminMuted, adminPanel, adminTitle } from "@/components/admin/ui";

export default function AmbassadorLinksPage() {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/partner/dashboard")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load referral tools");
        const payload = (await res.json()) as { onboarding: { partnerCode: string } };
        setCode(payload.onboarding.partnerCode);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const links = code ? ambassadorReferralLinks(code) : null;

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Share</p>
        <h1 className={adminTitle}>Links & QR</h1>
        <p className={adminMuted}>Send customers your shop link or QR. Purchases attribute to your ambassador code.</p>
      </div>
      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}
      {links ? (
        <div className={`${adminPanel} grid gap-6 p-5 md:grid-cols-[180px_1fr]`}>
          <div className="rounded-sm border border-[#efe6d8] bg-white p-3">
            <Image src={qrCodeImageUrl(links.shop, 240)} alt="Ambassador QR" width={240} height={240} unoptimized className="h-auto w-full" />
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Your code</p>
              <p className="mt-1 font-mono text-2xl text-[#1f1a15]">{links.code}</p>
              <button type="button" className={`${adminBtnGhost} mt-2`} onClick={() => void copy("code", links.code)}>
                {copied === "code" ? "Copied" : "Copy code"}
              </button>
            </div>
            {[
              ["Shop link", links.shop, "shop"],
              ["Home link", links.home, "home"],
              ["Book online", links.book, "book"],
            ].map(([label, value, key]) => (
              <div key={key}>
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">{label}</p>
                <p className="mt-1 break-all text-[#2b2218]">{value}</p>
                <button type="button" className={`${adminBtnGhost} mt-2`} onClick={() => void copy(String(key), String(value))}>
                  {copied === key ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#6f6251]">Loading…</p>
      )}
    </div>
  );
}
