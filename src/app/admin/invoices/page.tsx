"use client";

import { useEffect, useMemo, useState } from "react";
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

type Product = {
  id: string;
  title: string;
  price: number;
  catalogKind: string;
  category: string | null;
  vendorId: string | null;
  wholesalePrice: number | null;
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

type Line = { productId: string; quantity: number };

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [intakeId, setIntakeId] = useState("");
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/invoices");
    if (!res.ok) {
      setStatus("Could not load invoices.");
      return;
    }
    const data = (await res.json()) as { invoices: Invoice[]; patients: Patient[]; products: Product[] };
    setInvoices(data.invoices);
    setPatients(data.patients);
    setProducts(data.products);
  }

  useEffect(() => {
    void load();
  }, []);

  function applyPatient(patient: Patient) {
    setIntakeId(patient.id);
    setFullName(patient.fullName);
    setEmail(patient.email);
    setPhone(patient.phone);
  }

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      if (!q) return product.catalogKind === "CLINICAL" || product.category === "Supplies";
      return `${product.title} ${product.category ?? ""}`.toLowerCase().includes(q);
    });
  }, [products, search]);

  const total = lines.reduce((sum, line) => {
    const product = products.find((row) => row.id === line.productId);
    return sum + (product ? product.price * line.quantity : 0);
  }, 0);

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
    setStatus(res.ok ? `Invoice sent. Pay link: ${data.paymentUrl ?? "copied in the list below."}` : data.error || "Could not create invoice.");
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
    setStatus(res.ok ? `Payment link resent${data.paymentUrl ? `: ${data.paymentUrl}` : "."}` : data.error || "Could not resend.");
    if (res.ok) await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Billing</p>
        <h1 className={adminTitle}>Patient invoices</h1>
        <p className={adminMuted}>
          Create an invoice from today&apos;s prescription, email a pay link, and collect payment on kianprive.com.
          After the patient pays, vendor bills appear under Vendors so you can send the PO and record payment to the
          pharmacy without leaving admin.
        </p>
      </div>

      {status ? <p className="text-sm text-[#1b6568]">{status}</p> : null}

      <section className={`${adminPanel} p-5 space-y-4`}>
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">New invoice</p>
        <div className="grid gap-3 md:grid-cols-2">
          <input className={adminInput} placeholder="Patient name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className={adminInput} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={adminInput} placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <select className={adminSelect} value={intakeId} onChange={(e) => {
            const patient = patients.find((row) => row.id === e.target.value);
            if (patient) applyPatient(patient);
            else setIntakeId("");
          }}>
            <option value="">Link recent intake (optional)</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName} — {patient.email}
              </option>
            ))}
          </select>
        </div>
        <textarea className={adminTextarea} placeholder="Note to patient (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <input className={adminInput} placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="max-h-56 overflow-auto rounded-xl border border-[#efe4d4]">
          {filteredProducts.slice(0, 40).map((product) => (
            <button
              key={product.id}
              type="button"
              className="flex w-full items-center justify-between gap-3 border-b border-[#f3ebe0] px-3 py-2 text-left text-sm last:border-0 hover:bg-[#fff8ef]"
              onClick={() =>
                setLines((prev) => {
                  const existing = prev.find((line) => line.productId === product.id);
                  if (existing) {
                    return prev.map((line) =>
                      line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line,
                    );
                  }
                  return [...prev, { productId: product.id, quantity: 1 }];
                })
              }
            >
              <span>
                {product.title}
                <span className="ml-2 text-xs text-[#8f6f3e]">{product.category || product.catalogKind}</span>
              </span>
              <span>{money(product.price)}</span>
            </button>
          ))}
        </div>

        {lines.length ? (
          <ul className="space-y-2">
            {lines.map((line) => {
              const product = products.find((row) => row.id === line.productId);
              return (
                <li key={line.productId} className="flex items-center justify-between gap-3 text-sm">
                  <span>{product?.title ?? line.productId}</span>
                  <span className="flex items-center gap-2">
                    <button type="button" onClick={() => setLines((prev) => prev.map((row) => row.productId === line.productId ? { ...row, quantity: Math.max(1, row.quantity - 1) } : row))}>−</button>
                    {line.quantity}
                    <button type="button" onClick={() => setLines((prev) => prev.map((row) => row.productId === line.productId ? { ...row, quantity: row.quantity + 1 } : row))}>+</button>
                    <button type="button" className="text-[#7c2c2c]" onClick={() => setLines((prev) => prev.filter((row) => row.productId !== line.productId))}>
                      Remove
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-[#6f6251]">Click products to add them to this invoice.</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-serif text-2xl">{money(total)}</p>
          <button type="button" className={adminBtnPrimary} disabled={saving || !fullName || !email || !lines.length} onClick={() => void createInvoice()}>
            {saving ? "Sending…" : "Create & email pay link"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {invoices.map((invoice) => (
          <article key={invoice.id} className={`${adminPanel} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-xl">{invoice.orderNumber}</p>
                <p className="text-sm text-[#6f6251]">
                  {invoice.patientName || invoice.email} · {money(invoice.total)}
                </p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(invoice.paymentStatus)}`}>
                {invoice.paymentStatus}
              </span>
            </div>
            <ul className="mt-3 text-sm text-[#4f4335]">
              {invoice.items.map((item) => (
                <li key={item.id}>
                  {item.title} × {item.quantity}
                </li>
              ))}
            </ul>
            {invoice.vendorPayables.length ? (
              <p className="mt-2 text-xs text-[#8f6f3e]">
                Vendor bills: {invoice.vendorPayables.map((p) => `${p.vendor.name} ${p.status}`).join(" · ")}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {invoice.paymentUrl && invoice.paymentStatus !== "PAID" ? (
                <a href={invoice.paymentUrl} className={adminBtnGhost} target="_blank" rel="noreferrer">
                  Open pay link
                </a>
              ) : null}
              {invoice.paymentStatus !== "PAID" ? (
                <button type="button" className={adminBtnGhost} onClick={() => void resend(invoice.id)}>
                  Resend email
                </button>
              ) : null}
            </div>
          </article>
        ))}
        {!invoices.length ? <p className="text-sm text-[#6f6251]">No invoices yet.</p> : null}
      </section>
    </div>
  );
}
