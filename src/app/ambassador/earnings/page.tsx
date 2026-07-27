"use client";

import { useEffect, useState } from "react";
import { adminEyebrow, adminMuted, adminPanel, adminStat, adminTitle, statusTone } from "@/components/admin/ui";

type LedgerEntry = {
  id: string;
  description: string | null;
  grossAmount: number | string;
  commissionPct: number | string;
  commissionAmount: number | string;
  status: string;
  sourceType: string;
  earnedAt: string;
};

type Summary = {
  gross: number;
  commission: number;
  pending: number;
  eligible: number;
  included: number;
};

function money(value: number | string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export default function AmbassadorEarningsPage() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/partner/earnings")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load earnings");
        const payload = (await res.json()) as { ledger: LedgerEntry[]; summary: Summary };
        setLedger(payload.ledger);
        setSummary(payload.summary);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Finance</p>
        <h1 className={adminTitle}>Earnings</h1>
        <p className={adminMuted}>Commission ledger for product sales attributed to your ambassador code.</p>
      </div>
      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Gross attributed", summary?.gross],
          ["Total commission", summary?.commission],
          ["Eligible", summary?.eligible],
          ["Pending", summary?.pending],
        ].map(([label, value]) => (
          <div key={String(label)} className={adminStat}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">{label}</p>
            <p className="mt-2 font-serif text-2xl text-[#1f1a15]">{value == null ? "—" : money(value)}</p>
          </div>
        ))}
      </div>
      <div className={`${adminPanel} overflow-hidden`}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#efe6d8] bg-[#fffaf2] text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Gross</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((entry) => (
              <tr key={entry.id} className="border-b border-[#f0e8db]">
                <td className="px-4 py-3 text-[#6f6251]">{new Date(entry.earnedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-[#1f1a15]">{entry.description ?? entry.sourceType}</td>
                <td className="px-4 py-3">{money(entry.grossAmount)}</td>
                <td className="px-4 py-3">{Number(entry.commissionPct)}%</td>
                <td className="px-4 py-3">{money(entry.commissionAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(entry.status)}`}>
                    {entry.status.replaceAll("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
            {!ledger.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#6f6251]">
                  No commission entries yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
