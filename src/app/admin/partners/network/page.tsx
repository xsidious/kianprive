"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NetworkPayload = {
  topPartners: {
    id: string;
    displayName: string;
    partnerCode: string;
    status: string;
    bookings: number;
    orders: number;
    owed: number;
  }[];
  unassignedBookings: {
    id: string;
    fullName: string;
    email: string;
    serviceTitles: string[];
    status: string;
    scheduledStart: string | null;
  }[];
  totalOwed: number;
  partnerCount: number;
};

type PartnerOption = { id: string; displayName: string };

export default function AdminPartnerNetworkPage() {
  const [data, setData] = useState<NetworkPayload | null>(null);
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [status, setStatus] = useState("");

  async function load() {
    const [networkRes, partnersRes] = await Promise.all([
      fetch("/api/admin/partners/network"),
      fetch("/api/admin/partners"),
    ]);
    if (networkRes.ok) setData((await networkRes.json()) as NetworkPayload);
    if (partnersRes.ok) {
      const payload = (await partnersRes.json()) as { partners: PartnerOption[] };
      setPartners(payload.partners);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function reassign(bookingId: string, partnerId: string) {
    setStatus("");
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId: partnerId || null }),
    });
    setStatus(res.ok ? "Booking reassigned." : "Reassign failed.");
    if (res.ok) await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl text-[#1f1a15]">Partner network</h1>
          <p className="mt-2 text-[#6f6251]">Top partners, commission owed, and unassigned bookings.</p>
        </div>
        <Link href="/admin/partners" className="rounded-sm border border-[#b78d4b80] bg-white px-4 py-2 text-sm">
          Back to partners
        </Link>
      </div>
      {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-sm border border-[#b78d4b2d] bg-white p-4">
          <p className="text-xs tracking-[0.16em] text-[#8f6f3e]">PARTNERS</p>
          <p className="mt-1 text-3xl">{data?.partnerCount ?? "—"}</p>
        </article>
        <article className="rounded-sm border border-[#b78d4b2d] bg-white p-4">
          <p className="text-xs tracking-[0.16em] text-[#8f6f3e]">COMMISSION OWED</p>
          <p className="mt-1 text-3xl">${Number(data?.totalOwed ?? 0).toFixed(2)}</p>
        </article>
      </div>

      <section className="rounded-sm border border-[#b78d4b2d] bg-white p-5">
        <h2 className="text-xl">Top partners</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(data?.topPartners ?? []).map((p) => (
            <li key={p.id} className="flex flex-wrap justify-between gap-2 border-b border-[#f0e6d8] pb-2">
              <span>
                {p.displayName} ({p.partnerCode}) · {p.status}
              </span>
              <span className="text-[#8f6f3e]">
                {p.bookings} bookings · {p.orders} orders · ${p.owed.toFixed(2)} owed
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-sm border border-[#b78d4b2d] bg-white p-5">
        <h2 className="text-xl">Unassigned bookings queue</h2>
        <p className="mt-1 text-sm text-[#6f6251]">
          Bookings with no partner yet (including multi-specialty conflicts that could not auto-route). Assign below.
        </p>
        <div className="mt-4 space-y-3">
          {(data?.unassignedBookings ?? []).map((b) => (
            <article key={b.id} className="flex flex-wrap items-center justify-between gap-3 border border-[#e4d9c8] p-3">
              <div>
                <p className="text-[#1f1a15]">{b.fullName}</p>
                <p className="text-sm text-[#6f6251]">
                  {b.serviceTitles.join(", ")} · {b.status}
                </p>
              </div>
              <select
                className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) void reassign(b.id, e.target.value);
                }}
              >
                <option value="">Assign partner…</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
              </select>
            </article>
          ))}
          {!data?.unassignedBookings?.length ? <p className="text-sm text-[#6f6251]">Queue is clear.</p> : null}
        </div>
      </section>
    </div>
  );
}
