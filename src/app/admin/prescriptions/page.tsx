"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminModal } from "@/components/admin/AdminModal";
import { PricingCalculatorDrawer } from "@/components/admin/PricingCalculatorDrawer";
import { IntakeTherapyPicker } from "@/components/intake/IntakeTherapyPicker";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminEyebrow,
  adminInput,
  adminMuted,
  adminPanel,
  adminSelect,
  adminTitle,
  money,
  statusTone,
} from "@/components/admin/ui";

type VendorOffer = {
  id: string;
  vendorId: string;
  vendorName: string;
  unitCost: number;
  shippingCost: number;
  landedCost: number;
};

type CatalogItem = {
  id: string;
  title: string;
  category: string | null;
  form: string | null;
  strength: string | null;
  sku: string | null;
  price: number;
  wholesalePrice: number | null;
  isPrescription: boolean;
  status: string;
  vendorId: string | null;
  vendor: { id: string; name: string } | null;
  vendorOffers?: VendorOffer[];
  bestVendor?: VendorOffer | null;
  suggestedPrice?: number | null;
};

type TherapyItem = { id: string; title: string; quantity: number; unitPrice: number };

type IntakeRow = {
  id: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
  provider: string;
  hasTherapy: boolean;
  therapy: {
    id: string;
    status: string;
    order: { id: string; orderNumber: string; total: number; paymentStatus: string } | null;
    items: TherapyItem[];
    total: number;
    billing?: { status: string; interval: string; nextChargeAt: string | null } | null;
  } | null;
};

type Vendor = { id: string; name: string };
type ShippingDefaults = { flatRate: number; freeThreshold: number; alwaysFree: boolean };
type PricingDefaults = { marginPercent: number; extraDollars: number; includeStoreShipping: boolean };

