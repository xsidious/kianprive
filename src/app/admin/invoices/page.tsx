"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PricingCalculatorDrawer } from "@/components/admin/PricingCalculatorDrawer";
import { ProductPricingHint, type VendorOffer } from "@/components/admin/ProductPricingHint";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminEyebrow,
  adminInput,
  adminMuted,
  adminPanel,
  adminSelect,
  adminTextarea,
  adminTitle,
  money,
  statusTone,
} from "@/components/admin/ui";
import { lineProfit } from "@/lib/commerce/vendor-pricing-math";

type Product = {
  id: string;
  title: string;
  price: number;
  catalogKind: string;
  category: string | null;
  subcategory: string | null;
  form: string | null;
  strength: string | null;
  sku: string | null;
  isPrescription: boolean;
  vendorOffers?: VendorOffer[];
  bestVendor?: VendorOffer | null;
  suggestedPrice?: number | null;
  landedCost?: number | null;
};

type Patient = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
};

type Invoice = {
  id: string;
  orderNumber: string;
  email: string | null;
  total: number;
  paymentStatus: string;
  createdAt: string;
  paymentUrl: string | null;
  patientName: string | null;
  items: Array<{ id: string; title: string; quantity: number; unitPrice: number }>;
  vendorPayables: Array<{ id: string; status: string; amount: number; reference: string; vendor: { name: string } }>;
};

type Line = { productId: string; quantity: number; unitPrice: number };
type Vendor = { id: string; name: string };
type ShippingDefaults = { flatRate: number; freeThreshold: number; alwaysFree: boolean };
type PricingDefaults = { marginPercent: number; extraDollars: number; includeStoreShipping: boolean };

const catalogKinds = [
  { id: "ALL", label: "All" },
  { id: "CLINICAL", label: "Clinical" },
  { id: "RETAIL", label: "Shop" },
] as const;

