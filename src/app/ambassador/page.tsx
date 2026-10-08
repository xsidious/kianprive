"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  adminBtnGhost,
  adminEyebrow,
  adminMuted,
  adminPanel,
  adminStat,
  adminTitle,
  money,
  statusTone,
} from "@/components/admin/ui";

type PaidActivity = {
  id: string;
  at: string;
  kind: string;
  label: string;
  patientName: string;
  patientEmail: string | null;
  amount: number;
  reference: string;
  status: string;
  detail: string | null;
};

type CommissionRow = {
  id: string;
  description: string | null;
  grossAmount: number;
  commissionAmount: number;
  status: string;
  sourceType: string;
  earnedAt: string;
};

type DashboardPayload = {
  stats: {
    bookings: number;
    pending: number;
    completedMtd: number;
    pendingCommission: number;
    awaitingCompletion: number;
    mtdSales: number;
    mtdProductSales?: number;
    mtdServiceGross?: number;
    reviewFeesCount?: number;
    reviewFeesTotal?: number;
    therapyPaidCount?: number;
    therapyPaidTotal?: number;
    shopPaidCount?: number;
    shopPaidTotal?: number;
    patientPaidTotal?: number;
    intakesAssigned?: number;
  };
  paidActivity?: PaidActivity[];
  recentCommissions?: CommissionRow[];
  recentBookings?: {
    id: string;
    fullName: string;
    scheduledStart: string | null;
    status: string;
    serviceTitles: string[];
  }[];
  onboarding: {
    partnerCode: string;
    status: string;
  };
};

function formatWhen(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AmbassadorOverviewPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/partner/dashboard")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load overview");
        setData((await res.json()) as DashboardPayload);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const stats = data?.stats;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={adminEyebrow}>Ambassador</p>
          <h1 className={adminTitle}>Sales overview</h1>
          <p className={adminMuted}>
            Every payment attributed to your code — shop orders, bookings, review fees — plus commission progress.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/ambassador/links" className={adminBtnGhost}>
            Links & QR
          </Link>
          <Link href="/ambassador/sales" className={adminBtnGhost}>
            Sales detail
          </Link>
          <Link href="/ambassador/earnings" className={adminBtnGhost}>
            Earnings
          </Link>
        </div>
      </div>

      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}
      {data?.onboarding.status === "INVITED" ? (
        <div className={`${adminPanel} border-[#b78d4b80] bg-[#fff8ee] p-4 text-sm text-[#6f6251]`}>
          Your account is invited. Ask admin to set status to ACTIVE before sales can attribute.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Attributed payments</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">
            {stats ? money(stats.patientPaidTotal ?? stats.mtdSales) : "—"}
          </p>
          <p className="mt-1 text-xs text-[#6f6251]">
            {stats ? `MTD ${money(stats.mtdProductSales ?? stats.mtdSales)}` : ""}
          </p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Shop paid</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">
            {stats ? money(stats.shopPaidTotal ?? 0) : "—"}
          </p>
          <p className="mt-1 text-xs text-[#6f6251]">
            {stats ? `${stats.shopPaidCount ?? 0} order${(stats.shopPaidCount ?? 0) === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Eligible commission</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">
            {stats ? money(stats.pendingCommission) : "—"}
          </p>
          <p className="mt-1 text-xs text-[#6f6251]">
            {stats ? `${money(stats.awaitingCompletion)} awaiting completion` : ""}
          </p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Your code</p>
          <p className="mt-2 font-mono text-2xl text-[#1f1a15]">{data?.onboarding.partnerCode ?? "—"}</p>
          <p className="mt-1 text-xs text-[#6f6251]">
            {stats ? `${stats.bookings} bookings · ${stats.intakesAssigned ?? 0} intakes` : ""}
          </p>
        </div>
      </div>

      <section className={`${adminPanel} p-5`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-[#1f1a15]">What people paid</h2>
            <p className="mt-1 text-sm text-[#6f6251]">
              Laid out by customer — shop, therapy, review fees, and visit amounts tied to your referral.
            </p>
          </div>
          <Link href="/ambassador/sales" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
            Full sales
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {(data?.paidActivity ?? []).map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0e6d8] pb-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[#1f1a15]">{row.patientName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(row.kind)}`}>
                    {row.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[#6f6251]">
                  {row.patientEmail || "—"}
                  {row.detail ? ` · ${row.detail}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-[#8f6f3e]">
                  {formatWhen(row.at)} · {row.reference}
                </p>
              </div>
              <p className="font-serif text-lg text-[#1f1a15]">{money(row.amount)}</p>
            </li>
          ))}
          {!data?.paidActivity?.length ? (
            <li className="text-sm text-[#6f6251]">No attributed payments yet.</li>
          ) : null}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${adminPanel} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl text-[#1f1a15]">Commission ledger</h2>
            <Link href="/ambassador/earnings" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
              Earnings
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {(data?.recentCommissions ?? []).map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0e6d8] pb-3 text-sm"
              >
                <div>
                  <p className="text-[#1f1a15]">{row.description || row.sourceType}</p>
                  <p className="text-xs text-[#8f6f3e]">
                    {formatWhen(row.earnedAt)} · {row.status} · gross {money(row.grossAmount)}
                  </p>
                </div>
                <p className="font-serif text-lg text-[#1f1a15]">{money(row.commissionAmount)}</p>
              </li>
            ))}
            {!data?.recentCommissions?.length ? (
              <li className="text-sm text-[#6f6251]">No commission entries yet.</li>
            ) : null}
          </ul>
        </section>

        <section className={`${adminPanel} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl text-[#1f1a15]">Attributed bookings</h2>
            <Link href="/ambassador/sales" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {(data?.recentBookings ?? []).map((booking) => (
              <li
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0e6d8] pb-3 text-sm"
              >
                <div>
                  <p className="text-[#1f1a15]">{booking.fullName}</p>
                  <p className="text-[#6f6251]">{booking.serviceTitles.join(", ")}</p>
                </div>
                <p className="text-[#8f6f3e]">
                  {booking.scheduledStart
                    ? new Date(booking.scheduledStart).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}{" "}
                  · {booking.status}
                </p>
              </li>
            ))}
            {!data?.recentBookings?.length ? (
              <li className="text-sm text-[#6f6251]">No bookings attributed to your code yet.</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
