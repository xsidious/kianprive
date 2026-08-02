"use client";

import { useEffect, useState } from "react";
import { BrandedQrCard } from "@/components/ambassador/BrandedQrCard";
import { providerBookingLinks } from "@/lib/provider";
import { adminBtnGhost, adminEyebrow, adminMuted, adminPanel, adminTitle } from "@/components/admin/ui";

type LinkTarget = "shop" | "home" | "book" | "telemedicine" | "services";

export default function ProviderLinksPage() {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [target, setTarget] = useState<LinkTarget>("book");

  useEffect(() => {
    void fetch("/api/partner/dashboard")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load referral tools");
        const payload = (await res.json()) as { onboarding: { partnerCode: string } };
        setCode(payload.onboarding.partnerCode);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const links = code ? providerBookingLinks(code) : null;
  const qrValue = links ? links[target] : "";

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Share</p>
        <h1 className={adminTitle}>Links & QR</h1>
        <p className={adminMuted}>
          Share your practitioner code for consultations, telemedicine, and shop product referrals. Visitors who open
          your link are tracked for 30 days.
        </p>
      </div>
      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}
      {links ? (
        <div className={`${adminPanel} grid gap-6 p-5 lg:grid-cols-[300px_1fr]`}>
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {(
                [
                  ["book", "Book"],
                  ["telemedicine", "Telemedicine"],
                  ["shop", "Shop"],
                  ["home", "Home"],
                  ["services", "Services"],
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
              label={
                target === "telemedicine"
                  ? "Scan for telemedicine"
                  : target === "book"
                    ? "Scan to book"
                    : target === "shop"
                      ? "Scan to shop"
                      : target === "services"
                        ? "Scan for services"
                        : "Scan to visit"
              }
              filename={`kian-prive-${links.code}-${target}.png`}
            />
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Your practitioner code</p>
              <p className="mt-1 font-mono text-2xl text-[#1f1a15]">{links.code}</p>
              <button type="button" className={`${adminBtnGhost} mt-2`} onClick={() => void copy("code", links.code)}>
                {copied === "code" ? "Copied" : "Copy code"}
              </button>
            </div>
            {(
              [
                ["Book online", links.book, "book"],
                ["Telemedicine", links.telemedicine, "telemedicine"],
                ["Shop link", links.shop, "shop"],
                ["Home link", links.home, "home"],
                ["Services link", links.services, "services"],
              ] as const
            ).map(([label, value, key]) => (
              <div key={key}>
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">{label}</p>
                <p className="mt-1 break-all text-[#2b2218]">{value}</p>
                <button type="button" className={`${adminBtnGhost} mt-2`} onClick={() => void copy(key, value)}>
                  {copied === key ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
            <p className="rounded-2xl bg-[#fff6e8] px-4 py-3 text-xs leading-relaxed text-[#6f6251]">
              Book / telemedicine links attribute consultations to your code. Shop QR / links attribute eligible product
              purchases. Prescription items do not earn practitioner product commission.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#6f6251]">Loading…</p>
      )}
    </div>
  );
}
