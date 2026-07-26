"use client";

import { useEffect, useState } from "react";
import {
  partnerEyebrow,
  partnerMuted,
  partnerPanel,
  partnerTitle,
} from "@/components/partner/ui";

type Client = {
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  visits: number;
  sources: string[];
};

export default function PartnerClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetch("/api/partner/clients").then(async (res) => {
      if (!res.ok) return;
      const payload = (await res.json()) as { clients: Client[] };
      setClients(payload.clients);
    });
  }, []);

  const filtered = clients.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <p className={partnerEyebrow}>CRM</p>
        <h1 className={partnerTitle}>Clients</h1>
        <p className={partnerMuted}>
          Unique clients from your bookings and attributed orders — contact details only.
        </p>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, email, phone…"
        className="w-full max-w-md rounded-sm border border-[#e4d9c8] bg-white px-3 py-2.5 text-sm"
      />
      <div className={`overflow-x-auto ${partnerPanel}`}>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e4d9c8] text-xs tracking-[0.14em] text-[#8f6f3e]">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Visits</th>
              <th className="p-3">Source</th>
              <th className="p-3">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.email} className="border-b border-[#f0e6d8]">
                <td className="p-3">{c.name}</td>
                <td className="p-3">
                  <a className="underline hover:text-[#8f6f3e]" href={`mailto:${c.email}`}>
                    {c.email}
                  </a>
                </td>
                <td className="p-3">
                  {c.phone ? (
                    <a className="underline hover:text-[#8f6f3e]" href={`tel:${c.phone}`}>
                      {c.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3">{c.visits}</td>
                <td className="p-3 text-[#8f6f3e]">{c.sources.join(", ")}</td>
                <td className="p-3">{new Date(c.lastVisit).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length ? <p className="p-4 text-sm text-[#6f6251]">No clients yet.</p> : null}
      </div>
    </div>
  );
}
