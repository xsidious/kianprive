"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminBtnGhost, adminEyebrow, adminMuted, adminPanel, adminStat, adminTitle } from "@/components/admin/ui";

type DashboardPayload = {
  stats: {
    bookings: number;
    pending: number;
    completedMtd: number;
    pendingCommission: number;
    awaitingCompletion: number;
    mtdSales: number;
  };
  onboarding: {
    partnerCode: string;
    status: string;
  };
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={adminEyebrow}>Ambassador</p>
          <h1 className={adminTitle}>Sales overview</h1>
          <p className={adminMuted}>Track attributed product sales, commission, and your referral tools.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/ambassador/links" className={adminBtnGhost}>
            Links & QR
          </Link>
          <Link href="/ambassador/sales" className={adminBtnGhost}>
            Sales detail
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
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">MTD sales</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">
            {data ? money(data.stats.mtdSales) : "—"}
          </p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Eligible commission</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">
            {data ? money(data.stats.pendingCommission) : "—"}
          </p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Awaiting payout eligibility</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">
            {data ? money(data.stats.awaitingCompletion) : "—"}
          </p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Your code</p>
          <p className="mt-2 font-mono text-2xl text-[#1f1a15]">{data?.onboarding.partnerCode ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}
