"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PortalSignOut } from "@/components/auth/PortalSignOut";

type IntakeRow = {
  referenceId: string;
  fullName: string;
  status: string;
  statusLabel: string;
  statusNote: string | null;
  submittedAt: string;
  updatedAt: string;
  orders: Array<{ orderNumber: string; paymentStatus: string; status: string; total: number }>;
};

export default function MemberIntakePage() {
  const [intakes, setIntakes] = useState<IntakeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/member/intake");
      if (!res.ok) {
        setError("Could not load your intake requests.");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { intakes: IntakeRow[] };
      setIntakes(data.intakes ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f6f3e]">Members</p>
          <h1 className="mt-2 font-serif text-3xl text-[#1f1a15]">My clinical intake</h1>
          <p className="mt-2 text-sm text-[#6f6251]">
            Track Provider Connect / Wellness Hub requests linked to your account.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="rounded-full border border-[#d8cbb5] px-4 py-2 text-sm text-[#6f6251]">
            Dashboard
          </Link>
          <PortalSignOut />
        </div>
      </div>

      {loading ? <p className="mt-8 text-sm text-[#6f6251]">Loading…</p> : null}
      {error ? <p className="mt-8 text-sm text-red-700">{error}</p> : null}

      {!loading && !error && intakes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#e7dcc8] bg-[#fcfaf6] p-6 text-sm text-[#6f6251]">
          No intake requests found yet. After you submit on Wellness Hub, they will appear here.
          <div className="mt-4">
            <Link href="/track-intake" className="text-[#8f6f3e] underline underline-offset-2">
              Track with email + reference ID
            </Link>
          </div>
        </div>
      ) : null}

      <ul className="mt-8 space-y-4">
        {intakes.map((row) => (
          <li key={row.referenceId} className="rounded-2xl border border-[#e7dcc8] bg-white p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">{row.statusLabel}</p>
            <h2 className="mt-1 font-serif text-xl text-[#1f1a15]">{row.fullName}</h2>
            <p className="mt-1 text-xs text-[#8a7d6c]">Ref {row.referenceId}</p>
            {row.statusNote ? (
              <p className="mt-3 rounded-lg bg-[#fcfaf6] px-3 py-2 text-sm text-[#1f1a15]">
                Note: {row.statusNote}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-[#8a7d6c]">
              Submitted {new Date(row.submittedAt).toLocaleString()} · Updated{" "}
              {new Date(row.updatedAt).toLocaleString()}
            </p>
            {row.orders.length > 0 ? (
              <ul className="mt-3 space-y-1 text-sm text-[#1f1a15]">
                {row.orders.map((order) => (
                  <li key={order.orderNumber}>
                    Order {order.orderNumber}: {order.paymentStatus} / {order.status}
                    {order.total > 0 ? ` · $${order.total.toFixed(2)}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
