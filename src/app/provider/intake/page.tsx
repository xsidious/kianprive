"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminBtnGhost, adminEyebrow, adminMuted, adminPanel, adminStat, adminTitle, statusTone } from "@/components/admin/ui";

type Row = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  referredBy: string | null;
  createdAt: string;
  hasClientSignature: boolean;
  hasProviderSignature: boolean;
  providerSignedAt: string | null;
  payload?: Record<string, unknown> | null;
};

export default function ProviderIntakeListPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/provider/intake")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load intake submissions.");
        const payload = (await res.json()) as { submissions: Row[] };
        setRows(payload.submissions ?? []);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const pendingSign = rows.filter((r) => r.hasClientSignature && !r.hasProviderSignature).length;

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Clinical intake</p>
        <h1 className={adminTitle}>Wellness Hub submissions</h1>
        <p className={adminMuted}>
          Review client intakes, add your provider signature, download the dual-signed PDF, and email it to the client.
        </p>
      </div>

      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Total</p>
          <p className="mt-2 font-serif text-3xl">{rows.length}</p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Awaiting your signature</p>
          <p className="mt-2 font-serif text-3xl">{pendingSign}</p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Fully signed</p>
          <p className="mt-2 font-serif text-3xl">{rows.filter((r) => r.hasProviderSignature).length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className={`${adminPanel} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(row.status)}`}>
                    {row.status}
                  </span>
                  {row.hasClientSignature ? (
                    <span className="rounded-full bg-[#eef6f3] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#1b6568]">
                      Client signed
                    </span>
                  ) : null}
                  {row.hasProviderSignature ? (
                    <span className="rounded-full bg-[#fff6e8] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#8f6f3e]">
                      Provider signed
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#f8ecec] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#7c2c2c]">
                      Needs provider signature
                    </span>
                  )}
                </div>
                <h2 className="mt-2 font-serif text-2xl text-[#1f1a15]">{row.fullName}</h2>
                <p className="text-sm text-[#6f6251]">
                  {row.email} · {row.phone}
                </p>
                <p className="mt-1 text-sm text-[#6f6251]">
                  Submitted {new Date(row.createdAt).toLocaleString()}
                  {row.referredBy ? ` · Referred by ${row.referredBy}` : ""}
                </p>
              </div>
              <Link href={`/provider/intake/${row.id}`} className={adminBtnGhost}>
                Open & sign
              </Link>
            </div>
          </article>
        ))}
        {!rows.length && !error ? (
          <p className={`${adminPanel} p-6 text-sm text-[#6f6251]`}>No Wellness Hub intakes yet.</p>
        ) : null}
      </div>
    </div>
  );
}
