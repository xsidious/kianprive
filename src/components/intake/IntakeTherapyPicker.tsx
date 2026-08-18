"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export type ClinicalProduct = {
  id: string;
  title: string;
  category?: string | null;
  subcategory?: string | null;
  featuredImage?: string | null;
  form?: string | null;
  strength?: string | null;
  isPrescription?: boolean;
  description?: string | null;
  price?: number;
};

type TherapyLine = {
  product: ClinicalProduct;
  quantity: number;
  unitPrice: number;
};

type Props = {
  intakeSubmissionId: string;
  allowPricing?: boolean;
  onSaved?: () => void;
};

export function IntakeTherapyPicker({ intakeSubmissionId, allowPricing = false, onSaved }: Props) {
  const [products, setProducts] = useState<ClinicalProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");
  const [therapy, setTherapy] = useState<TherapyLine[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pickQty, setPickQty] = useState(1);
  const [pickPrice, setPickPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [billingInterval, setBillingInterval] = useState("ONE_TIME");
  const [customDays, setCustomDays] = useState("28");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [catalogRes, proposalRes] = await Promise.all([
        fetch("/api/clinical/products"),
        fetch(`/api/intake/therapy?intakeSubmissionId=${intakeSubmissionId}`),
      ]);
      let catalog: ClinicalProduct[] = [];
      if (catalogRes.ok) {
        const data = (await catalogRes.json()) as { products: ClinicalProduct[]; categories: string[] };
        catalog = data.products ?? [];
        setProducts(catalog);
        setCategories(data.categories ?? []);
      }
      if (proposalRes.ok) {
        const data = (await proposalRes.json()) as {
          proposal?: {
            notes?: string | null;
            items?: Array<{ productId: string; quantity: number; unitPrice?: number }>;
            status?: string;
            billingInterval?: string;
            intervalDays?: number;
          } | null;
        };
        if (data.proposal) {
          setNotes(data.proposal.notes ?? "");
          setBillingInterval(data.proposal.billingInterval ?? "ONE_TIME");
          if (data.proposal.intervalDays) setCustomDays(String(data.proposal.intervalDays));
          const byId = new Map(catalog.map((p) => [p.id, p]));
          const lines: TherapyLine[] = [];
          for (const item of data.proposal.items ?? []) {
            const product = byId.get(item.productId);
            if (product) {
              lines.push({
                product,
                quantity: item.quantity,
                unitPrice: item.unitPrice ?? product.price ?? 0,
              });
            }
          }
          setTherapy(lines);
          if (data.proposal.status) setStatus(`Current proposal: ${data.proposal.status}`);
        }
      }
      setLoading(false);
    })();
  }, [intakeSubmissionId]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q.trim()) return true;
      const hay = `${p.title} ${p.subcategory ?? ""} ${p.form ?? ""} ${p.strength ?? ""} ${p.description ?? ""}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
  }, [products, category, q]);

  const therapyIds = useMemo(() => new Set(therapy.map((l) => l.product.id)), [therapy]);
  const activeProduct = activeId ? products.find((p) => p.id === activeId) ?? null : null;
  const planTotal = therapy.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  function selectProduct(product: ClinicalProduct) {
    setActiveId(product.id);
    const existing = therapy.find((l) => l.product.id === product.id);
    setPickQty(existing?.quantity ?? 1);
    setPickPrice(
      existing
        ? String(existing.unitPrice || "")
        : product.price && product.price > 0
          ? String(product.price)
          : "",
    );
    setStatus("");
  }

  function addToTherapy() {
    if (!activeProduct) return;
    const qty = Math.max(1, Math.min(50, pickQty));
    const price = allowPricing ? Number(pickPrice || 0) : activeProduct.price ?? 0;
    setTherapy((prev) => {
      const idx = prev.findIndex((l) => l.product.id === activeProduct.id);
      const nextLine = { product: activeProduct, quantity: qty, unitPrice: Number.isFinite(price) ? price : 0 };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = nextLine;
        return next;
      }
      return [...prev, nextLine];
    });
    setStatus(`Added ${activeProduct.title} × ${qty} to therapy.`);
  }

  function addAllPrescriptions() {
    const rx = filtered.filter((p) => p.isPrescription);
    if (!rx.length) {
      setStatus("No prescription products in this filter.");
      return;
    }
    setTherapy((prev) => {
      const byId = new Map(prev.map((line) => [line.product.id, line]));
      for (const product of rx) {
        if (byId.has(product.id)) continue;
        byId.set(product.id, {
          product,
          quantity: 1,
          unitPrice: product.price ?? 0,
        });
      }
      return [...byId.values()];
    });
    setStatus(`Added ${rx.length} prescription product${rx.length === 1 ? "" : "s"} from this view.`);
  }

  function updateTherapyQty(productId: string, quantity: number) {
    setTherapy((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.product.id !== productId);
      return prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l));
    });
  }

  function updateTherapyPrice(productId: string, unitPrice: number) {
    setTherapy((prev) =>
      prev.map((l) => (l.product.id === productId ? { ...l, unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0 } : l)),
    );
  }

  function removeFromTherapy(productId: string) {
    setTherapy((prev) => prev.filter((l) => l.product.id !== productId));
    if (activeId === productId) setActiveId(null);
  }

  async function save(send: boolean) {
    setSaving(true);
    setStatus("");
    if (!therapy.length) {
      setStatus("Add at least one product to the therapy plan.");
      setSaving(false);
      return;
    }
    const items = therapy.map((l) => ({
      productId: l.product.id,
      quantity: l.quantity,
      unitPrice: allowPricing ? l.unitPrice : undefined,
    }));
    const res = await fetch("/api/intake/therapy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intakeSubmissionId,
        notes,
        items,
        send,
        billingInterval,
        intervalDays: billingInterval === "CUSTOM" ? Number(customDays) : undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setStatus(data.error || "Could not save therapy.");
      return;
    }
    setStatus(send ? "Therapy sent to patient." : "Therapy draft saved.");
    onSaved?.();
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[#efe4d4] bg-[#fffaf3] p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Therapy plan</p>
          <h3 className="mt-1 font-serif text-xl text-[#1f1a15]">Build therapy</h3>
          <p className="mt-1 text-sm text-[#6f6251]">
            {allowPricing
              ? "Set quantity and patient price for each prescription. Saving also updates the prescription catalog."
              : "Click a product card → set quantity → Add to therapy. Prices stay hidden for providers."}
          </p>
        </div>
        <p className="rounded-full bg-white px-3 py-1 text-sm text-[#8f6f3e]">
          {therapy.length} in therapy
          {allowPricing && planTotal > 0 ? ` · $${planTotal.toFixed(2)}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="min-w-[200px] flex-1 rounded-sm border border-[#b78d4b35] bg-white px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-sm border border-[#b78d4b35] bg-white px-3 py-2 text-sm"
        >
          <option value="All">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {allowPricing ? (
          <button
            type="button"
            onClick={addAllPrescriptions}
            className="rounded-sm border border-[#b78d4b80] bg-white px-3 py-2 text-xs uppercase tracking-[0.12em] text-[#8f6f3e]"
          >
            Add all prescriptions
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-[#6f6251]">Loading catalog…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Catalog</p>
            <div className="max-h-[28rem] overflow-auto pr-1">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {filtered.map((product) => {
                  const isActive = activeId === product.id;
                  const inTherapy = therapyIds.has(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => selectProduct(product)}
                      className={`overflow-hidden rounded-lg border bg-white text-left transition ${
                        isActive
                          ? "border-[#b78d4b] ring-2 ring-[#b78d4b40]"
                          : inTherapy
                            ? "border-[#c9b48a]"
                            : "border-[#efe4d4] hover:border-[#d4c2a0]"
                      }`}
                    >
                      <div className="relative h-20 bg-[#f3ebe0]">
                        {product.featuredImage ? (
                          <Image src={product.featuredImage} alt="" fill className="object-cover" unoptimized />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-[#8f6f3e]">No image</div>
                        )}
                        {inTherapy ? (
                          <span className="absolute right-1.5 top-1.5 rounded-full bg-[#b78d4b] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-white">
                            In plan
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-0.5 p-2">
                        <p className="text-[9px] uppercase tracking-[0.1em] text-[#8f6f3e]">
                          {product.category || "Clinical"}
                          {product.isPrescription ? " · Rx" : ""}
                        </p>
                        <p className="line-clamp-2 font-serif text-sm leading-snug text-[#1f1a15]">{product.title}</p>
                        {product.strength || product.form ? (
                          <p className="line-clamp-1 text-[11px] text-[#6f6251]">
                            {[product.form, product.strength].filter(Boolean).join(" · ")}
                          </p>
                        ) : null}
                        {allowPricing ? (
                          <p className="text-[11px] text-[#8f6f3e]">
                            {product.price && product.price > 0 ? `$${product.price.toFixed(2)}` : "Set price"}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
              {!filtered.length ? (
                <p className="py-6 text-sm text-[#6f6251]">No products match these filters.</p>
              ) : null}
            </div>

            {activeProduct ? (
              <div className="mt-4 rounded-xl border border-[#b78d4b60] bg-white p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Selected product</p>
                <p className="mt-1 font-serif text-lg text-[#1f1a15]">{activeProduct.title}</p>
                <p className="mt-1 text-xs text-[#6f6251]">
                  {[activeProduct.category, activeProduct.form, activeProduct.strength].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <label className="text-sm text-[#6f6251]">
                    Quantity
                    <div className="mt-1 flex items-center gap-1">
                      <button
                        type="button"
                        className="h-9 w-9 rounded-sm border border-[#d8cbb5] text-base"
                        onClick={() => setPickQty((n) => Math.max(1, n - 1))}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={pickQty}
                        onChange={(e) => setPickQty(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                        className="h-9 w-14 rounded-sm border border-[#d8cbb5] text-center text-sm"
                      />
                      <button
                        type="button"
                        className="h-9 w-9 rounded-sm border border-[#d8cbb5] text-base"
                        onClick={() => setPickQty((n) => Math.min(50, n + 1))}
                      >
                        +
                      </button>
                    </div>
                  </label>
                  {allowPricing ? (
                    <label className="text-sm text-[#6f6251]">
                      Patient price ($)
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={pickPrice}
                        onChange={(e) => setPickPrice(e.target.value)}
                        placeholder="0.00"
                        className="mt-1 h-9 w-28 rounded-sm border border-[#d8cbb5] px-2 text-sm"
                      />
                    </label>
                  ) : null}
                  <button
                    type="button"
                    onClick={addToTherapy}
                    className="rounded-sm bg-[#b78d4b] px-4 py-2.5 text-sm text-white"
                  >
                    {therapyIds.has(activeProduct.id) ? "Update in therapy" : "Add to therapy"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#6f6251]">Click a product card to select it.</p>
            )}
          </div>

          <aside className="rounded-xl border border-[#efe4d4] bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Therapy cart</p>
            <h4 className="mt-1 font-serif text-lg text-[#1f1a15]">Ready to send</h4>

            {therapy.length === 0 ? (
              <p className="mt-4 text-sm text-[#6f6251]">No products added yet.</p>
            ) : (
              <ul className="mt-4 max-h-72 space-y-3 overflow-auto">
                {therapy.map((line) => (
                  <li key={line.product.id} className="rounded-lg border border-[#efe4d4] p-3">
                    <div className="flex gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f3ebe0]">
                        {line.product.featuredImage ? (
                          <Image
                            src={line.product.featuredImage}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#1f1a15]">{line.product.title}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="h-7 w-7 rounded-sm border border-[#d8cbb5] text-xs"
                              onClick={() => updateTherapyQty(line.product.id, line.quantity - 1)}
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm">{line.quantity}</span>
                            <button
                              type="button"
                              className="h-7 w-7 rounded-sm border border-[#d8cbb5] text-xs"
                              onClick={() => updateTherapyQty(line.product.id, line.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          {allowPricing ? (
                            <label className="flex items-center gap-1 text-xs text-[#6f6251]">
                              $
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={line.unitPrice || ""}
                                onChange={(e) => updateTherapyPrice(line.product.id, Number(e.target.value))}
                                className="h-7 w-20 rounded-sm border border-[#d8cbb5] px-1.5 text-sm"
                              />
                            </label>
                          ) : null}
                          <button
                            type="button"
                            className="text-xs text-[#7c2c2c] underline"
                            onClick={() => removeFromTherapy(line.product.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {allowPricing && therapy.length ? (
              <p className="mt-3 text-right font-serif text-xl text-[#1f1a15]">${planTotal.toFixed(2)}</p>
            ) : null}

            <label className="mt-4 block text-sm">
              <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
                Billing
              </span>
              <select
                value={billingInterval}
                onChange={(e) => setBillingInterval(e.target.value)}
                className="w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf3] px-3 py-2 text-sm"
              >
                <option value="ONE_TIME">One-time (no refill)</option>
                <option value="WEEKLY">Every week</option>
                <option value="EVERY_2_WEEKS">Every 2 weeks</option>
                <option value="EVERY_4_WEEKS">Every 4 weeks</option>
                <option value="MONTHLY">Every month (30 days)</option>
                <option value="EVERY_6_WEEKS">Every 6 weeks</option>
                <option value="EVERY_8_WEEKS">Every 8 weeks</option>
                <option value="CUSTOM">Custom interval</option>
              </select>
            </label>
            {billingInterval === "CUSTOM" ? (
              <label className="mt-2 block text-sm">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
                  Charge every (days)
                </span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf3] px-3 py-2 text-sm"
                />
              </label>
            ) : null}
            {billingInterval !== "ONE_TIME" ? (
              <p className="mt-2 text-xs text-[#6f6251]">
                First payment is collected now. Later refills charge the same card on this schedule.
              </p>
            ) : null}

            <label className="mt-4 block text-sm">
              <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Note to patient</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf3] px-3 py-2 text-sm"
                placeholder="Dosing guidance, timing, follow-up…"
              />
            </label>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={saving || !therapy.length}
                onClick={() => void save(false)}
                className="rounded-sm border border-[#b78d4b80] bg-white px-4 py-2.5 text-sm disabled:opacity-50"
              >
                Save draft
              </button>
              <button
                type="button"
                disabled={saving || !therapy.length}
                onClick={() => void save(true)}
                className="rounded-sm bg-[#b78d4b] px-4 py-2.5 text-sm text-white disabled:opacity-50"
              >
                Send therapy to patient
              </button>
            </div>
          </aside>
        </div>
      )}

      {status ? <p className="text-sm text-[#1b6568]">{status}</p> : null}
    </section>
  );
}
