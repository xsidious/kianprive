"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminBtnGhost, adminEyebrow, adminMuted, adminPanel, adminStat, adminTitle, statusTone } from "@/components/admin/ui";
import { INTAKE_QUEUES, INTAKE_STATUS_LABELS, intakeQueue, type IntakeQueue } from "@/lib/intake/tracking";

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
  const grouped: Record<IntakeQueue, Row[]> = { IN_REVIEW: [], APPROVED: [], OTHER: [] };
  for (const row of rows) grouped[intakeQueue(row.status)].push(row);

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Clinical intake</p>
        <h1 className={adminTitle}>Wellness Hub submissions</h1>
        <p className={adminMuted}>
          Charts copied into Wellness Tech from each location. Review the signed forms, then order labs or approve therapy. Only a medical director or supervising physician can prescribe.
        </p>
      </div>

      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {INTAKE_QUEUES.map((queue) => (
          <div key={queue.id} className={adminStat}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">{queue.label}</p>
            <p className="mt-2 font-serif text-3xl">{grouped[queue.id].length}</p>
            <p className="mt-1 text-xs text-[#6f6251]">{queue.hint}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-[#6f6251]">
        {pendingSign} awaiting your signature · {rows.filter((r) => r.hasProviderSignature).length} fully signed
      </p>

      <div className="space-y-8">
        {INTAKE_QUEUES.map((queue) => (
          <section key={queue.id} className="space-y-3">
            <h2 className="font-serif text-2xl text-[#1f1a15]">{queue.label}</h2>
            {grouped[queue.id].length === 0 ? (
              <p className={`${adminPanel} p-6 text-sm text-[#6f6251]`}>Nothing in {queue.label.toLowerCase()}.</p>
            ) : (
              grouped[queue.id].map((row) => (
          <article key={row.id} className={`${adminPanel} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(row.status)}`}>
                    {INTAKE_STATUS_LABELS[row.status as keyof typeof INTAKE_STATUS_LABELS] ?? row.status.replaceAll("_", " ")}
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
                  {typeof row.payload?.ehrLocationLabel === "string" ? `${row.payload.ehrLocationLabel} · ` : ""}
                  Submitted {new Date(row.createdAt).toLocaleString()}
                  {row.referredBy ? ` · Referred by ${row.referredBy}` : ""}
                </p>
              </div>
              <Link href={`/provider/intake/${row.id}`} className={adminBtnGhost}>
                Open & sign
              </Link>
            </div>
          </article>
              ))
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
