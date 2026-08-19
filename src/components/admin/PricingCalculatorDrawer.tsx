"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, X } from "lucide-react";
import { adminBtnGhost, adminBtnPrimary, adminInput, adminSelect, money } from "@/components/admin/ui";

export type VendorOffer = {
  id: string;
  productId?: string;
  vendorId: string;
  vendorName: string;
  unitCost: number;
  shippingCost: number;
  landedCost: number;
};

type CatalogOption = {
  id: string;
  title: string;
  wholesalePrice: number | null;
  price: number;
  vendorOffers?: VendorOffer[];
  bestVendor?: VendorOffer | null;
  suggestedPrice?: number | null;
};

type Vendor = { id: string; name: string };

type ShippingDefaults = {
  flatRate: number;
  freeThreshold: number;
  alwaysFree: boolean;
};

type PricingDefaults = {
  marginPercent: number;
  extraDollars: number;
  includeStoreShipping: boolean;
};

function landed(unit: number, ship: number) {
  return Math.round((Math.max(0, unit) + Math.max(0, ship)) * 100) / 100;
}

function suggest(cost: number, outbound: number, pricing: PricingDefaults) {
  const covered = cost + (pricing.includeStoreShipping ? outbound : 0);
  return Math.round((covered * (1 + pricing.marginPercent / 100) + pricing.extraDollars) * 100) / 100;
}

