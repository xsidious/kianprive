"use client";

import { useEffect, useState } from "react";
import {
  partnerEyebrow,
  partnerMuted,
  partnerPanel,
  partnerTitle,
} from "@/components/partner/ui";

const SERVICE_TITLES: Record<string, string> = {
  telemedicine: "Telemedicine",
  "icoone-laser": "Icoone Laser",
  "facial-aesthetics": "Facial Aesthetics",
  nutrition: "Nutrition",
  "iv-therapy": "IV Therapy",
  "comprehensive-bloodwork": "Comprehensive Bloodwork",
  "lab-panel-essential": "Essential Wellness Panel",
  "lab-panel-metabolic": "Metabolic Health Panel",
  "lab-panel-hormone": "Hormone Balance Panel",
  "lab-panel-longevity": "Longevity Panel",
  "lab-panel-executive": "Executive Brain & Longevity Panel",
  "lab-panel-brain": "Brain Health Panel",
  "lab-panel-weight": "Weight Management Panel",
  "lab-panel-hormone-optimization": "Hormone Optimization Panel",
  "lab-panel-cardio": "Cardiovascular Risk Panel",
  "physician-visit": "Physician Visit",
  "beauty-hair-nails": "Beauty · Hair · Nails",
  "inbody-scan": "InBody Scan",
  "microneedling-with-exosomes": "Microneedling with Exosomes",
  "korean-organic-skincare": "Korean Organic Skincare",
  "glp1-peptides": "Compound Therapy",
  mindtap: "MindTap",
};

type Assignment = {
  serviceSlug: string;
  commissionPct: number | string | null;
  active: boolean;
};

export default function PartnerServicesPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [defaults, setDefaults] = useState<{ service: string; product: string; specialty: string }>({
    service: "—",
    product: "—",
    specialty: "",
  });

  useEffect(() => {
    void fetch("/api/partner/me").then(async (res) => {
      if (!res.ok) return;
      const payload = (await res.json()) as {
        partner: {
          specialty: string | null;
          defaultServiceCommissionPct: number | string;
          defaultProductCommissionPct: number | string;
          serviceAssignments: Assignment[];
        };
      };
      setAssignments(payload.partner.serviceAssignments ?? []);
      setDefaults({
        service: String(payload.partner.defaultServiceCommissionPct),
        product: String(payload.partner.defaultProductCommissionPct),
        specialty: payload.partner.specialty ?? "",
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className={partnerEyebrow}>CATALOG</p>
        <h1 className={partnerTitle}>Services</h1>
        <p className={partnerMuted}>
          Assigned specialties and your commission rates (read-only — ask admin to change).
        </p>
      </div>
      {defaults.specialty ? (
        <p className="text-sm text-[#8f6f3e]">Specialty: {defaults.specialty}</p>
      ) : null}
      <p className="text-sm text-[#6f6251]">
        Defaults: {defaults.service}% services · {defaults.product}% products
      </p>
      <div className="space-y-3">
        {assignments.map((a) => (
          <article key={a.serviceSlug} className={`${partnerPanel} p-4`}>
            <p className="text-lg text-[#1f1a15]">{SERVICE_TITLES[a.serviceSlug] ?? a.serviceSlug}</p>
            <p className="mt-1 text-xs tracking-[0.12em] text-[#8f6f3e]">{a.serviceSlug}</p>
            <p className="mt-2 text-sm text-[#6f6251]">
              Commission:{" "}
              {a.commissionPct != null
                ? `${String(a.commissionPct)}% (override)`
                : `${defaults.service}% (default)`}
            </p>
          </article>
        ))}
        {!assignments.length ? (
          <p className="text-sm text-[#6f6251]">No services assigned yet. Ask admin to assign your specialties.</p>
        ) : null}
      </div>
    </div>
  );
}
