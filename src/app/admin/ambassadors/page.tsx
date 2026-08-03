"use client";

import { useEffect, useState } from "react";
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

type AmbassadorRow = {
  id: string;
  displayName: string;
  partnerCode: string;
  status: string;
  phone: string | null;
  defaultProductCommissionPct: number | string;
  user: { email: string; name: string | null };
  productAssignments: { productId: string; active: boolean; commissionPct: number | string | null }[];
  links: { shop: string; home: string; book: string; code: string };
  stats: {
    paidOrders: number;
    paidSalesTotal: number;
    mtdOrders: number;
    mtdSalesTotal: number;
    eligibleCommission: number;
  };
};

type ProductOption = { id: string; title: string; slug: string; isPrescription?: boolean };

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function AdminAmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<AmbassadorRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [defaultProductPct, setDefaultProductPct] = useState("10");
  const [productRates, setProductRates] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");

  function applySelection(ambassador: AmbassadorRow, switchId = true) {
    if (switchId) setSelectedId(ambassador.id);
    setDefaultProductPct(String(ambassador.defaultProductCommissionPct));
    const nextRates: Record<string, string> = {};
    for (const a of ambassador.productAssignments ?? []) {
      if (a.commissionPct != null) nextRates[a.productId] = String(a.commissionPct);
    }
    setProductRates(nextRates);
  }

  async function load() {
    const [ambRes, productsRes] = await Promise.all([
      fetch("/api/admin/ambassadors"),
      fetch("/api/admin/commerce/products"),
    ]);
    if (!ambRes.ok) {
      setMessage("Could not load ambassadors.");
      return;
    }
    const payload = (await ambRes.json()) as { ambassadors: AmbassadorRow[]; error?: string };
    if (payload.error) setMessage(payload.error);
    setAmbassadors(payload.ambassadors ?? []);
    if (productsRes.ok) {
      const productPayload = (await productsRes.json()) as { products?: ProductOption[] };
      setProducts(productPayload.products ?? (productPayload as unknown as ProductOption[]));
    }
    const first = payload.ambassadors?.[0];
    if (!selectedId && first) {
      applySelection(first);
    } else if (selectedId) {
      const refreshed = payload.ambassadors?.find((a) => a.id === selectedId);
      if (refreshed) applySelection(refreshed, false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createAmbassador(formData: FormData) {
    setMessage("");
    const body = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      displayName: String(formData.get("displayName") || ""),
      phone: String(formData.get("phone") || "") || undefined,
      defaultProductCommissionPct: Number(formData.get("productPct") || 10),
      status: String(formData.get("status") || "ACTIVE"),
    };
    const res = await fetch("/api/admin/ambassadors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setMessage(res.ok ? "Ambassador created." : "Failed to create ambassador.");
    if (res.ok) {
      const payload = (await res.json()) as { ambassador: AmbassadorRow };
      await load();
      applySelection(payload.ambassador);
    }
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/ambassadors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMessage(res.ok ? "Status updated." : "Failed to update status.");
    if (res.ok) await load();
  }

  async function deleteAmbassador(ambassador: AmbassadorRow) {
    if (
      !window.confirm(
        `Delete ambassador ${ambassador.displayName} (${ambassador.user.email})? Their login account will also be removed.`,
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/ambassadors/${ambassador.id}`, { method: "DELETE" });
    setMessage(res.ok ? "Ambassador deleted." : "Failed to delete ambassador.");
    if (res.ok) {
      if (selectedId === ambassador.id) setSelectedId(null);
      await load();
    }
  }

  async function saveCommissions() {
    if (!selectedId) return;
    const productDefault = Number(defaultProductPct);
    const productAssignments = Object.entries(productRates)
      .map(([productId, raw]) => {
        const commissionPct = parseCommissionOverride(raw);
        if (commissionPct == null) return null;
        return { productId, active: true, commissionPct };
      })
      .filter((row): row is { productId: string; active: boolean; commissionPct: number } => row != null);

    const res = await fetch(`/api/admin/ambassadors/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        defaultProductCommissionPct: Number.isFinite(productDefault) ? productDefault : 10,
        productAssignments,
      }),
    });
    setMessage(res.ok ? "Commission rates saved." : "Failed to save commissions.");
    if (res.ok) await load();
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      setMessage("Could not copy to clipboard.");
    }
  }

  const selected = ambassadors.find((a) => a.id === selectedId) ?? null;
  const totals = ambassadors.reduce(
    (acc, a) => {
      acc.sales += a.stats.paidSalesTotal;
      acc.orders += a.stats.paidOrders;
      acc.commission += a.stats.eligibleCommission;
      return acc;
    },
    { sales: 0, orders: 0, commission: 0 },
  );

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Growth network</p>
        <h1 className={adminTitle}>Ambassadors</h1>
        <p className={adminMuted}>
          Set each ambassador&apos;s default product commission and optional per-product overrides. Blank override
          fields use that person&apos;s default. Prescription products only earn when an override is set.
        </p>
      </div>

      {message ? <p className="text-sm text-[#1b6568]">{message}</p> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Ambassadors</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{ambassadors.length}</p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Attributed sales</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{money(totals.sales)}</p>
          <p className="mt-1 text-xs text-[#6f6251]">{totals.orders} paid orders</p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Eligible commission</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{money(totals.commission)}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className={`${adminPanel} p-5`}>
          <h2 className="font-serif text-xl text-[#1f1a15]">Invite ambassador</h2>
          <form action={createAmbassador} className="mt-4 grid gap-3">
            <input name="name" placeholder="Full name" required className={adminInput} />
            <input name="displayName" placeholder="Display name" required className={adminInput} />
            <input name="email" type="email" placeholder="Login email" required className={adminInput} />
            <input name="password" type="password" placeholder="Temp password (min 8)" required className={adminInput} />
            <input name="phone" placeholder="Phone (optional)" className={adminInput} />
            <div className="grid grid-cols-2 gap-3">
              <input name="productPct" type="number" defaultValue={10} min={0} max={100} className={adminInput} />
              <select name="status" defaultValue="ACTIVE" className={adminSelect}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INVITED">INVITED</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
            <p className="text-xs text-[#6f6251]">Default product commission % · status</p>
            <button type="submit" className={adminBtnPrimary}>
              Create ambassador
            </button>
          </form>

          <div className="mt-6 space-y-2">
            <h3 className="text-sm text-[#1f1a15]">Directory</h3>
            {ambassadors.map((ambassador) => (
              <button
                key={ambassador.id}
                type="button"
                onClick={() => applySelection(ambassador)}
                className={`w-full rounded-sm border px-3 py-3 text-left transition ${
                  selectedId === ambassador.id
                    ? "border-[#8a682e] bg-[#fff8ef]"
                    : "border-[#efe6d8] bg-white hover:border-[#b78d4b80]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-[#1f1a15]">{ambassador.displayName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(ambassador.status)}`}>
                    {ambassador.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#6f6251]">
                  {ambassador.partnerCode} · {money(ambassador.stats.paidSalesTotal)} sales ·{" "}
                  {String(ambassador.defaultProductCommissionPct)}% default
                </p>
              </button>
            ))}
            {!ambassadors.length ? <p className="text-sm text-[#6f6251]">No ambassadors yet.</p> : null}
          </div>
        </section>

        <section className={`${adminPanel} p-5`}>
          {selected ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className={adminEyebrow}>Ambassador profile</p>
                  <h2 className="mt-1 font-serif text-2xl text-[#1f1a15]">{selected.displayName}</h2>
                  <p className="mt-1 text-sm text-[#6f6251]">{selected.user.email}</p>
                </div>
                <select
                  value={selected.status}
                  onChange={(event) => void setStatus(selected.id, event.target.value)}
                  className={adminSelect}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INVITED">INVITED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
                <button
                  type="button"
                  className="rounded-sm border border-[#d07b7b80] px-4 py-2 text-sm text-[#7c2c2c] hover:bg-[#fdeeee]"
                  onClick={() => void deleteAmbassador(selected)}
                >
                  Delete
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-sm bg-[#fff8ef] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Code</p>
                  <p className="mt-1 font-mono text-lg text-[#1f1a15]">{selected.partnerCode}</p>
                </div>
                <div className="rounded-sm bg-[#fff8ef] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">MTD sales</p>
                  <p className="mt-1 text-lg text-[#1f1a15]">{money(selected.stats.mtdSalesTotal)}</p>
                </div>
                <div className="rounded-sm bg-[#fff8ef] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Commission</p>
                  <p className="mt-1 text-lg text-[#1f1a15]">{money(selected.stats.eligibleCommission)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#4f4335]">
                  <span className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">Default product commission %</span>
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
                <p className="mt-2 text-xs text-[#6f6251]">
                  Applies to all non-prescription shop sales unless a product override is set below.
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
                  Per-product overrides (blank = default {defaultProductPct}%)
                </p>
                <div className="mt-2 max-h-56 space-y-2 overflow-auto">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-2 text-sm text-[#4f4335]">
                      <span className="min-w-0 flex-1 truncate">
                        {product.title}
                        {product.isPrescription ? (
                          <span className="ml-1 text-[10px] uppercase tracking-[0.08em] text-[#8f6f3e]">Rx</span>
                        ) : null}
                      </span>
                      <CommissionOverrideInput
                        value={productRates[product.id] ?? ""}
                        onChange={(next) => setProductRates((prev) => ({ ...prev, [product.id]: next }))}
                        defaultPct={defaultProductPct}
                        label={`${product.title} override`}
                      />
                    </div>
                  ))}
                  {!products.length ? <p className="text-xs text-[#6f6251]">No products in catalog.</p> : null}
                </div>
                <p className="mt-2 text-xs text-[#6f6251]">
                  For Rx products, set an override (can match the default %) to enable commission on that item.
                </p>
              </div>

              <button type="button" onClick={() => void saveCommissions()} className={adminBtnPrimary}>
                Save commission rates
              </button>

              <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                <BrandedQrCard
                  value={selected.links.shop}
                  label="Scan to shop"
                  filename={`kian-prive-${selected.partnerCode}-shop.png`}
                />
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Shop link</p>
                    <p className="mt-1 break-all text-[#2b2218]">{selected.links.shop}</p>
                    <button type="button" className={`${adminBtnGhost} mt-2`} onClick={() => void copyText("shop", selected.links.shop)}>
                      {copied === "shop" ? "Copied" : "Copy shop link"}
                    </button>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Home / book links</p>
                    <p className="mt-1 break-all text-xs text-[#6f6251]">{selected.links.home}</p>
                    <p className="mt-1 break-all text-xs text-[#6f6251]">{selected.links.book}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" className={adminBtnGhost} onClick={() => void copyText("code", selected.partnerCode)}>
                        {copied === "code" ? "Copied" : "Copy code"}
                      </button>
                      <button type="button" className={adminBtnGhost} onClick={() => void copyText("book", selected.links.book)}>
                        {copied === "book" ? "Copied" : "Copy book link"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#6f6251]">Select or create an ambassador to view links and QR.</p>
          )}
        </section>
      </div>
    </div>
  );
}