export function PricingCalculatorDrawer({
  catalog,
  vendors,
  shipping,
  pricing,
  selectedProductId,
  onCloseSelect,
  onChanged,
}: {
  catalog: CatalogOption[];
  vendors: Vendor[];
  shipping?: ShippingDefaults | null;
  pricing?: PricingDefaults | null;
  selectedProductId?: string | null;
  onCloseSelect?: () => void;
  onChanged?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [offers, setOffers] = useState<VendorOffer[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [vendorShipping, setVendorShipping] = useState("");
  const [marginPercent, setMarginPercent] = useState("40");
  const [extraDollars, setExtraDollars] = useState("0");
  const [includeStoreShipping, setIncludeStoreShipping] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (pricing) {
      setMarginPercent(String(pricing.marginPercent));
      setExtraDollars(String(pricing.extraDollars));
      setIncludeStoreShipping(pricing.includeStoreShipping);
    }
  }, [pricing]);

  useEffect(() => {
    if (selectedProductId) {
      setProductId(selectedProductId);
      setOpen(true);
    }
  }, [selectedProductId]);

  useEffect(() => {
    const item = catalog.find((row) => row.id === productId);
    setOffers(item?.vendorOffers ?? []);
  }, [catalog, productId]);

  const outbound = shipping?.alwaysFree ? 0 : Number(shipping?.flatRate || 0);
  const pricingNow: PricingDefaults = {
    marginPercent: Math.max(0, Number(marginPercent) || 0),
    extraDollars: Math.max(0, Number(extraDollars) || 0),
    includeStoreShipping,
  };

  const best = useMemo(() => {
    if (!offers.length) return null;
    return [...offers].sort((a, b) => a.landedCost - b.landedCost)[0];
  }, [offers]);

  const suggested = best ? suggest(best.landedCost, outbound, pricingNow) : 0;
  const selected = catalog.find((row) => row.id === productId);

  async function saveOffer() {
    if (!productId || !vendorId) {
      setStatus("Pick a product and a vendor.");
      return;
    }
    const res = await fetch("/api/admin/vendor-offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        vendorId,
        unitCost: Number(unitCost || 0),
        shippingCost: Number(vendorShipping || 0),
      }),
    });
    const data = (await res.json()) as { error?: string; offers?: VendorOffer[] };
    setStatus(res.ok ? "Vendor price saved. Best cost is highlighted." : data.error || "Could not save vendor price.");
    if (res.ok) {
      setOffers(data.offers ?? []);
      setUnitCost("");
      setVendorShipping("");
      onChanged?.();
    }
  }

  async function removeOffer(id: string) {
    if (id.startsWith("legacy-")) {
      setStatus("Save this quote once so it can be edited or removed.");
      return;
    }
    const res = await fetch(`/api/admin/vendor-offers?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = (await res.json()) as { offers?: VendorOffer[] };
    if (res.ok) {
      setOffers(data.offers ?? []);
      onChanged?.();
    }
  }

  async function saveSettings() {
    const res = await fetch("/api/admin/commerce/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pricingNow),
    });
    setStatus(res.ok ? "Profit settings saved." : "Could not save profit settings.");
  }

  async function applySuggested() {
    if (!productId) return;
    await saveSettings();
    const res = await fetch("/api/admin/vendor-offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "applySuggested", productId }),
    });
    const data = (await res.json()) as { error?: string; suggestedRetail?: number };
    setStatus(res.ok ? `Catalog price set to ${money(data.suggestedRetail ?? suggested)}.` : data.error || "Could not apply price.");
    if (res.ok) onChanged?.();
  }

  function close() {
    setOpen(false);
    onCloseSelect?.();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#8a682e] px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-white shadow-[0_12px_30px_rgba(47,36,22,0.25)] hover:bg-[#735624]"
      >
        <Calculator size={16} />
        Price calculator
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <button type="button" aria-label="Close calculator" className="absolute inset-0 bg-[#1f1a15]/40" onClick={close} />
          <aside className="relative flex h-full w-full max-w-lg flex-col overflow-auto bg-[#fffdf9] p-5 shadow-[-18px_0_40px_rgba(47,36,22,0.12)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Vendor quotes</p>
                <h2 className="mt-1 font-serif text-2xl text-[#1f1a15]">Best price + profit</h2>
                <p className="mt-2 text-sm text-[#6f6251]">
                  Add each company’s product cost and shipping. We always pick the cheapest landed cost, then add
                  patient shipping and your markup.
                </p>
              </div>
              <button type="button" className={adminBtnGhost} onClick={close}>
                <X size={16} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <label className="block text-sm text-[#6f6251]">
                Product
                <select className={`${adminSelect} mt-1 w-full`} value={productId} onChange={(e) => setProductId(e.target.value)}>
                  <option value="">Select a product</option>
                  {catalog.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>

              {offers.length ? (
                <ul className="space-y-2">
                  {offers.map((offer) => {
                    const isBest = best?.id === offer.id;
                    return (
                      <li
                        key={offer.id}
                        className={`rounded-xl border px-3 py-2 text-sm ${
                          isBest ? "border-[#8a682e] bg-[#fff6e8]" : "border-[#efe4d4] bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-[#1f1a15]">
                              {offer.vendorName || "Vendor"}
                              {isBest ? " · best" : ""}
                            </p>
                            <p className="text-xs text-[#6f6251]">
                              Product {money(offer.unitCost)} + ship {money(offer.shippingCost)} = {money(offer.landedCost)}
                            </p>
                          </div>
                          <button type="button" className="text-xs text-[#7c2c2c]" onClick={() => void removeOffer(offer.id)}>
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-[#6f6251]">No vendor quotes yet. Add the prices you pay each company.</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="col-span-2 text-sm text-[#6f6251]">
                  Vendor
                  <select className={`${adminSelect} mt-1 w-full`} value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                    <option value="">Choose company</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-[#6f6251]">
                  Cost from company ($)
                  <input className={`${adminInput} mt-1`} type="number" min={0} step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
                </label>
                <label className="text-sm text-[#6f6251]">
                  Vendor shipping ($)
                  <input className={`${adminInput} mt-1`} type="number" min={0} step="0.01" value={vendorShipping} onChange={(e) => setVendorShipping(e.target.value)} />
                </label>
              </div>
              <button type="button" className={adminBtnPrimary} onClick={() => void saveOffer()}>
                Save vendor price
              </button>
              {vendorId && unitCost ? (
                <p className="text-xs text-[#8f6f3e]">
                  This quote lands at {money(landed(Number(unitCost) || 0, Number(vendorShipping) || 0))}.
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3 border-t border-[#efe4d4] pt-4">
                <label className="text-sm text-[#6f6251]">
                  Markup (%)
                  <input className={`${adminInput} mt-1`} type="number" min={0} step="1" value={marginPercent} onChange={(e) => setMarginPercent(e.target.value)} />
                </label>
                <label className="text-sm text-[#6f6251]">
                  Extra profit ($)
                  <input className={`${adminInput} mt-1`} type="number" min={0} step="0.01" value={extraDollars} onChange={(e) => setExtraDollars(e.target.value)} />
                </label>
                <label className="col-span-2 flex items-center gap-2 text-sm text-[#4f4335]">
                  <input type="checkbox" checked={includeStoreShipping} onChange={(e) => setIncludeStoreShipping(e.target.checked)} />
                  Include patient shipping ({money(outbound)}) in the selling price
                </label>
              </div>
              <button type="button" className={adminBtnGhost} onClick={() => void saveSettings()}>
                Save profit settings
              </button>
            </div>

            <div className="mt-6 space-y-2 rounded-2xl border border-[#efe4d4] bg-white p-4 text-sm">
              <p className="flex justify-between text-[#6f6251]">
                <span>Best vendor cost</span>
                <span>{best ? money(best.landedCost) : "—"}</span>
              </p>
              <p className="flex justify-between text-[#6f6251]">
                <span>Patient shipping</span>
                <span>{includeStoreShipping ? money(outbound) : money(0)}</span>
              </p>
              <p className="flex justify-between border-t border-[#efe4d4] pt-3 font-serif text-xl text-[#1f1a15]">
                <span>Set our price</span>
                <span>{best ? money(suggested) : "—"}</span>
              </p>
              {selected ? (
                <p className="text-xs text-[#8f6f3e]">Current catalog price is {money(selected.price)}.</p>
              ) : null}
            </div>

            {status ? <p className="mt-3 text-sm text-[#1b6568]">{status}</p> : null}

            <button type="button" className={`${adminBtnPrimary} mt-6`} disabled={!productId || !best} onClick={() => void applySuggested()}>
              Apply this price to the catalog
            </button>
          </aside>
        </div>
      ) : null}
    </>
  );
}
