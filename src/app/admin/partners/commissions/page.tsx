"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Entry = {
  id: string;
  description: string | null;
  sourceType: string;
  grossAmount: number | string;
  commissionPct: number | string;
  commissionAmount: number | string;
  status: string;
  earnedAt: string;
  partner: { displayName: string; partnerCode: string };
};

type PartnerOption = { id: string; displayName: string };

export default function AdminPartnerCommissionsPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [partnerId, setPartnerId] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (partnerId) params.set("partnerId", partnerId);
    if (status) params.set("status", status);
    const qs = params.toString() ? `?${params}` : "";
    const res = await fetch(`/api/admin/partners/commissions${qs}`);
    if (res.ok) {
      const payload = (await res.json()) as { entries: Entry[] };
      setEntries(payload.entries ?? []);
    }
  }

  useEffect(() => {
    void fetch("/api/admin/partners")
      .then((r) => r.json())
      .then((payload: { partners: PartnerOption[] }) => setPartners(payload.partners ?? []));
  }, []);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId, status]);

  async function setEntryStatus(id: string, next: string) {
    setMessage("");
    const res = await fetch("/api/admin/partners/commissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    setMessage(res.ok ? "Updated." : "Update failed.");
    if (res.ok) await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl text-[#1f1a15]">Partner Commissions</h1>
          <p className="mt-2 text-[#6f6251]">Filter, review, and void ledger entries across the network.</p>
        </div>
        <Link href="/admin/partners" className="rounded-sm border border-[#b78d4b80] bg-white px-4 py-2 text-sm">
          Back to partners
        </Link>
      </div>
      {message ? <p className="text-sm text-[#8f6f3e]">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        <select
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] px-3 py-2 text-sm"
        >
          <option value="">All partners</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.displayName}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {["PENDING", "ELIGIBLE", "INCLUDED_IN_PAYOUT", "VOID"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-sm border border-[#b78d4b2d] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#fffaf2] text-xs tracking-[0.12em] text-[#8f6f3e]">
            <tr>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Gross</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-[#e4d9c8]">
                <td className="px-4 py-3">{entry.partner.displayName}</td>
                <td className="px-4 py-3">{entry.description}</td>
                <td className="px-4 py-3">{entry.sourceType}</td>
                <td className="px-4 py-3">${Number(entry.grossAmount).toFixed(2)}</td>
                <td className="px-4 py-3">{Number(entry.commissionPct)}%</td>
                <td className="px-4 py-3">${Number(entry.commissionAmount).toFixed(2)}</td>
                <td className="px-4 py-3">{entry.status}</td>
                <td className="px-4 py-3">
                  {entry.status !== "VOID" && entry.status !== "INCLUDED_IN_PAYOUT" ? (
                    <button
                      type="button"
                      className="text-[#7c2c2c] underline"
                      onClick={() => void setEntryStatus(entry.id, "VOID")}
                    >
                      Void
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!entries.length ? <p className="p-4 text-sm text-[#6f6251]">No entries match.</p> : null}
      </div>
    </div>
  );
}
