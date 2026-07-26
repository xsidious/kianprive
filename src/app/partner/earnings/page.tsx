"use client";

import { useEffect, useState } from "react";
import {
  money,
  partnerBtnGhost,
  partnerBtnPrimary,
  partnerEyebrow,
  partnerInput,
  partnerMuted,
  partnerPanel,
  partnerTitle,
} from "@/components/partner/ui";

type LedgerEntry = {
  id: string;
  sourceType: string;
  description: string | null;
  grossAmount: number | string;
  commissionPct: number | string;
  commissionAmount: number | string;
  status: string;
  earnedAt: string;
};

export default function PartnerEarningsPage() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<{
    gross: number;
    commission: number;
    pending: number;
    eligible: number;
    included: number;
    bySource: { SERVICE: number; PRODUCT: number };
  } | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function load(nextFrom = from, nextTo = to) {
    const params = new URLSearchParams();
    if (nextFrom) params.set("from", new Date(nextFrom).toISOString());
    if (nextTo) {
      const end = new Date(nextTo);
      end.setHours(23, 59, 59, 999);
      params.set("to", end.toISOString());
    }
    const qs = params.toString() ? `?${params}` : "";
    const res = await fetch(`/api/partner/earnings${qs}`);
    if (!res.ok) return;
    const payload = (await res.json()) as { ledger: LedgerEntry[]; summary: typeof summary };
    setLedger(payload.ledger);
    setSummary(payload.summary);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exportCsv() {
    const header = "date,source,description,gross,rate,commission,status";
    const rows = ledger.map((e) =>
      [
        new Date(e.earnedAt).toISOString(),
        e.sourceType,
        `"${(e.description ?? "").replace(/"/g, '""')}"`,
        e.grossAmount,
        e.commissionPct,
        e.commissionAmount,
        e.status,
      ].join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "partner-earnings.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={partnerEyebrow}>FINANCE</p>
          <h1 className={partnerTitle}>Earnings</h1>
          <p className={partnerMuted}>Gross vs commission by service and product.</p>
        </div>
        <button type="button" onClick={exportCsv} className={partnerBtnGhost} disabled={!ledger.length}>
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={partnerInput} />
        </label>
        <label className="text-sm">
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={partnerInput} />
        </label>
        <button type="button" className={partnerBtnPrimary} onClick={() => void load()}>
          Apply
        </button>
        <button
          type="button"
          className={partnerBtnGhost}
          onClick={() => {
            setFrom("");
            setTo("");
            void load("", "");
          }}
        >
          Clear
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Gross attributed", summary?.gross],
          ["Total commission", summary?.commission],
          ["Eligible", summary?.eligible],
          ["Pending", summary?.pending],
          ["In payout", summary?.included],
        ].map(([label, value]) => (
          <article key={String(label)} className={`${partnerPanel} p-4`}>
            <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">{label}</p>
            <p className="mt-2 text-2xl text-[#1f1a15]">{money(Number(value ?? 0))}</p>
          </article>
        ))}
      </div>
      <p className="text-sm text-[#6f6251]">
        Services {money(summary?.bySource.SERVICE ?? 0)} · Products {money(summary?.bySource.PRODUCT ?? 0)}
      </p>
      <div className={`overflow-x-auto ${partnerPanel}`}>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e4d9c8] text-xs tracking-[0.14em] text-[#8f6f3e]">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Source</th>
              <th className="p-3">Description</th>
              <th className="p-3">Gross</th>
              <th className="p-3">Rate</th>
              <th className="p-3">Commission</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((e) => (
              <tr key={e.id} className="border-b border-[#f0e6d8]">
                <td className="p-3">{new Date(e.earnedAt).toLocaleDateString()}</td>
                <td className="p-3">{e.sourceType}</td>
                <td className="p-3">{e.description}</td>
                <td className="p-3">{money(e.grossAmount)}</td>
                <td className="p-3">{Number(e.commissionPct)}%</td>
                <td className="p-3">{money(e.commissionAmount)}</td>
                <td className="p-3">{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!ledger.length ? <p className="p-4 text-sm text-[#6f6251]">No ledger entries in this range.</p> : null}
      </div>
    </div>
  );
}
