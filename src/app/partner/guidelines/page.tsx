"use client";

import { useEffect, useState } from "react";
import { PeptideGuidelinesLibrary } from "@/components/partners/PeptideGuidelinesLibrary";
import { PEPTIDE_LIBRARY_TITLE } from "@/lib/partners/peptide-guidelines-data";

type Guideline = {
  id: string;
  title: string;
  requiresAck: boolean;
  acks: { acknowledgedAt: string }[];
};

export default function PartnerGuidelinesPage() {
  const [cover, setCover] = useState<Guideline | null>(null);
  const [ackStatus, setAckStatus] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/partner/guidelines");
    if (res.ok) {
      const payload = (await res.json()) as { guidelines: Guideline[] };
      const library = payload.guidelines.find((g) => g.title === PEPTIDE_LIBRARY_TITLE) ?? null;
      setCover(library);
      setHasAccess(Boolean(library) || payload.guidelines.some((g) => g.title.startsWith("Peptide Protocol:")));
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function acknowledge() {
    if (!cover) return;
    setAckStatus("");
    const res = await fetch("/api/partner/guidelines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guidelineId: cover.id }),
    });
    setAckStatus(res.ok ? "Acknowledged." : "Could not acknowledge.");
    if (res.ok) await load();
  }

  if (loading) {
    return <p className="text-sm text-[#6f6251]">Loading guidelines…</p>;
  }

  if (!hasAccess) {
    return (
      <div className="space-y-3">
        <p className="text-xs tracking-[0.22em] text-[#b78d4b]">LIBRARY</p>
        <h1 className="font-serif text-4xl text-[#1f1a15]">Guidelines</h1>
        <p className="text-[#6f6251]">
          No guidelines assigned yet. Ask admin to publish the peptide library and grant access.
        </p>
      </div>
    );
  }

  return (
    <PeptideGuidelinesLibrary
      showAck={Boolean(cover?.requiresAck)}
      acknowledged={(cover?.acks.length ?? 0) > 0}
      onAcknowledge={() => void acknowledge()}
      ackStatus={ackStatus}
    />
  );
}
