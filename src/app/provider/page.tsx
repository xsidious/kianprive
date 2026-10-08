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

type IntakeRow = {
  id: string;
  fullName: string;
  email: string;
  status: string;
  programs: string[];
  createdAt: string;
  reviewFeeAmount: number | null;
  reviewFeePaidAt: string | null;
  paidOrderTotal: number;
  paidOrders: { orderNumber: string; total: number; notes: string | null; createdAt: string }[];
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
    intakesAssigned: number;
    intakesPendingReview: number;
    intakesApproved: number;
    reviewFeesCount: number;
    reviewFeesTotal: number;
    therapyPaidCount: number;
    therapyPaidTotal: number;
    shopPaidCount: number;
    shopPaidTotal: number;
    patientPaidTotal: number;
  };
  paidActivity?: PaidActivity[];
  recentIntakes?: IntakeRow[];
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
    displayName?: string;
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

export default function ProviderOverviewPage() {
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
          <p className={adminEyebrow}>Practitioner</p>
          <h1 className={adminTitle}>Consultations overview</h1>
          <p className={adminMuted}>
            Intakes assigned to you, patient payments (review fees, therapy, shop), and your commission progress.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/provider/intake" className={adminBtnGhost}>
            Patient intakes
          </Link>
          <Link href="/provider/bookings" className={adminBtnGhost}>
            Consultations
          </Link>
          <Link href="/provider/earnings" className={adminBtnGhost}>
            Earnings
          </Link>
        </div>
      </div>

      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}
      {data?.onboarding.status === "INVITED" ? (
        <div className={`${adminPanel} border-[#b78d4b80] bg-[#fff8ee] p-4 text-sm text-[#6f6251]`}>
          Your account is invited. Ask admin to set status to ACTIVE before new work can be assigned.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Assigned intakes</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{stats?.intakesAssigned ?? "—"}</p>
          <p className="mt-1 text-xs text-[#6f6251]">
            {stats ? `${stats.intakesPendingReview} awaiting review · ${stats.intakesApproved} approved` : ""}
          </p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Review fees paid</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">
            {stats ? money(stats.reviewFeesTotal) : "—"}
          </p>
          <p className="mt-1 text-xs text-[#6f6251]">
            {stats ? `${stats.reviewFeesCount} payment${stats.reviewFeesCount === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Therapy & shop paid</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">
            {stats ? money((stats.therapyPaidTotal || 0) + (stats.shopPaidTotal || 0)) : "—"}
          </p>
          <p className="mt-1 text-xs text-[#6f6251]">
            {stats
              ? `${stats.therapyPaidCount} therapy · ${stats.shopPaidCount} shop`
              : ""}
          </p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Your commission</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">
            {stats ? money(stats.pendingCommission) : "—"}
          </p>
          <p className="mt-1 text-xs text-[#6f6251]">
            {stats ? `${money(stats.awaitingCompletion)} pending completion` : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Consult bookings</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{stats?.bookings ?? "—"}</p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Pending approval</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{stats?.pending ?? "—"}</p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Completed MTD</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{stats?.completedMtd ?? "—"}</p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">All patient payments</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">
            {stats ? money(stats.patientPaidTotal) : "—"}
          </p>
        </div>
      </div>

      <section className={`${adminPanel} p-5`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-[#1f1a15]">What patients paid</h2>
            <p className="mt-1 text-sm text-[#6f6251]">
              Every attributed payment — practitioner review fees, therapy, shop, and visit totals.
            </p>
          </div>
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
            <li className="text-sm text-[#6f6251]">No patient payments attributed yet.</li>
          ) : null}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${adminPanel} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl text-[#1f1a15]">Recent intakes</h2>
            <Link href="/provider/intake" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {(data?.recentIntakes ?? []).map((intake) => (
              <li key={intake.id} className="border-b border-[#f0e6d8] pb-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link href={`/provider/intake/${intake.id}`} className="text-[#1f1a15] underline-offset-2 hover:underline">
                      {intake.fullName}
                    </Link>
                    <p className="text-[#6f6251]">{intake.email}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(intake.status)}`}>
                    {intake.status.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#8f6f3e]">
                  {formatWhen(intake.createdAt)}
                  {intake.reviewFeeAmount != null
                    ? ` · Review fee ${money(intake.reviewFeeAmount)}${intake.reviewFeePaidAt ? " paid" : ""}`
                    : ""}
                  {intake.paidOrderTotal > 0 ? ` · Orders ${money(intake.paidOrderTotal)}` : ""}
                </p>
              </li>
            ))}
            {!data?.recentIntakes?.length ? (
              <li className="text-sm text-[#6f6251]">No intakes assigned yet.</li>
            ) : null}
          </ul>
        </section>

        <section className={`${adminPanel} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl text-[#1f1a15]">Commission ledger</h2>
            <Link href="/provider/earnings" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
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
      </div>

      {(data?.recentBookings?.length ?? 0) > 0 ? (
        <section className={`${adminPanel} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl text-[#1f1a15]">Consultation bookings</h2>
            <Link href="/provider/bookings" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
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
          </ul>
        </section>
      ) : null}
    </div>
  );
}
