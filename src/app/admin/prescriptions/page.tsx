"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
};

type RecordRow = {
  id: string;
  status: string;
  patient: { id: string; fullName: string; email: string; status: string };
  provider: string;
  order: { id: string; orderNumber: string; total: number; paymentStatus: string } | null;
  items: Array<{ id: string; title: string; quantity: number; unitPrice: number }>;
  total: number;
  sentAt: string | null;
  billing?: { status: string; interval: string; nextChargeAt: string | null } | null;
};

type Vendor = { id: string; name: string };

export default function AdminPrescriptionsPage() {
  const [tab, setTab] = useState<"catalog" | "patients">("catalog");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [prices, setPrices] = useState<Record<string, string>>({});
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
      records: RecordRow[];
      vendors: Vendor[];
    };
    setCatalog(data.catalog);
    setRecords(data.records);
    setVendors(data.vendors);
    const next: Record<string, string> = {};
    for (const item of data.catalog) next[item.id] = item.price > 0 ? String(item.price) : "";
    setPrices(next);
  }

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((item) => {
      if (!q) return true;
      return `${item.title} ${item.category ?? ""} ${item.sku ?? ""} ${item.strength ?? ""}`.toLowerCase().includes(q);
    });
  }, [catalog, search]);

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
            Price every peptide and compound here, then assign them on intake. Patient prescriptions sent from intake
            appear on the second tab so you can track what was prescribed and whether it was paid.
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
          className={tab === "catalog" ? adminBtnPrimary : adminBtnGhost}
          onClick={() => setTab("catalog")}
        >
          Catalog ({catalog.length})
        </button>
        <button
          type="button"
          className={tab === "patients" ? adminBtnPrimary : adminBtnGhost}
          onClick={() => setTab("patients")}
        >
          Patient prescriptions ({records.length})
        </button>
      </div>

      {tab === "catalog" ? (
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
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Cost</th>
                  <th className="px-3 py-2">Vendor</th>
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
                    <td className="px-3 py-3 text-[#6f6251]">{item.category || "—"}</td>
                    <td className="px-3 py-3">
                      <input
                        className={`${adminInput} w-28`}
                        type="number"
                        step="0.01"
                        value={prices[item.id] ?? ""}
                        onChange={(e) => setPrices((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      />
                    </td>
                    <td className="px-3 py-3 text-[#6f6251]">{item.wholesalePrice != null ? money(item.wholesalePrice) : "—"}</td>
                    <td className="px-3 py-3 text-[#6f6251]">{item.vendor?.name || "—"}</td>
                    <td className="px-3 py-3">
                      <button type="button" className={adminBtnGhost} onClick={() => void savePrice(item.id)}>
                        Save price
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visible.length ? <p className="p-6 text-sm text-[#6f6251]">No prescriptions match.</p> : null}
          </div>
        </>
      ) : (
        <section className="space-y-3">
          {records.map((row) => (
            <article key={row.id} className={`${adminPanel} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-xl text-[#1f1a15]">{row.patient.fullName}</p>
                  <p className="text-sm text-[#6f6251]">
                    {row.patient.email} · {row.provider}
                    {row.order ? ` · ${row.order.orderNumber}` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(row.order?.paymentStatus || row.status)}`}>
                  {row.order?.paymentStatus || row.status}
                </span>
              </div>
              <ul className="mt-3 text-sm text-[#4f4335]">
                {row.items.map((item) => (
                  <li key={item.id}>
                    {item.title} × {item.quantity}
                    {item.unitPrice > 0 ? ` · ${money(item.unitPrice)}` : ""}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-serif text-lg">{money(row.total)}</p>
              {row.billing ? (
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#8f6f3e]">
                  {row.billing.interval.replace(/_/g, " ").toLowerCase()} · {row.billing.status}
                </p>
              ) : null}
              <Link href="/admin/intake" className="mt-2 inline-block text-xs uppercase tracking-[0.12em] text-[#8f6f3e]">
                Open intake
              </Link>
            </article>
          ))}
          {!records.length ? <p className="text-sm text-[#6f6251]">No patient prescriptions sent yet.</p> : null}
        </section>
      )}
    </div>
  );
}
