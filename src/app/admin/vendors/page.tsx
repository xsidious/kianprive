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
  adminTextarea,
  adminTitle,
  money,
  statusTone,
} from "@/components/admin/ui";

type Vendor = {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  paymentMethod: string | null;
  payoutDetails: Record<string, string> | null;
  notes: string | null;
  _count: { products: number; payables: number };
};

type Payable = {
  id: string;
  reference: string;
  status: string;
  amount: number;
  paidReference: string | null;
  vendor: { id: string; name: string; email: string | null; paymentMethod: string | null };
  order: { id: string; orderNumber: string; email: string | null };
};

const emptyDraft = {
  name: "",
  contactName: "",
  email: "",
  phone: "",
  paymentMethod: "ACH",
  bankName: "",
  routingNumber: "",
  accountNumber: "",
  accountName: "",
  notes: "",
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [openPayables, setOpenPayables] = useState<Payable[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [status, setStatus] = useState("");
  const [payRef, setPayRef] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch("/api/admin/vendors");
    if (!res.ok) return;
    const data = (await res.json()) as { vendors: Vendor[]; openPayables: Payable[] };
    setVendors(data.vendors);
    setOpenPayables(data.openPayables);
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveVendor() {
    const res = await fetch("/api/admin/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        contactName: draft.contactName,
        email: draft.email || null,
        phone: draft.phone,
        paymentMethod: draft.paymentMethod,
        payoutDetails: {
          bankName: draft.bankName,
          routingNumber: draft.routingNumber,
          accountNumber: draft.accountNumber,
          accountName: draft.accountName,
        },
        notes: draft.notes,
      }),
    });
    setStatus(res.ok ? "Vendor saved. Assign this vendor on clinical products next." : "Could not save vendor.");
    if (res.ok) {
      setDraft(emptyDraft);
      await load();
    }
  }

  async function updatePayable(id: string, action: "send" | "pay") {
    const res = await fetch(`/api/admin/vendor-payables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        paidReference: payRef[id] || undefined,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setStatus(res.ok ? (action === "send" ? "Purchase order emailed to vendor." : "Vendor payment recorded.") : data.error || "Update failed.");
    if (res.ok) await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Fulfillment</p>
        <h1 className={adminTitle}>Vendors</h1>
        <p className={adminMuted}>
          Store pharmacy and supply-vendor payment details here. When a patient invoice is paid, a vendor bill is
          created from wholesale cost. Email the PO from this page, then record the ACH, wire, or check you sent —
          Authorize.net collects patient payments; outbound vendor payment is recorded against the stored bank details.
        </p>
      </div>

      {status ? <p className="text-sm text-[#1b6568]">{status}</p> : null}

      <section className={`${adminPanel} p-5 space-y-3`}>
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Add vendor</p>
        <div className="grid gap-3 md:grid-cols-2">
          <input className={adminInput} placeholder="Vendor / pharmacy name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          <input className={adminInput} placeholder="Contact name" value={draft.contactName} onChange={(e) => setDraft((d) => ({ ...d, contactName: e.target.value }))} />
          <input className={adminInput} placeholder="Email for purchase orders" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
          <input className={adminInput} placeholder="Phone" value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
          <select className={adminSelect} value={draft.paymentMethod} onChange={(e) => setDraft((d) => ({ ...d, paymentMethod: e.target.value }))}>
            <option value="ACH">ACH</option>
            <option value="WIRE">Wire</option>
            <option value="CHECK">Check</option>
            <option value="PORTAL">Vendor portal</option>
          </select>
          <input className={adminInput} placeholder="Bank name" value={draft.bankName} onChange={(e) => setDraft((d) => ({ ...d, bankName: e.target.value }))} />
          <input className={adminInput} placeholder="Routing number" value={draft.routingNumber} onChange={(e) => setDraft((d) => ({ ...d, routingNumber: e.target.value }))} />
          <input className={adminInput} placeholder="Account number" value={draft.accountNumber} onChange={(e) => setDraft((d) => ({ ...d, accountNumber: e.target.value }))} />
          <input className={adminInput} placeholder="Account name" value={draft.accountName} onChange={(e) => setDraft((d) => ({ ...d, accountName: e.target.value }))} />
        </div>
        <textarea className={adminTextarea} placeholder="Internal notes" value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
        <button type="button" className={adminBtnPrimary} disabled={!draft.name} onClick={() => void saveVendor()}>
          Save vendor
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-2xl text-[#1f1a15]">Open vendor bills</h2>
        {openPayables.map((payable) => (
          <article key={payable.id} className={`${adminPanel} p-5 space-y-3`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-xl">{payable.vendor.name}</p>
                <p className="text-sm text-[#6f6251]">
                  {payable.reference} · Patient order {payable.order.orderNumber} · {money(payable.amount)}
                </p>
                <p className="text-xs text-[#8f6f3e]">{payable.vendor.paymentMethod || "Set payment method"}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(payable.status)}`}>
                {payable.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={adminBtnGhost} onClick={() => void updatePayable(payable.id, "send")}>
                Email PO to vendor
              </button>
              <input
                className={`${adminInput} max-w-xs`}
                placeholder="ACH / check confirmation #"
                value={payRef[payable.id] ?? ""}
                onChange={(e) => setPayRef((prev) => ({ ...prev, [payable.id]: e.target.value }))}
              />
              <button type="button" className={adminBtnPrimary} onClick={() => void updatePayable(payable.id, "pay")}>
                Record vendor paid
              </button>
            </div>
          </article>
        ))}
        {!openPayables.length ? <p className="text-sm text-[#6f6251]">No open vendor bills. They appear after a patient invoice is paid, if products have a vendor and wholesale cost.</p> : null}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {vendors.map((vendor) => (
          <article key={vendor.id} className={`${adminPanel} p-5`}>
            <p className="font-serif text-xl">{vendor.name}</p>
            <p className="text-sm text-[#6f6251]">{vendor.email || "No PO email"} · {vendor.paymentMethod || "No method"}</p>
            <p className="mt-2 text-xs text-[#8f6f3e]">
              {vendor._count.products} products · {vendor._count.payables} bills
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
