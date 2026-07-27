"use client";

import { useEffect, useState } from "react";
import { BrandedQrCard } from "@/components/ambassador/BrandedQrCard";
import { ambassadorReferralLinks } from "@/lib/ambassador";
import { adminBtnGhost, adminEyebrow, adminMuted, adminPanel, adminTitle } from "@/components/admin/ui";

export default function AmbassadorLinksPage() {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [target, setTarget] = useState<"shop" | "home" | "book">("shop");

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
  const qrValue = links ? links[target] : "";

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
        <p className={adminMuted}>
          Your code works for shop purchases and book-online referrals. Customers who open your link are tracked for 30
          days.
        </p>
      </div>
      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}
      {links ? (
        <div className={`${adminPanel} grid gap-6 p-5 lg:grid-cols-[300px_1fr]`}>
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {(
                [
                  ["shop", "Shop"],
                  ["home", "Home"],
                  ["book", "Book"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTarget(key)}
                  className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] ${
                    target === key ? "bg-[#8a682e] text-white" : "border border-[#cbb58f] text-[#6f5a3a]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <BrandedQrCard
              value={qrValue}
              label={target === "book" ? "Scan to book" : target === "home" ? "Scan to visit" : "Scan to shop"}
              filename={`kian-prive-${links.code}-${target}.png`}
            />
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
            <p className="rounded-2xl bg-[#fff6e8] px-4 py-3 text-xs leading-relaxed text-[#6f6251]">
              Yes — these codes work. When someone buys through your shop link/QR, the order appears in Sales and
              Earnings. When they book with your book link, the booking is attributed to your code as well.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#6f6251]">Loading…</p>
      )}
    </div>
  );
}
