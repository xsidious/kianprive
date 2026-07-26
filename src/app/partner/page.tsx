"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  money,
  partnerBtnGhost,
  partnerBtnPrimary,
  partnerEyebrow,
  partnerMuted,
  partnerPanel,
  partnerTitle,
} from "@/components/partner/ui";

type DashboardPayload = {
  stats: {
    bookings: number;
    pending: number;
    completedMtd: number;
    pendingCommission: number;
    awaitingCompletion: number;
    mtdSales: number;
  };
  todaysBookings: {
    id: string;
    fullName: string;
    scheduledStart: string | null;
    status: string;
    serviceTitles: string[];
  }[];
  latestPayout: {
    id: string;
    status: string;
    totalAmount: number | string;
    periodStart: string;
    periodEnd: string;
    paidAt: string | null;
  } | null;
  onboarding: {
    hasPhone: boolean;
    hasPayoutMethod: boolean;
    hasAssignment: boolean;
    complete: boolean;
    partnerCode: string;
    status: string;
  };
};

export default function PartnerDashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/partner/dashboard")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load dashboard");
        setData((await res.json()) as DashboardPayload);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const checks = [
    { label: "Contact phone on file", done: data?.onboarding.hasPhone },
    { label: "Payout method set", done: data?.onboarding.hasPayoutMethod },
    { label: "Catalog assignment received", done: data?.onboarding.hasAssignment },
  ];
  const onboardingDone = checks.every((c) => c.done);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={partnerEyebrow}>PARTNER</p>
          <h1 className={partnerTitle}>Dashboard</h1>
          <p className={partnerMuted}>Today’s schedule, approvals, and earnings at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/partner/bookings" className={partnerBtnPrimary}>
            Review bookings
          </Link>
          <Link href="/partner/profile" className={partnerBtnGhost}>
            Profile & referrals
          </Link>
        </div>
      </div>

      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}
      {data?.onboarding.status === "INVITED" ? (
        <div className={`${partnerPanel} border-[#b78d4b80] bg-[#fff8ee] p-4 text-sm text-[#6f6251]`}>
          Your account is <strong className="text-[#1f1a15]">INVITED</strong>. You can explore the portal;
          ask admin to set status to ACTIVE before recording sales.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          ["Pending approvals", data?.stats.pending ?? "—", "/partner/bookings?status=PENDING"],
          ["Bookings total", data?.stats.bookings ?? "—", "/partner/bookings"],
          ["Completed MTD", data?.stats.completedMtd ?? "—", "/partner/analytics"],
          ["MTD attributed sales", data ? money(data.stats.mtdSales) : "—", "/partner/earnings"],
          ["Eligible commission", data ? money(data.stats.pendingCommission) : "—", "/partner/earnings"],
          ["Awaiting completion", data ? money(data.stats.awaitingCompletion) : "—", "/partner/earnings"],
        ].map(([label, value, href]) => (
          <Link key={String(label)} href={String(href)} className={`${partnerPanel} p-4 transition hover:border-[#b78d4b80]`}>
            <p className="text-xs tracking-[0.16em] text-[#8f6f3e]">{label}</p>
            <p className="mt-2 text-2xl text-[#1f1a15]">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${partnerPanel} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl text-[#1f1a15]">Onboarding</h2>
            <span className="text-xs tracking-[0.14em] text-[#8f6f3e]">
              {onboardingDone ? "COMPLETE" : "IN PROGRESS"}
            </span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-[#4f4335]">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                <span className={c.done ? "text-[#2e7d32]" : "text-[#b78d4b]"}>{c.done ? "✓" : "○"}</span>
                {c.label}
              </li>
            ))}
          </ul>
          {data?.onboarding.partnerCode ? (
            <p className="mt-4 text-sm text-[#6f6251]">
              Referral booking:{" "}
              <Link
                className="text-[#8f6f3e] underline"
                href={`/book-online?partner=${data.onboarding.partnerCode}`}
              >
                /book-online?partner={data.onboarding.partnerCode}
              </Link>
            </p>
          ) : null}
          {!onboardingDone ? (
            <Link href="/partner/profile" className="mt-4 inline-block text-sm text-[#8f6f3e] underline">
              Finish profile setup →
            </Link>
          ) : null}
        </section>

        <section className={`${partnerPanel} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl text-[#1f1a15]">Payout status</h2>
            <Link href="/partner/payouts" className="text-sm text-[#8f6f3e] underline">
              History
            </Link>
          </div>
          {data?.latestPayout ? (
            <div className="mt-3 space-y-1 text-sm text-[#4f4335]">
              <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">{data.latestPayout.status}</p>
              <p className="text-2xl text-[#1f1a15]">{money(data.latestPayout.totalAmount)}</p>
              <p className="text-[#6f6251]">
                {new Date(data.latestPayout.periodStart).toLocaleDateString()} –{" "}
                {new Date(data.latestPayout.periodEnd).toLocaleDateString()}
              </p>
              {data.latestPayout.paidAt ? (
                <p className="text-[#6f6251]">Paid {new Date(data.latestPayout.paidAt).toLocaleDateString()}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#6f6251]">No payout periods yet. Eligible commissions will appear here once admin generates a payout.</p>
          )}
        </section>
      </div>

      <section className={`${partnerPanel} p-5`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl text-[#1f1a15]">Today’s bookings</h2>
          <Link href="/partner/calendar" className="text-sm text-[#8f6f3e] underline">
            Calendar
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {(data?.todaysBookings ?? []).map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0e6d8] pb-3 text-sm"
            >
              <div>
                <p className="text-[#1f1a15]">{b.fullName}</p>
                <p className="text-[#6f6251]">{b.serviceTitles.join(", ")}</p>
              </div>
              <p className="text-[#8f6f3e]">
                {b.scheduledStart
                  ? new Date(b.scheduledStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "—"}{" "}
                · {b.status}
              </p>
            </li>
          ))}
          {!data?.todaysBookings?.length ? (
            <li className="text-sm text-[#6f6251]">No bookings scheduled today.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
