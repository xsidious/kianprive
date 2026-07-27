"use client";

import { useEffect, useState } from "react";
import { BrandedQrCard } from "@/components/ambassador/BrandedQrCard";
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

type AmbassadorRow = {
  id: string;
  displayName: string;
  partnerCode: string;
  status: string;
  phone: string | null;
  defaultProductCommissionPct: number | string;
  user: { email: string; name: string | null };
  links: { shop: string; home: string; book: string; code: string };
  stats: {
    paidOrders: number;
    paidSalesTotal: number;
    mtdOrders: number;
    mtdSalesTotal: number;
    eligibleCommission: number;
  };
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function AdminAmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<AmbassadorRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");

  async function load() {
    const res = await fetch("/api/admin/ambassadors");
    if (!res.ok) {
      setMessage("Could not load ambassadors.");
      return;
    }
    const payload = (await res.json()) as { ambassadors: AmbassadorRow[]; error?: string };
    if (payload.error) setMessage(payload.error);
    setAmbassadors(payload.ambassadors ?? []);
    if (!selectedId && payload.ambassadors?.[0]) setSelectedId(payload.ambassadors[0].id);
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
      setSelectedId(payload.ambassador.id);
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
          Create ambassador accounts with unique codes, branded QR downloads, and sales tracking. Codes work for shop and
          booking attribution.
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
            <p className="text-xs text-[#6f6251]">Product commission % · status</p>
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
                onClick={() => setSelectedId(ambassador.id)}
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
                  {ambassador.partnerCode} · {money(ambassador.stats.paidSalesTotal)} sales
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
                  <p className="text-xs text-[#6f6251]">
                    Product commission default: {String(selected.defaultProductCommissionPct)}%. Shop purchases and
                    bookings through this code are attributed automatically.
                  </p>
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
