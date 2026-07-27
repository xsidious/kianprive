"use client";

import { useEffect, useState } from "react";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminEyebrow,
  adminInput,
  adminMuted,
  adminPanel,
  adminSelect,
  adminStat,
  adminTitle,
  statusTone,
} from "@/components/admin/ui";

type ProviderRow = {
  id: string;
  displayName: string;
  partnerCode: string;
  status: string;
  phone: string | null;
  specialty: string | null;
  defaultServiceCommissionPct: number | string;
  user: { email: string; name: string | null };
  serviceAssignments: { serviceSlug: string; active: boolean; commissionPct: number | string | null }[];
  links: { book: string; home: string; services: string; code: string };
  stats: {
    visitsMtd: number;
    completedVisits: number;
    totalBookings: number;
    eligibleCommission: number;
  };
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [serviceSlugs, setServiceSlugs] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/admin/providers");
    if (!res.ok) {
      setMessage("Could not load providers. If this is a new deploy, apply the PROVIDER enum migration.");
      return;
    }
    const payload = (await res.json()) as {
      providers: ProviderRow[];
      serviceOptions: string[];
      error?: string;
    };
    if (payload.error) setMessage(payload.error);
    setProviders(payload.providers ?? []);
    setServiceOptions(payload.serviceOptions ?? []);
    if (!selectedId && payload.providers?.[0]) {
      setSelectedId(payload.providers[0].id);
      setServiceSlugs(payload.providers[0].serviceAssignments.filter((a) => a.active).map((a) => a.serviceSlug));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function selectProvider(provider: ProviderRow) {
    setSelectedId(provider.id);
    setServiceSlugs(provider.serviceAssignments.filter((a) => a.active).map((a) => a.serviceSlug));
  }

  async function createProvider(formData: FormData) {
    setMessage("");
    const body = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      displayName: String(formData.get("displayName") || ""),
      phone: String(formData.get("phone") || "") || undefined,
      specialty: String(formData.get("specialty") || "") || undefined,
      defaultServiceCommissionPct: Number(formData.get("servicePct") || 20),
      status: String(formData.get("status") || "ACTIVE"),
      serviceAssignments: serviceSlugs.map((serviceSlug) => ({ serviceSlug, active: true })),
    };
    const res = await fetch("/api/admin/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setMessage(res.ok ? "Provider created." : "Failed to create provider.");
    if (res.ok) {
      const payload = (await res.json()) as { provider: ProviderRow };
      await load();
      selectProvider(payload.provider);
    }
  }

  async function saveAssignments() {
    if (!selectedId) return;
    const res = await fetch(`/api/admin/providers/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceAssignments: serviceSlugs.map((serviceSlug) => ({ serviceSlug, active: true })),
      }),
    });
    setMessage(res.ok ? "Service assignments saved." : "Failed to save assignments.");
    if (res.ok) await load();
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/providers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMessage(res.ok ? "Status updated." : "Failed to update status.");
    if (res.ok) await load();
  }

  async function updateServicePct(id: string, pct: number) {
    const res = await fetch(`/api/admin/providers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultServiceCommissionPct: pct }),
    });
    setMessage(res.ok ? "Commission rate updated." : "Failed to update commission.");
    if (res.ok) await load();
  }

  const selected = providers.find((p) => p.id === selectedId) ?? null;
  const totals = providers.reduce(
    (acc, p) => {
      acc.visits += p.stats.totalBookings;
      acc.completed += p.stats.completedVisits;
      acc.commission += p.stats.eligibleCommission;
      return acc;
    },
    { visits: 0, completed: 0, commission: 0 },
  );

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Clinical network</p>
        <h1 className={adminTitle}>Providers</h1>
        <p className={adminMuted}>
          Service providers who get booked for visits, earn service commission, and get paid when appointments are
          completed. Ambassadors handle product referrals separately.
        </p>
      </div>

      {message ? <p className="text-sm text-[#1b6568]">{message}</p> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Providers</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{providers.length}</p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Completed visits</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{totals.completed}</p>
          <p className="mt-1 text-xs text-[#6f6251]">{totals.visits} total bookings</p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Eligible visit pay</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{money(totals.commission)}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className={`${adminPanel} p-5`}>
          <h2 className="font-serif text-xl text-[#1f1a15]">Invite provider</h2>
          <form action={createProvider} className="mt-4 grid gap-3">
            <input name="name" placeholder="Full name" required className={adminInput} />
            <input name="displayName" placeholder="Display name (shown to clients)" required className={adminInput} />
            <input name="email" type="email" placeholder="Login email" required className={adminInput} />
            <input name="password" type="password" placeholder="Temp password (min 8)" required className={adminInput} />
            <input name="specialty" placeholder="Specialty (optional)" className={adminInput} />
            <input name="phone" placeholder="Phone (optional)" className={adminInput} />
            <div className="grid grid-cols-2 gap-3">
              <input name="servicePct" type="number" defaultValue={20} min={0} max={100} className={adminInput} />
              <select name="status" defaultValue="ACTIVE" className={adminSelect}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INVITED">INVITED</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
            <p className="text-xs text-[#6f6251]">Default visit commission % · status</p>
            <div className="rounded-sm border border-[#efe6d8] p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">Assignable services</p>
              <div className="mt-2 grid max-h-40 gap-1 overflow-y-auto sm:grid-cols-2">
                {serviceOptions.map((slug) => (
                  <label key={slug} className="flex items-center gap-2 text-xs text-[#4f4335]">
                    <input
                      type="checkbox"
                      checked={serviceSlugs.includes(slug)}
                      onChange={(e) => {
                        setServiceSlugs((prev) =>
                          e.target.checked ? [...prev, slug] : prev.filter((s) => s !== slug),
                        );
                      }}
                    />
                    {slug}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className={adminBtnPrimary}>
              Create provider
            </button>
          </form>

          <div className="mt-6 space-y-2">
            <h3 className="text-sm text-[#1f1a15]">Directory</h3>
            {providers.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => selectProvider(provider)}
                className={`w-full rounded-sm border px-3 py-3 text-left transition ${
                  selectedId === provider.id
                    ? "border-[#8a682e] bg-[#fff8ef]"
                    : "border-[#efe6d8] bg-white hover:border-[#b78d4b80]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-[#1f1a15]">{provider.displayName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(provider.status)}`}>
                    {provider.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#6f6251]">
                  {provider.partnerCode} · {provider.stats.completedVisits} completed · {money(provider.stats.eligibleCommission)} due
                </p>
              </button>
            ))}
            {!providers.length ? <p className="text-sm text-[#6f6251]">No providers yet.</p> : null}
          </div>
        </section>

        <section className={`${adminPanel} p-5`}>
          {selected ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-[#1f1a15]">{selected.displayName}</h2>
                  <p className="mt-1 text-sm text-[#6f6251]">
                    {selected.user.email}
                    {selected.specialty ? ` · ${selected.specialty}` : ""}
                  </p>
                  <p className="mt-1 font-mono text-xs tracking-[0.12em] text-[#8f6f3e]">{selected.partnerCode}</p>
                </div>
                <select
                  value={selected.status}
                  onChange={(e) => void setStatus(selected.id, e.target.value)}
                  className={adminSelect}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INVITED">INVITED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className={adminStat}>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">MTD visits</p>
                  <p className="mt-1 font-serif text-2xl">{selected.stats.visitsMtd}</p>
                </div>
                <div className={adminStat}>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Completed</p>
                  <p className="mt-1 font-serif text-2xl">{selected.stats.completedVisits}</p>
                </div>
                <div className={adminStat}>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Eligible pay</p>
                  <p className="mt-1 font-serif text-2xl">{money(selected.stats.eligibleCommission)}</p>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">Default visit commission %</label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={Number(selected.defaultServiceCommissionPct)}
                    className={adminInput}
                    id="provider-service-pct"
                  />
                  <button
                    type="button"
                    className={adminBtnGhost}
                    onClick={() => {
                      const el = document.getElementById("provider-service-pct") as HTMLInputElement | null;
                      void updateServicePct(selected.id, Number(el?.value || 20));
                    }}
                  >
                    Save rate
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">Services this provider can be booked for</p>
                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                  {serviceOptions.map((slug) => (
                    <label key={slug} className="flex items-center gap-2 text-sm text-[#4f4335]">
                      <input
                        type="checkbox"
                        checked={serviceSlugs.includes(slug)}
                        onChange={(e) => {
                          setServiceSlugs((prev) =>
                            e.target.checked ? [...prev, slug] : prev.filter((s) => s !== slug),
                          );
                        }}
                      />
                      {slug}
                    </label>
                  ))}
                </div>
                <button type="button" onClick={() => void saveAssignments()} className={`${adminBtnPrimary} mt-3`}>
                  Save service assignments
                </button>
              </div>

              <div className="rounded-sm border border-[#efe6d8] bg-[#fffaf3] p-4 text-sm text-[#6f6251]">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">Booking link</p>
                <p className="mt-2 break-all font-mono text-xs text-[#1f1a15]">{selected.links.book}</p>
                <p className="mt-2 text-xs">Clients using this link attribute visits to this provider.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#6f6251]">Select a provider to manage services and payout settings.</p>
          )}
        </section>
      </div>
    </div>
  );
}
