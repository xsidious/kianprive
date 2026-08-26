"use client";

import { useEffect, useRef, useState } from "react";
import { BrandedQrCard } from "@/components/ambassador/BrandedQrCard";
import { CommissionOverrideInput } from "@/components/admin/CommissionOverrideInput";
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
import { parseCommissionOverride } from "@/lib/commission-parse";

type ProviderRow = {
  id: string;
  displayName: string;
  partnerCode: string;
  status: string;
  phone: string | null;
  specialty: string | null;
  defaultServiceCommissionPct: number | string;
  defaultProductCommissionPct: number | string;
  user: { email: string; name: string | null };
  serviceAssignments: { serviceSlug: string; active: boolean; commissionPct: number | string | null }[];
  productAssignments: { productId: string; active: boolean; commissionPct: number | string | null }[];
  links: { book: string; home: string; services: string; shop: string; telemedicine: string; code: string };
  stats: {
    visitsMtd: number;
    completedVisits: number;
    totalBookings: number;
    eligibleCommission: number;
  };
};

type ProductOption = { id: string; title: string; slug: string; isPrescription?: boolean };

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [serviceSlugs, setServiceSlugs] = useState<string[]>([]);
  const [serviceRates, setServiceRates] = useState<Record<string, string>>({});
  const [productRates, setProductRates] = useState<Record<string, string>>({});
  const [defaultServicePct, setDefaultServicePct] = useState("20");
  const [defaultProductPct, setDefaultProductPct] = useState("10");
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [creating, setCreating] = useState(false);
  const detailRef = useRef<HTMLElement>(null);

  async function load() {
    const [providersRes, productsRes] = await Promise.all([
      fetch("/api/admin/providers"),
      fetch("/api/admin/commerce/products"),
    ]);
    if (!providersRes.ok) {
      setMessage("Could not load providers. If this is a new deploy, apply the PROVIDER enum migration.");
      return;
    }
    const payload = (await providersRes.json()) as {
      providers: ProviderRow[];
      serviceOptions: string[];
      error?: string;
    };
    if (payload.error) setMessage(payload.error);
    setProviders(payload.providers ?? []);
    setServiceOptions(payload.serviceOptions ?? []);
    if (productsRes.ok) {
      const productPayload = (await productsRes.json()) as { products?: ProductOption[] };
      setProducts(productPayload.products ?? (productPayload as unknown as ProductOption[]));
    }
    const first = payload.providers?.[0];
    if (!selectedId && first) {
      applySelection(first);
    } else if (selectedId) {
      const refreshed = payload.providers?.find((p) => p.id === selectedId);
      if (refreshed) applySelection(refreshed, false);
    }
  }

  function applySelection(provider: ProviderRow, switchId = true) {
    if (switchId) setSelectedId(provider.id);
    setServiceSlugs(provider.serviceAssignments.filter((a) => a.active).map((a) => a.serviceSlug));
    setDefaultServicePct(String(provider.defaultServiceCommissionPct));
    setDefaultProductPct(String(provider.defaultProductCommissionPct ?? 10));
    const nextServiceRates: Record<string, string> = {};
    for (const a of provider.serviceAssignments) {
      if (a.commissionPct != null) nextServiceRates[a.serviceSlug] = String(a.commissionPct);
    }
    setServiceRates(nextServiceRates);
    const nextProductRates: Record<string, string> = {};
    for (const a of provider.productAssignments ?? []) {
      if (a.commissionPct != null) nextProductRates[a.productId] = String(a.commissionPct);
    }
    setProductRates(nextProductRates);
  }

  useEffect(() => {
    void load();
  }, []);

  function selectProvider(provider: ProviderRow) {
    applySelection(provider);
    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function createProvider(formData: FormData) {
    setMessage("");
    setMessageIsError(false);
    setCreating(true);
    const body = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      displayName: String(formData.get("displayName") || ""),
      phone: String(formData.get("phone") || "") || undefined,
      specialty: String(formData.get("specialty") || "") || undefined,
      defaultServiceCommissionPct: Number(formData.get("servicePct") || 20),
      defaultProductCommissionPct: Number(formData.get("productPct") || 10),
      status: String(formData.get("status") || "ACTIVE"),
      serviceAssignments: serviceSlugs.map((serviceSlug) => ({
        serviceSlug,
        active: true,
        commissionPct: parseCommissionOverride(serviceRates[serviceSlug]),
      })),
    };
    const res = await fetch("/api/admin/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string; provider?: ProviderRow };
    setCreating(false);
    if (res.ok) {
      setMessage("Practitioner created.");
      setMessageIsError(false);
      if (payload.provider) {
        await load();
        selectProvider(payload.provider);
      } else {
        await load();
      }
      return;
    }
    setMessage(payload.error ?? "Failed to create practitioner.");
    setMessageIsError(true);
  }

  async function saveCommissions() {
    if (!selectedId) return;
    const serviceDefault = Number(defaultServicePct);
    const productDefault = Number(defaultProductPct);
    const productAssignments = Object.entries(productRates)
      .map(([productId, raw]) => {
        const commissionPct = parseCommissionOverride(raw);
        if (commissionPct == null) return null;
        return { productId, active: true, commissionPct };
      })
      .filter((row): row is { productId: string; active: boolean; commissionPct: number } => row != null);

    const res = await fetch(`/api/admin/providers/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        defaultServiceCommissionPct: Number.isFinite(serviceDefault) ? serviceDefault : 20,
        defaultProductCommissionPct: Number.isFinite(productDefault) ? productDefault : 10,
        serviceAssignments: serviceSlugs.map((serviceSlug) => ({
          serviceSlug,
          active: true,
          commissionPct: parseCommissionOverride(serviceRates[serviceSlug]),
        })),
        productAssignments,
      }),
    });
    setMessage(res.ok ? "Commissions & assignments saved." : "Failed to save.");
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

  async function deleteProvider(provider: ProviderRow) {
    if (
      !window.confirm(
        `Delete practitioner ${provider.displayName} (${provider.user.email})? Their login account will also be removed.`,
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/providers/${provider.id}`, { method: "DELETE" });
    setMessage(res.ok ? "Practitioner deleted." : "Failed to delete practitioner.");
    if (res.ok) {
      if (selectedId === provider.id) setSelectedId(null);
      await load();
    }
  }

  const selected = providers.find((p) => p.id === selectedId) ?? null;
  const shopProducts = products.filter((p) => !p.isPrescription);
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
        <h1 className={adminTitle}>Practitioners</h1>
        <p className={adminMuted}>
          Set each practitioner&apos;s default visit and product rates. Optional per-service or per-product % overrides
          apply only when filled; blank fields fall back to that person&apos;s default. Practitioners never earn on
          prescriptions.
        </p>
      </div>

      {message ? (
        <p className={`text-sm ${messageIsError ? "text-red-700" : "text-[#1b6568]"}`}>{message}</p>
      ) : null}

      {selected ? (
        <p className="text-xs text-[#8f6f3e] lg:hidden">
          Viewing <strong>{selected.displayName}</strong> — scroll down for profile, totals, and commission settings.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Practitioners</p>
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

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className={`${adminPanel} p-5`}>
          <h2 className="font-serif text-xl text-[#1f1a15]">Invite practitioner</h2>
          <form
            className="mt-4 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void createProvider(new FormData(event.currentTarget));
            }}
          >
            <input name="name" placeholder="Full name" required className={adminInput} />
            <input name="displayName" placeholder="Display name (shown to clients)" required className={adminInput} />
            <input name="email" type="email" placeholder="Login email" required className={adminInput} />
            <input name="password" type="password" placeholder="Temp password (min 8)" required className={adminInput} />
            <input name="specialty" placeholder="Specialty (optional)" className={adminInput} />
            <input name="phone" placeholder="Phone (optional)" className={adminInput} />
            <div className="grid grid-cols-2 gap-3">
              <input name="servicePct" type="number" defaultValue={20} min={0} max={100} className={adminInput} title="Default visit %" />
              <input name="productPct" type="number" defaultValue={10} min={0} max={100} className={adminInput} title="Default product %" />
            </div>
            <select name="status" defaultValue="ACTIVE" className={adminSelect}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INVITED">INVITED</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
            <p className="text-xs text-[#6f6251]">Default visit % · default product % · status</p>
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
            <button type="submit" className={adminBtnPrimary} disabled={creating}>
              {creating ? "Creating…" : "Create practitioner"}
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

        <section ref={detailRef} className={`${adminPanel} scroll-mt-6 p-5`}>
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
                <button
                  type="button"
                  className="rounded-sm border border-[#d07b7b80] px-4 py-2 text-sm text-[#7c2c2c] hover:bg-[#fdeeee]"
                  onClick={() => void deleteProvider(selected)}
                >
                  Delete
                </button>
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

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-[#4f4335]">
                  <span className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">Default visit %</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={defaultServicePct}
                    onChange={(e) => setDefaultServicePct(e.target.value)}
                    className={`${adminInput} mt-2`}
                  />
                </label>
                <label className="block text-sm text-[#4f4335]">
                  <span className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">Default product %</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={defaultProductPct}
                    onChange={(e) => setDefaultProductPct(e.target.value)}
                    className={`${adminInput} mt-2`}
                  />
                </label>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
                  Services (+ optional % override — blank uses default {defaultServicePct}%)
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-1">
                  {serviceOptions.map((slug) => (
                    <div key={slug} className="flex items-center gap-2 text-sm text-[#4f4335]">
                      <input
                        type="checkbox"
                        checked={serviceSlugs.includes(slug)}
                        onChange={(e) => {
                          setServiceSlugs((prev) =>
                            e.target.checked ? [...prev, slug] : prev.filter((s) => s !== slug),
                          );
                        }}
                      />
                      <span className="min-w-0 flex-1 truncate">{slug}</span>
                      {serviceSlugs.includes(slug) ? (
                        <CommissionOverrideInput
                          value={serviceRates[slug] ?? ""}
                          onChange={(next) => setServiceRates((prev) => ({ ...prev, [slug]: next }))}
                          defaultPct={defaultServicePct}
                          label={`${slug} override`}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
                  Product overrides (optional — blank = default {defaultProductPct}% on non-Rx shop sales)
                </p>
                <div className="mt-2 max-h-48 space-y-2 overflow-auto">
                  {shopProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-2 text-sm text-[#4f4335]">
                      <span className="min-w-0 flex-1 truncate">{product.title}</span>
                      <CommissionOverrideInput
                        value={productRates[product.id] ?? ""}
                        onChange={(next) => setProductRates((prev) => ({ ...prev, [product.id]: next }))}
                        defaultPct={defaultProductPct}
                        label={`${product.title} override`}
                      />
                    </div>
                  ))}
                  {!shopProducts.length ? (
                    <p className="text-xs text-[#6f6251]">No non-prescription products in catalog.</p>
                  ) : null}
                </div>
              </div>

              <button type="button" onClick={() => void saveCommissions()} className={adminBtnPrimary}>
                Save commissions & assignments
              </button>

              <div className="rounded-sm border border-[#efe6d8] bg-[#fffaf3] p-4 text-sm text-[#6f6251]">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">Referral links & QR</p>
                <div className="mt-4 grid gap-4 lg:grid-cols-[240px_1fr]">
                  <BrandedQrCard
                    value={selected.links.book}
                    label="Scan to book"
                    filename={`kian-prive-${selected.partnerCode}-book.png`}
                    size={220}
                  />
                  <div>
                    <p className="mt-0 break-all font-mono text-xs text-[#1f1a15]">Book: {selected.links.book}</p>
                    <p className="mt-1 break-all font-mono text-xs text-[#1f1a15]">
                      Telemedicine: {selected.links.telemedicine}
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-[#1f1a15]">Shop: {selected.links.shop}</p>
                    <p className="mt-1 break-all font-mono text-xs text-[#1f1a15]">Home: {selected.links.home}</p>
                    <p className="mt-2 text-xs">
                      Practitioners can download QR codes from their portal under Links & QR. Bookings attribute
                      consultations; shop attributes non-prescription products.
                    </p>
                  </div>
                </div>
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
