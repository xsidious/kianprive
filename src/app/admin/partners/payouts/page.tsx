"use client";

import { useEffect, useState } from "react";

type Partner = { id: string; displayName: string; partnerCode: string };
type Payout = {
  id: string;
  partnerId: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number | string;
  status: string;
  paidAt: string | null;
  partner: { displayName: string; partnerCode: string };
  entries: unknown[];
};

export default function AdminPartnerPayoutsPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [partnerId, setPartnerId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    const [pRes, payRes] = await Promise.all([fetch("/api/admin/partners"), fetch("/api/admin/partners/payouts")]);
    if (pRes.ok) {
      const payload = (await pRes.json()) as { partners: Partner[] };
      setPartners(payload.partners);
    }
    if (payRes.ok) {
      const payload = (await payRes.json()) as { payouts: Payout[] };
      setPayouts(payload.payouts);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function generate() {
    if (!partnerId || !periodStart || !periodEnd) return;
    const res = await fetch("/api/admin/partners/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerId,
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString(),
      }),
    });
    setStatus(res.ok ? "Payout draft generated." : "Failed to generate payout.");
    if (res.ok) await load();
  }

  async function updateStatus(id: string, next: string) {
    const res = await fetch(`/api/admin/partners/payouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setStatus(res.ok ? "Payout updated." : "Failed to update payout.");
    if (res.ok) await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1f1a15]">Partner Payouts</h1>
        <p className="mt-2 text-[#6f6251]">Generate commission periods, approve, mark paid, and export CSV.</p>
      </div>
      {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}

      <section className="rounded-sm border border-[#b78d4b2d] bg-white p-5">
        <h2 className="text-xl">Generate payout period</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select value={partnerId} onChange={(e) => setPartnerId(e.target.value)} className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3">
            <option value="">Select partner</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName} ({p.partnerCode})
              </option>
            ))}
          </select>
          <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <button type="button" onClick={() => void generate()} className="rounded-sm bg-[#b78d4b] px-4 py-2 text-white">
            Generate draft
          </button>
        </div>
      </section>

      <section className="grid gap-3">
        {payouts.map((payout) => (
          <article key={payout.id} className="rounded-sm border border-[#b78d4b2d] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">{payout.status}</p>
                <p className="text-lg text-[#1f1a15]">{payout.partner.displayName}</p>
                <p className="text-sm text-[#6f6251]">
                  {new Date(payout.periodStart).toLocaleDateString()} – {new Date(payout.periodEnd).toLocaleDateString()} · $
                  {Number(payout.totalAmount).toFixed(2)} · {payout.entries.length} lines
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={`/api/admin/partners/payouts/${payout.id}`} className="rounded-sm border border-[#b78d4b70] px-3 py-2 text-sm">
                  Export CSV
                </a>
                <button type="button" onClick={() => void updateStatus(payout.id, "APPROVED")} className="rounded-sm border border-[#b78d4b70] px-3 py-2 text-sm">
                  Approve
                </button>
                <button type="button" onClick={() => void updateStatus(payout.id, "PAID")} className="rounded-sm bg-[#b78d4b] px-3 py-2 text-sm text-white">
                  Mark paid
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