export default function AdminPrescriptionsPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"patients" | "catalog">("patients");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [intakes, setIntakes] = useState<IntakeRow[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [shipping, setShipping] = useState<ShippingDefaults | null>(null);
  const [pricing, setPricing] = useState<PricingDefaults | null>(null);
  const [calcProductId, setCalcProductId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [status, setStatus] = useState("");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [therapyIntakeId, setTherapyIntakeId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    category: "Peptides",
    form: "",
    strength: "",
    price: "",
    wholesalePrice: "",
    vendorId: "",
    sku: "",
  });

  async function load() {
    const res = await fetch("/api/admin/prescriptions");
    if (!res.ok) {
      setStatus("Could not load prescriptions.");
      return;
    }
    const data = (await res.json()) as {
      catalog: CatalogItem[];
      intakes: IntakeRow[];
      vendors: Vendor[];
      shipping?: ShippingDefaults;
      pricing?: PricingDefaults;
    };
    setCatalog(data.catalog);
    setIntakes(data.intakes ?? []);
    setVendors(data.vendors);
    setShipping(data.shipping ?? null);
    setPricing(data.pricing ?? null);
    const next: Record<string, string> = {};
    for (const item of data.catalog) next[item.id] = item.price > 0 ? String(item.price) : "";
    setPrices(next);
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const id = searchParams.get("intake");
    if (id) {
      setTab("patients");
      setTherapyIntakeId(id);
    }
  }, [searchParams]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((item) => {
      if (!q) return true;
      return `${item.title} ${item.category ?? ""} ${item.sku ?? ""} ${item.strength ?? ""}`.toLowerCase().includes(q);
    });
  }, [catalog, search]);

  const visibleIntakes = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    if (!q) return intakes;
    return intakes.filter((row) =>
      `${row.fullName} ${row.email} ${row.provider} ${row.status}`.toLowerCase().includes(q),
    );
  }, [intakes, patientSearch]);

  const therapyIntake = intakes.find((row) => row.id === therapyIntakeId) ?? null;
  const withTherapy = intakes.filter((row) => row.hasTherapy).length;

  async function savePrice(id: string) {
    const price = Number(prices[id] || 0);
    const res = await fetch("/api/admin/prescriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, price, isPrescription: true }),
    });
    setStatus(res.ok ? "Price saved." : "Could not save price.");
    if (res.ok) await load();
  }

  async function applySuggested(id: string) {
    const res = await fetch("/api/admin/vendor-offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "applySuggested", productId: id }),
    });
    const data = (await res.json()) as { error?: string; suggestedRetail?: number };
    setStatus(res.ok ? `Price set to ${money(data.suggestedRetail ?? 0)}.` : data.error || "Could not apply price.");
    if (res.ok) await load();
  }

  async function markAll() {
    const res = await fetch("/api/admin/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllPrescriptions" }),
    });
    const data = (await res.json()) as { updated?: number; error?: string };
    setStatus(res.ok ? `Marked ${data.updated ?? 0} clinical products as prescriptions.` : data.error || "Update failed.");
    if (res.ok) await load();
  }

  async function createRx() {
    const res = await fetch("/api/admin/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.title,
        category: draft.category,
        form: draft.form || null,
        strength: draft.strength || null,
        price: Number(draft.price || 0),
        wholesalePrice: draft.wholesalePrice === "" ? null : Number(draft.wholesalePrice),
        vendorId: draft.vendorId || null,
        sku: draft.sku || null,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setStatus(res.ok ? "Prescription added to catalog." : data.error || "Could not add prescription.");
    if (res.ok) {
      setDraft({ title: "", category: "Peptides", form: "", strength: "", price: "", wholesalePrice: "", vendorId: "", sku: "" });
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={adminEyebrow}>Clinical</p>
          <h1 className={adminTitle}>Prescriptions</h1>
          <p className={adminMuted}>
            Every intake appears here automatically. On Catalog, add each company’s price and shipping — we keep the
            cheapest quote and suggest a patient price that covers cost, shipping, and profit.
          </p>
        </div>
        <Link href="/admin/intake" className={adminBtnGhost}>
          Open intake
        </Link>
      </div>

      {status ? <p className="text-sm text-[#1b6568]">{status}</p> : null}

      <div className="flex gap-2">
        <button
          type="button"
          className={tab === "patients" ? adminBtnPrimary : adminBtnGhost}
          onClick={() => setTab("patients")}
        >
          Intakes ({intakes.length})
        </button>
        <button
          type="button"
          className={tab === "catalog" ? adminBtnPrimary : adminBtnGhost}
          onClick={() => setTab("catalog")}
        >
          Catalog ({catalog.length})
        </button>
      </div>

      {tab === "patients" ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              className={`${adminInput} max-w-sm`}
              placeholder="Search patients…"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
            <p className="text-xs uppercase tracking-[0.12em] text-[#8f6f3e]">
              {withTherapy} with prescriptions · {intakes.length - withTherapy} need therapy
            </p>
          </div>
          {visibleIntakes.map((row) => (
            <article key={row.id} className={`${adminPanel} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-xl text-[#1f1a15]">{row.fullName}</p>
                  <p className="text-sm text-[#6f6251]">
                    {row.email} · {row.provider}
                    {row.therapy?.order ? ` · ${row.therapy.order.orderNumber}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(row.status)}`}>
                    {row.status.replaceAll("_", " ")}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(
                      row.therapy?.order?.paymentStatus || row.therapy?.status || "NO THERAPY",
                    )}`}
                  >
                    {row.hasTherapy ? row.therapy?.order?.paymentStatus || row.therapy?.status : "No therapy"}
                  </span>
                </div>
              </div>
              {row.hasTherapy && row.therapy ? (
                <>
                  <ul className="mt-3 text-sm text-[#4f4335]">
                    {row.therapy.items.map((item) => (
                      <li key={item.id}>
                        {item.title} × {item.quantity}
                        {item.unitPrice > 0 ? ` · ${money(item.unitPrice)}` : ""}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 font-serif text-lg">{money(row.therapy.total)}</p>
                  {row.therapy.billing ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#8f6f3e]">
                      {row.therapy.billing.interval.replace(/_/g, " ").toLowerCase()} · {row.therapy.billing.status}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="mt-3 text-sm text-[#6f6251]">No therapy assigned yet. Create prescriptions from this intake.</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className={adminBtnPrimary} onClick={() => setTherapyIntakeId(row.id)}>
                  {row.hasTherapy ? "Edit therapy" : "Create therapy"}
                </button>
                <Link href={`/admin/intake?open=${row.id}`} className={adminBtnGhost}>
                  View intake
                </Link>
                <Link href={`/admin/invoices?patient=${row.id}`} className={adminBtnGhost}>
                  Invoice
                </Link>
              </div>
            </article>
          ))}
          {!visibleIntakes.length ? (
            <p className="text-sm text-[#6f6251]">No intake forms yet. New peptide / GLP intakes will appear here automatically.</p>
          ) : null}
        </section>
      ) : (
        <>
          <section className={`${adminPanel} space-y-3 p-5`}>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Add prescription</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input className={adminInput} placeholder="Title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
              <input className={adminInput} placeholder="Category" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} />
              <input className={adminInput} placeholder="Form" value={draft.form} onChange={(e) => setDraft((d) => ({ ...d, form: e.target.value }))} />
              <input className={adminInput} placeholder="Strength" value={draft.strength} onChange={(e) => setDraft((d) => ({ ...d, strength: e.target.value }))} />
              <input className={adminInput} type="number" step="0.01" placeholder="Patient price" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} />
              <input className={adminInput} type="number" step="0.01" placeholder="Vendor cost" value={draft.wholesalePrice} onChange={(e) => setDraft((d) => ({ ...d, wholesalePrice: e.target.value }))} />
              <select className={adminSelect} value={draft.vendorId} onChange={(e) => setDraft((d) => ({ ...d, vendorId: e.target.value }))}>
                <option value="">Vendor (optional)</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              <input className={adminInput} placeholder="SKU" value={draft.sku} onChange={(e) => setDraft((d) => ({ ...d, sku: e.target.value }))} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={adminBtnPrimary} disabled={!draft.title} onClick={() => void createRx()}>
                Add prescription
              </button>
              <button type="button" className={adminBtnGhost} onClick={() => void markAll()}>
                Add all clinical items as prescriptions
              </button>
            </div>
          </section>

          <div className="flex gap-2">
            <input className={adminInput} placeholder="Search catalog…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
                  <th className="px-3 py-2">Prescription</th>
                  <th className="px-3 py-2">Best vendor</th>
                  <th className="px-3 py-2">Our price</th>
                  <th className="px-3 py-2">Suggested</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id} className="border-t border-[#efe4d4]">
                    <td className="px-3 py-3">
                      <p className="font-medium text-[#1f1a15]">{item.title}</p>
                      <p className="text-xs text-[#6f6251]">
                        {[item.form, item.strength, item.sku].filter(Boolean).join(" · ") || "Clinical"}
                        {item.isPrescription ? " · Rx" : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-[#6f6251]">
                      {item.bestVendor ? (
                        <>
                          <p>{item.bestVendor.vendorName}</p>
                          <p className="text-xs">
                            {money(item.bestVendor.landedCost)} landed
                            {(item.vendorOffers?.length ?? 0) > 1 ? ` · ${item.vendorOffers?.length} quotes` : ""}
                          </p>
                        </>
                      ) : (
                        "Add vendor quotes"
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <input
                        className={`${adminInput} w-28`}
                        type="number"
                        step="0.01"
                        value={prices[item.id] ?? ""}
                        onChange={(e) => setPrices((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      />
                    </td>
                    <td className="px-3 py-3 text-[#6f6251]">{item.suggestedPrice != null ? money(item.suggestedPrice) : "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className={adminBtnGhost} onClick={() => void savePrice(item.id)}>
                          Save
                        </button>
                        <button
                          type="button"
                          className={adminBtnGhost}
                          disabled={!item.suggestedPrice}
                          onClick={() => void applySuggested(item.id)}
                        >
                          Use suggested
                        </button>
                        <button type="button" className={adminBtnGhost} onClick={() => setCalcProductId(item.id)}>
                          Vendors
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visible.length ? <p className="p-6 text-sm text-[#6f6251]">No prescriptions match.</p> : null}
          </div>
        </>
      )}

      <AdminModal
        open={Boolean(therapyIntake)}
        title={therapyIntake?.fullName ?? "Therapy"}
        eyebrow={therapyIntake?.hasTherapy ? "Edit prescription" : "Create prescription"}
        wide
        onClose={() => setTherapyIntakeId(null)}
      >
        {therapyIntake ? (
          <IntakeTherapyPicker
            key={therapyIntake.id}
            intakeSubmissionId={therapyIntake.id}
            allowPricing
            onSaved={() => {
              void load();
            }}
          />
        ) : null}
      </AdminModal>

      <PricingCalculatorDrawer
        catalog={catalog}
        vendors={vendors}
        shipping={shipping}
        pricing={pricing}
        selectedProductId={calcProductId}
        onCloseSelect={() => setCalcProductId(null)}
        onChanged={() => void load()}
      />
    </div>
  );
}