export default function AdminInvoicesPage() {
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [shipping, setShipping] = useState<ShippingDefaults | null>(null);
  const [pricing, setPricing] = useState<PricingDefaults | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [intakeId, setIntakeId] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<(typeof catalogKinds)[number]["id"]>("ALL");
  const [category, setCategory] = useState("All");
  const [lines, setLines] = useState<Line[]>([]);
  const [calcProductId, setCalcProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/invoices");
    if (!res.ok) {
      setStatus("Could not load invoices.");
      return;
    }
    const data = (await res.json()) as {
      invoices: Invoice[];
      patients: Patient[];
      products: Product[];
      categories?: string[];
      vendors?: Vendor[];
      shipping?: ShippingDefaults;
      pricing?: PricingDefaults;
    };
    setInvoices(data.invoices);
    setPatients(data.patients);
    setProducts(data.products);
    setCategories(data.categories ?? []);
    setVendors(data.vendors ?? []);
    setShipping(data.shipping ?? null);
    setPricing(data.pricing ?? null);
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const patientId = searchParams.get("patient");
    if (!patientId || !patients.length) return;
    const patient = patients.find((p) => p.id === patientId);
    if (patient) applyPatient(patient);
  }, [searchParams, patients]);

  function applyPatient(patient: Patient) {
    setIntakeId(patient.id);
    setFullName(patient.fullName);
    setEmail(patient.email);
    setPhone(patient.phone);
  }

  const filteredPatients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => `${p.fullName} ${p.email} ${p.phone}`.toLowerCase().includes(q));
  }, [patients, patientSearch]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      if (kind !== "ALL" && product.catalogKind !== kind) return false;
      if (category !== "All" && product.category !== category) return false;
      if (!q) return true;
      return `${product.title} ${product.category ?? ""} ${product.form ?? ""} ${product.sku ?? ""}`.toLowerCase().includes(q);
    });
  }, [products, search, kind, category]);

  const selectedIds = useMemo(() => new Set(lines.map((line) => line.productId)), [lines]);

  const totals = useMemo(() => {
    let charge = 0;
    let cost = 0;
    let profit = 0;
    for (const line of lines) {
      const product = products.find((p) => p.id === line.productId);
      const lineTotal = line.unitPrice * line.quantity;
      charge += lineTotal;
      const landed = product?.landedCost ?? product?.bestVendor?.landedCost ?? null;
      if (landed != null && landed > 0) {
        cost += landed * line.quantity;
        profit += lineProfit({ unitPrice: line.unitPrice, quantity: line.quantity, landedCost: landed }) ?? 0;
      }
    }
    return { charge, cost, profit };
  }, [lines, products]);

  function addProduct(product: Product) {
    setLines((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) return prev.filter((line) => line.productId !== product.id);
      const unitPrice = product.suggestedPrice ?? (product.price > 0 ? product.price : 0);
      return [...prev, { productId: product.id, quantity: 1, unitPrice }];
    });
  }

  async function loadFromTherapy() {
    if (!intakeId) {
      setStatus("Pick a patient from intake first.");
      return;
    }
    const res = await fetch(`/api/intake/therapy?intakeSubmissionId=${intakeId}`);
    const data = (await res.json()) as {
      proposal?: { items?: Array<{ productId: string; quantity: number; unitPrice?: number }> } | null;
    };
    if (!res.ok || !data.proposal?.items?.length) {
      setStatus("No therapy plan on this intake yet. Assign therapy on Prescriptions first.");
      return;
    }
    setLines(
      data.proposal.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? products.find((p) => p.id === item.productId)?.price ?? 0,
      })),
    );
    setStatus(`Loaded ${data.proposal.items.length} items from therapy plan.`);
  }

  async function createInvoice() {
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        notes,
        intakeSubmissionId: intakeId || null,
        send: true,
        items: lines,
      }),
    });
    const data = (await res.json()) as { error?: string; paymentUrl?: string };
    setSaving(false);
    setStatus(res.ok ? `Invoice sent. Pay link: ${data.paymentUrl ?? "see list below."}` : data.error || "Could not create invoice.");
    if (res.ok) {
      setLines([]);
      setNotes("");
      await load();
    }
  }

  async function resend(orderId: string) {
    const res = await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action: "send" }),
    });
    const data = (await res.json()) as { error?: string; paymentUrl?: string };
    setStatus(res.ok ? `Payment link resent.` : data.error || "Could not resend.");
    if (res.ok) await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Billing</p>
        <h1 className={adminTitle}>Patient invoices</h1>
        <p className={adminMuted}>
          Pick a patient from intake or enter manually, add products with vendor cost and your sell price, then email a
          pay link. Profit is calculated from the best vendor quote on each product.
        </p>
      </div>

      {status ? <p className="text-sm text-[#1b6568]">{status}</p> : null}

      <section className={`${adminPanel} space-y-4 p-5`}>
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">1 · Patient</p>
        <input
          className={adminInput}
          placeholder="Search patients from intake…"
          value={patientSearch}
          onChange={(e) => setPatientSearch(e.target.value)}
        />
        <div className="max-h-36 space-y-1 overflow-auto rounded-xl border border-[#efe4d4] bg-[#fffaf3] p-2">
          {filteredPatients.slice(0, 12).map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => applyPatient(patient)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                intakeId === patient.id ? "bg-[#fff6e8] text-[#8f6f3e]" : "hover:bg-white"
              }`}
            >
              <span>{patient.fullName}</span>
              <span className="text-xs text-[#6f6251]">{patient.email}</span>
            </button>
          ))}
          {!filteredPatients.length ? <p className="p-2 text-sm text-[#6f6251]">No patients match.</p> : null}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input className={adminInput} placeholder="Patient name *" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className={adminInput} placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={adminInput} placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={adminBtnGhost} disabled={!intakeId} onClick={() => void loadFromTherapy()}>
            Load from therapy plan
          </button>
          {intakeId ? (
            <Link href={`/admin/prescriptions?intake=${intakeId}`} className={adminBtnGhost}>
              Assign therapy
            </Link>
          ) : null}
        </div>
        <textarea className={adminTextarea} placeholder="Note to patient (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">2 · Products</p>
        <div className="flex flex-wrap gap-2">
          {catalogKinds.map((entry) => (
            <button key={entry.id} type="button" className={kind === entry.id ? adminBtnPrimary : adminBtnGhost} onClick={() => { setKind(entry.id); setCategory("All"); }}>
              {entry.label}
            </button>
          ))}
          <input className={`${adminInput} min-w-[180px] flex-1`} placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={adminSelect} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="max-h-80 space-y-2 overflow-auto rounded-xl border border-[#efe4d4] bg-[#fffaf3] p-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const selected = selectedIds.has(product.id);
              return (
                <div
                  key={product.id}
                  className={`rounded-xl border p-3 ${selected ? "border-[#8a682e] bg-[#fff6e8]" : "border-[#efe4d4] bg-white"}`}
                >
                  <button type="button" className="w-full text-left" onClick={() => addProduct(product)}>
                    <p className="font-medium text-[#1f1a15]">{product.title}</p>
                    <ProductPricingHint
                      compact
                      bestVendor={product.bestVendor}
                      landedCost={product.landedCost}
                      price={product.price}
                      suggestedPrice={product.suggestedPrice}
                    />
                  </button>
                  <button type="button" className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#8f6f3e]" onClick={() => setCalcProductId(product.id)}>
                    Vendor quotes
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {lines.length ? (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">3 · Invoice lines</p>
            {lines.map((line) => {
              const product = products.find((row) => row.id === line.productId);
              const landed = product?.landedCost ?? product?.bestVendor?.landedCost ?? null;
              const profit = lineProfit({ unitPrice: line.unitPrice, quantity: line.quantity, landedCost: landed });
              return (
                <div key={line.productId} className="rounded-xl border border-[#efe4d4] bg-white p-3 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{product?.title}</p>
                      {product ? (
                        <ProductPricingHint
                          compact
                          bestVendor={product.bestVendor}
                          landedCost={product.landedCost}
                          price={line.unitPrice}
                          suggestedPrice={product.suggestedPrice}
                        />
                      ) : null}
                    </div>
                    <button type="button" className="text-[#7c2c2c]" onClick={() => setLines((prev) => prev.filter((row) => row.productId !== line.productId))}>
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1">
                      Qty
                      <input
                        className={`${adminInput} w-16`}
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((row) =>
                              row.productId === line.productId ? { ...row, quantity: Math.max(1, Number(e.target.value) || 1) } : row,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      Patient price $
                      <input
                        className={`${adminInput} w-24`}
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((row) =>
                              row.productId === line.productId ? { ...row, unitPrice: Number(e.target.value || 0) } : row,
                            ),
                          )
                        }
                      />
                    </label>
                    {product?.suggestedPrice ? (
                      <button
                        type="button"
                        className={adminBtnGhost}
                        onClick={() =>
                          setLines((prev) =>
                            prev.map((row) =>
                              row.productId === line.productId ? { ...row, unitPrice: product.suggestedPrice! } : row,
                            ),
                          )
                        }
                      >
                        Use suggested
                      </button>
                    ) : null}
                    {profit != null ? <span className="text-[#2f6b3a]">Profit {money(profit)}</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#6f6251]">Click products above to add them.</p>
        )}

        <div className="grid gap-2 rounded-xl border border-[#efe4d4] bg-[#fffaf3] p-4 sm:grid-cols-3">
          <p className="text-sm">Patient pays: <strong>{money(totals.charge)}</strong></p>
          <p className="text-sm">Vendor cost: <strong>{money(totals.cost)}</strong></p>
          <p className="text-sm text-[#2f6b3a]">Your profit: <strong>{money(totals.profit)}</strong></p>
        </div>

        <button type="button" className={adminBtnPrimary} disabled={saving || !fullName || !email || !lines.length} onClick={() => void createInvoice()}>
          {saving ? "Sending…" : "Create & email pay link"}
        </button>
      </section>

      <section className="space-y-3">
        {invoices.map((invoice) => (
          <article key={invoice.id} className={`${adminPanel} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-xl">{invoice.orderNumber}</p>
                <p className="text-sm text-[#6f6251]">{invoice.patientName || invoice.email} · {money(invoice.total)}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(invoice.paymentStatus)}`}>
                {invoice.paymentStatus}
              </span>
            </div>
            <ul className="mt-3 text-sm text-[#4f4335]">
              {invoice.items.map((item) => (
                <li key={item.id}>{item.title} × {item.quantity} · {money(item.unitPrice)}</li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {invoice.paymentUrl && invoice.paymentStatus !== "PAID" ? (
                <a href={invoice.paymentUrl} className={adminBtnGhost} target="_blank" rel="noreferrer">Open pay link</a>
              ) : null}
              {invoice.paymentStatus !== "PAID" ? (
                <button type="button" className={adminBtnGhost} onClick={() => void resend(invoice.id)}>Resend email</button>
              ) : null}
            </div>
          </article>
        ))}
        {!invoices.length ? <p className="text-sm text-[#6f6251]">No invoices yet.</p> : null}
      </section>

      <PricingCalculatorDrawer
        catalog={products}
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
