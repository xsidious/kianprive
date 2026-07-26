"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  money,
  partnerBtnGhost,
  partnerBtnPrimary,
  partnerEyebrow,
  partnerInput,
  partnerMuted,
  partnerPanel,
  partnerTitle,
} from "@/components/partner/ui";

type ProductAssignment = {
  productId: string;
  commissionPct: number | string | null;
  partnerSku: string | null;
  product: {
    id: string;
    title: string;
    slug: string;
    inventoryQty: number;
    price: number | string;
    trackInventory: boolean;
  };
};

export default function PartnerProductsPage() {
  const [assignments, setAssignments] = useState<ProductAssignment[]>([]);
  const [referralShopUrl, setReferralShopUrl] = useState("");
  const [defaultPct, setDefaultPct] = useState("—");
  const [activeSale, setActiveSale] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [partnerStatus, setPartnerStatus] = useState("ACTIVE");

  async function load() {
    const res = await fetch("/api/partner/me");
    if (!res.ok) return;
    const payload = (await res.json()) as {
      referralShopUrl: string;
      partner: {
        status: string;
        defaultProductCommissionPct: number | string;
        productAssignments: ProductAssignment[];
      };
    };
    setAssignments(payload.partner.productAssignments ?? []);
    setReferralShopUrl(payload.referralShopUrl);
    setDefaultPct(String(payload.partner.defaultProductCommissionPct));
    setPartnerStatus(payload.partner.status);
  }

  useEffect(() => {
    void load();
  }, []);

  async function recordSale(productId: string) {
    setStatus("");
    const res = await fetch("/api/partner/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, email, phone, fullName, quantity, note }),
    });
    const payload = (await res.json()) as { error?: string; order?: { orderNumber: string } };
    if (!res.ok) {
      setStatus(payload.error ?? "Could not record sale.");
      return;
    }
    setStatus(`Sale recorded — ${payload.order?.orderNumber}`);
    setActiveSale(null);
    setEmail("");
    setPhone("");
    setFullName("");
    setQuantity(1);
    setNote("");
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className={partnerEyebrow}>COMMERCE</p>
        <h1 className={partnerTitle}>Products</h1>
        <p className={partnerMuted}>
          Assigned catalog, stock, referral link, and offline sale recording.
        </p>
      </div>
      {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}
      {referralShopUrl ? (
        <p className="text-sm text-[#6f6251]">
          Share shop referral:{" "}
          <Link href={referralShopUrl} className="text-[#8f6f3e] underline">
            {referralShopUrl}
          </Link>
        </p>
      ) : null}

      <div className="space-y-3">
        {assignments.map((a) => (
          <article key={a.productId} className={`${partnerPanel} p-4`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg text-[#1f1a15]">{a.product.title}</p>
                <p className="text-sm text-[#6f6251]">
                  {money(a.product.price)} · Stock{" "}
                  {a.product.trackInventory ? a.product.inventoryQty : "∞"} · Commission{" "}
                  {a.commissionPct != null ? `${String(a.commissionPct)}%` : `${defaultPct}% default`}
                  {a.partnerSku ? ` · SKU ${a.partnerSku}` : ""}
                </p>
              </div>
              <button
                type="button"
                disabled={partnerStatus !== "ACTIVE"}
                className={partnerBtnGhost}
                onClick={() => setActiveSale(activeSale === a.productId ? null : a.productId)}
              >
                Record sale
              </button>
            </div>

            {activeSale === a.productId ? (
              <div className="mt-4 grid gap-3 border-t border-[#e4d9c8] pt-4 md:grid-cols-2">
                <label className="text-sm">
                  Client email
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className={partnerInput} required />
                </label>
                <label className="text-sm">
                  Client name
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={partnerInput} />
                </label>
                <label className="text-sm">
                  Phone
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={partnerInput} />
                </label>
                <label className="text-sm">
                  Quantity
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                    className={partnerInput}
                  />
                </label>
                <label className="text-sm md:col-span-2">
                  Note
                  <input value={note} onChange={(e) => setNote(e.target.value)} className={partnerInput} />
                </label>
                <button
                  type="button"
                  className={`${partnerBtnPrimary} md:col-span-2`}
                  onClick={() => void recordSale(a.productId)}
                >
                  Confirm offline sale ({money(Number(a.product.price) * quantity)})
                </button>
              </div>
            ) : null}
          </article>
        ))}
        {!assignments.length ? <p className="text-sm text-[#6f6251]">No products assigned yet.</p> : null}
      </div>
    </div>
  );
}
