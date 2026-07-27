"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function ProviderEarningsPage() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "SERVICE" | "PRODUCT">("all");

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

  const visible = useMemo(
    () => (filter === "all" ? ledger : ledger.filter((e) => e.sourceType === filter)),
    [ledger, filter],
  );

  const filteredSummary = useMemo(() => {
    const rows = visible;
    return {
      gross: rows.reduce((s, e) => s + Number(e.grossAmount), 0),
      commission: rows.reduce((s, e) => s + Number(e.commissionAmount), 0),
      pending: rows.filter((e) => e.status === "PENDING").reduce((s, e) => s + Number(e.commissionAmount), 0),
      eligible: rows.filter((e) => e.status === "ELIGIBLE").reduce((s, e) => s + Number(e.commissionAmount), 0),
    };
  }, [visible]);

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Finance</p>
        <h1 className={adminTitle}>Earnings</h1>
        <p className={adminMuted}>
          Pay for completed consultations & telemedicine, plus shop product referrals. Prescription products and
          prescription service pathways are never included.
        </p>
      </div>
      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["SERVICE", "Consultations / telemedicine"],
            ["PRODUCT", "Products"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-sm border px-3 py-2 text-sm ${
              filter === value ? "border-[#b78d4b] bg-[#fff6e8] text-[#8f6f3e]" : "border-[#e4d9c8] bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Attributed gross", filteredSummary.gross],
          ["Total commission", filteredSummary.commission],
          ["Eligible for payout", filteredSummary.eligible],
          ["Pending", filteredSummary.pending],
        ].map(([label, value]) => (
          <div key={String(label)} className={adminStat}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">{label}</p>
            <p className="mt-2 font-serif text-2xl text-[#1f1a15]">{money(value)}</p>
          </div>
        ))}
      </div>
      {summary ? (
        <p className="text-xs text-[#6f6251]">
          Lifetime ledger (all sources): {money(summary.commission)} commission across {ledger.length} entries.
        </p>
      ) : null}
      <div className={`${adminPanel} overflow-hidden`}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#efe6d8] bg-[#fffaf2] text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Gross</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Pay</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((entry) => (
              <tr key={entry.id} className="border-b border-[#f0e8db]">
                <td className="px-4 py-3 text-[#6f6251]">{new Date(entry.earnedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-[#8f6f3e]">
                  {entry.sourceType === "SERVICE" ? "Consult / telemed" : "Product"}
                </td>
                <td className="px-4 py-3 text-[#1f1a15]">{entry.description ?? "—"}</td>
                <td className="px-4 py-3">{money(entry.grossAmount)}</td>
                <td className="px-4 py-3">{Number(entry.commissionPct)}%</td>
                <td className="px-4 py-3">{money(entry.commissionAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(entry.status)}`}>
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
            {!visible.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#6f6251]">
                  No earnings yet. Complete consultations or share your shop link for product referrals.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
