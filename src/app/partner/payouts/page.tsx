"use client";

import { useEffect, useState } from "react";
import {
  money,
  partnerBtnGhost,
  partnerEyebrow,
  partnerMuted,
  partnerPanel,
  partnerTitle,
} from "@/components/partner/ui";

type Payout = {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number | string;
  status: string;
  paidAt: string | null;
  entries: { id: string }[];
};

export default function PartnerPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);

  useEffect(() => {
    void fetch("/api/partner/payouts").then(async (res) => {
      if (!res.ok) return;
      const payload = (await res.json()) as { payouts: Payout[] };
      setPayouts(payload.payouts);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className={partnerEyebrow}>FINANCE</p>
        <h1 className={partnerTitle}>Payouts</h1>
        <p className={partnerMuted}>Payout history and full line-item statements.</p>
      </div>
      <div className="space-y-3">
        {payouts.map((p) => (
          <article
            key={p.id}
            className={`flex flex-wrap items-center justify-between gap-3 ${partnerPanel} p-4`}
          >
            <div>
              <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">{p.status}</p>
              <p className="text-lg text-[#1f1a15]">
                {new Date(p.periodStart).toLocaleDateString()} – {new Date(p.periodEnd).toLocaleDateString()}
              </p>
              <p className="text-sm text-[#6f6251]">
                {money(p.totalAmount)} · {p.entries.length} lines
                {p.paidAt ? ` · Paid ${new Date(p.paidAt).toLocaleDateString()}` : ""}
              </p>
            </div>
            <a href={`/api/partner/payouts/${p.id}`} className={partnerBtnGhost}>
              Download statement
            </a>
          </article>
        ))}
        {!payouts.length ? <p className="text-sm text-[#6f6251]">No payouts yet.</p> : null}
      </div>
    </div>
  );
}
