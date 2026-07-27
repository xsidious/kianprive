"use client";

import { useEffect, useState } from "react";
import { adminEyebrow, adminMuted, adminPanel, adminTitle } from "@/components/admin/ui";

type Assignment = {
  serviceSlug: string;
  active: boolean;
  commissionPct: number | string | null;
};

type Partner = {
  displayName: string;
  partnerCode: string;
  defaultServiceCommissionPct: number | string;
  specialty: string | null;
  serviceAssignments: Assignment[];
};

export default function ProviderServicesPage() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/partner/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load services");
        const payload = (await res.json()) as { partner: Partner };
        setPartner(payload.partner);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const active = partner?.serviceAssignments.filter((a) => a.active) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Coverage</p>
        <h1 className={adminTitle}>Your services</h1>
        <p className={adminMuted}>
          Services admin assigned to you. Clients booking these can be routed to your schedule; visit pay uses your
          commission rate.
        </p>
      </div>
      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}
      <div className={`${adminPanel} p-5`}>
        <p className="text-sm text-[#6f6251]">
          Default visit commission:{" "}
          <span className="text-[#1f1a15]">{partner ? `${Number(partner.defaultServiceCommissionPct)}%` : "—"}</span>
          {partner?.specialty ? ` · Specialty: ${partner.specialty}` : ""}
        </p>
        <ul className="mt-4 space-y-2">
          {active.map((a) => (
            <li key={a.serviceSlug} className="flex items-center justify-between border-b border-[#f0e6d8] py-3 text-sm">
              <span className="font-medium text-[#1f1a15]">{a.serviceSlug}</span>
              <span className="text-[#8f6f3e]">
                {a.commissionPct != null ? `${Number(a.commissionPct)}%` : "Default rate"}
              </span>
            </li>
          ))}
          {!active.length ? (
            <li className="text-sm text-[#6f6251]">No services assigned yet. Ask admin to assign bookable services.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
