"use client";

import { useEffect, useState } from "react";
import {
  money,
  partnerEyebrow,
  partnerMuted,
  partnerPanel,
  partnerTitle,
} from "@/components/partner/ui";

type Analytics = {
  byStatus: Record<string, number>;
  completionRate: number;
  topServices: { title: string; count: number }[];
  topProducts: { title: string; units: number }[];
  trend: { month: string; revenue: number; commission: number }[];
  totals: { bookings: number; eligibleCommission: number; paidProductRevenue: number };
};

export default function PartnerAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    void fetch("/api/partner/analytics").then(async (res) => {
      if (!res.ok) return;
      setData((await res.json()) as Analytics);
    });
  }, []);

  const maxTrend = Math.max(1, ...(data?.trend.map((t) => Math.max(t.revenue, t.commission)) ?? [1]));

  return (
    <div className="space-y-6">
      <div>
        <p className={partnerEyebrow}>INSIGHTS</p>
        <h1 className={partnerTitle}>Analytics</h1>
        <p className={partnerMuted}>Partner-scoped bookings, completion, and revenue trends.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <article className={`${partnerPanel} p-4`}>
          <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">BOOKINGS</p>
          <p className="mt-2 text-3xl">{data?.totals.bookings ?? "—"}</p>
        </article>
        <article className={`${partnerPanel} p-4`}>
          <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">COMPLETION RATE</p>
          <p className="mt-2 text-3xl">{data ? `${data.completionRate}%` : "—"}</p>
        </article>
        <article className={`${partnerPanel} p-4`}>
          <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">ELIGIBLE COMMISSION</p>
          <p className="mt-2 text-3xl">{money(data?.totals.eligibleCommission ?? 0)}</p>
        </article>
      </div>

      <section className={`${partnerPanel} p-5`}>
        <h2 className="text-xl text-[#1f1a15]">Revenue & commission trend</h2>
        <div className="mt-4 flex h-40 items-end gap-3">
          {(data?.trend ?? []).map((t) => (
            <div key={t.month} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-28 w-full items-end justify-center gap-1">
                <div
                  className="w-1/2 rounded-sm bg-[#e4d9c8]"
                  style={{ height: `${Math.max(4, (t.revenue / maxTrend) * 100)}%` }}
                  title={`Revenue ${money(t.revenue)}`}
                />
                <div
                  className="w-1/2 rounded-sm bg-[#b78d4b]"
                  style={{ height: `${Math.max(4, (t.commission / maxTrend) * 100)}%` }}
                  title={`Commission ${money(t.commission)}`}
                />
              </div>
              <span className="text-[10px] text-[#8f6f3e]">{t.month.slice(5)}</span>
            </div>
          ))}
          {!data?.trend?.length ? <p className="text-sm text-[#6f6251]">Not enough history yet.</p> : null}
        </div>
        <p className="mt-2 text-xs text-[#6f6251]">Cream = attributed revenue · Gold = commission</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className={`${partnerPanel} p-5`}>
          <h2 className="text-xl">By status</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.entries(data?.byStatus ?? {}).map(([status, count]) => (
              <li key={status} className="flex justify-between">
                <span>{status}</span>
                <span className="text-[#8f6f3e]">{count}</span>
              </li>
            ))}
            {!Object.keys(data?.byStatus ?? {}).length ? (
              <li className="text-[#6f6251]">No bookings yet.</li>
            ) : null}
          </ul>
        </section>
        <section className={`${partnerPanel} p-5`}>
          <h2 className="text-xl">Top services</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(data?.topServices ?? []).map((s) => (
              <li key={s.title} className="flex justify-between gap-3">
                <span>{s.title}</span>
                <span className="text-[#8f6f3e]">{s.count}</span>
              </li>
            ))}
            {!data?.topServices?.length ? <li className="text-[#6f6251]">No service data yet.</li> : null}
          </ul>
        </section>
        <section className={`${partnerPanel} p-5`}>
          <h2 className="text-xl">Product units</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(data?.topProducts ?? []).map((p) => (
              <li key={p.title} className="flex justify-between gap-3">
                <span>{p.title}</span>
                <span className="text-[#8f6f3e]">{p.units}</span>
              </li>
            ))}
            {!data?.topProducts?.length ? <li className="text-[#6f6251]">No product sales yet.</li> : null}
          </ul>
        </section>
        <section className={`${partnerPanel} p-5`}>
          <h2 className="text-xl">Attributed product revenue</h2>
          <p className="mt-3 text-3xl text-[#1f1a15]">{money(data?.totals.paidProductRevenue ?? 0)}</p>
          <p className="mt-2 text-sm text-[#6f6251]">Paid shop + recorded partner sales.</p>
        </section>
      </div>
    </div>
  );
}
