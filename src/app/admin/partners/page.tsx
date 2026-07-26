"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SERVICE_OPTIONS = [
  "telemedicine",
  "icoone-laser",
  "facial-aesthetics",
  "nutrition",
  "iv-therapy",
  "comprehensive-bloodwork",
  "beauty-hair-nails",
  "inbody-scan",
  "microneedling-with-exosomes",
  "korean-organic-skincare",
  "glp1-peptides",
  "mindtap",
];

type PartnerRow = {
  id: string;
  displayName: string;
  specialty: string | null;
  type: string;
  status: string;
  partnerCode: string;
  defaultServiceCommissionPct: number | string;
  defaultProductCommissionPct: number | string;
  user: { email: string; name: string | null };
  serviceAssignments: { serviceSlug: string; active: boolean; commissionPct: number | string | null }[];
  productAssignments: { productId: string; active: boolean; commissionPct: number | string | null }[];
  _count: { bookings: number; commissionEntries: number };
};

type ProductOption = { id: string; title: string; slug: string };

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [serviceSlugs, setServiceSlugs] = useState<string[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [serviceRates, setServiceRates] = useState<Record<string, string>>({});
  const [productRates, setProductRates] = useState<Record<string, string>>({});

  async function load() {
    const [partnersRes, productsRes] = await Promise.all([
      fetch("/api/admin/partners"),
      fetch("/api/admin/commerce/products"),
    ]);
    if (partnersRes.ok) {
      const payload = (await partnersRes.json()) as { partners: PartnerRow[] };
      setPartners(payload.partners);
    }
    if (productsRes.ok) {
      const payload = (await productsRes.json()) as { products?: ProductOption[] };
      setProducts(payload.products ?? (payload as unknown as ProductOption[]));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createPartner(formData: FormData) {
    setStatus("");
    const body = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      displayName: String(formData.get("displayName") || ""),
      legalName: String(formData.get("legalName") || "") || undefined,
      type: String(formData.get("type") || "CLINICAL"),
      specialty: String(formData.get("specialty") || "") || undefined,
      phone: String(formData.get("phone") || "") || undefined,
      defaultServiceCommissionPct: Number(formData.get("servicePct") || 20),
      defaultProductCommissionPct: Number(formData.get("productPct") || 10),
      status: String(formData.get("status") || "INVITED"),
    };
    const res = await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setStatus(res.ok ? "Partner created." : "Failed to create partner.");
    if (res.ok) await load();
  }

  async function saveAssignments(partnerId: string) {
    const res = await fetch(`/api/admin/partners/${partnerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceAssignments: serviceSlugs.map((serviceSlug) => ({
          serviceSlug,
          active: true,
          commissionPct: serviceRates[serviceSlug] ? Number(serviceRates[serviceSlug]) : null,
        })),
        productAssignments: productIds.map((productId) => ({
          productId,
          active: true,
          commissionPct: productRates[productId] ? Number(productRates[productId]) : null,
        })),
      }),
    });
    setStatus(res.ok ? "Assignments saved." : "Failed to save assignments.");
    if (res.ok) await load();
  }

  async function setPartnerStatus(partnerId: string, next: string) {
    const res = await fetch(`/api/admin/partners/${partnerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setStatus(res.ok ? "Status updated." : "Failed to update status.");
    if (res.ok) await load();
  }

  function selectPartner(partner: PartnerRow) {
    setSelectedId(partner.id);
    setServiceSlugs(partner.serviceAssignments.filter((a) => a.active).map((a) => a.serviceSlug));
    setProductIds(partner.productAssignments.filter((a) => a.active).map((a) => a.productId));
    const nextServiceRates: Record<string, string> = {};
    for (const a of partner.serviceAssignments) {
      if (a.commissionPct != null) nextServiceRates[a.serviceSlug] = String(a.commissionPct);
    }
    setServiceRates(nextServiceRates);
    const nextProductRates: Record<string, string> = {};
    for (const a of partner.productAssignments) {
      if (a.commissionPct != null) nextProductRates[a.productId] = String(a.commissionPct);
    }
    setProductRates(nextProductRates);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl text-[#1f1a15]">Partners</h1>
          <p className="mt-2 text-[#6f6251]">Create partner accounts, assign services/products, and manage status.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/partners/payouts" className="rounded-sm border border-[#b78d4b80] bg-white px-4 py-2 text-sm">
            Payouts
          </Link>
          <Link href="/admin/partners/network" className="rounded-sm border border-[#b78d4b80] bg-white px-4 py-2 text-sm">
            Network
          </Link>
          <Link href="/admin/partners/guidelines" className="rounded-sm border border-[#b78d4b80] bg-white px-4 py-2 text-sm">
            Guidelines
          </Link>
          <Link href="/admin/partners/commissions" className="rounded-sm border border-[#b78d4b80] bg-white px-4 py-2 text-sm">
            Commissions
          </Link>
        </div>
      </div>
      {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}

      <section className="rounded-sm border border-[#b78d4b2d] bg-white p-5">
        <h2 className="text-xl text-[#1f1a15]">Create / invite partner</h2>
        <form action={createPartner} className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="name" placeholder="Account name" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <input name="email" type="email" placeholder="Login email" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <input name="password" type="password" placeholder="Temporary password (min 8)" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <input name="displayName" placeholder="Display name" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <input name="legalName" placeholder="Legal name" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <input name="specialty" placeholder="Specialty" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <input name="phone" placeholder="Phone" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <select name="type" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" defaultValue="CLINICAL">
            <option value="CLINICAL">Clinical</option>
            <option value="BRAND">Brand</option>
            <option value="BOTH">Both</option>
          </select>
          <select name="status" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" defaultValue="INVITED">
            <option value="INVITED">Invited</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <input name="servicePct" type="number" defaultValue={20} placeholder="Service commission %" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <input name="productPct" type="number" defaultValue={10} placeholder="Product commission %" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <button type="submit" className="rounded-sm bg-[#b78d4b] px-5 py-3 text-white md:col-span-2">
            Create partner account
          </button>
        </form>
      </section>

      <section className="grid gap-4">
        {partners.map((partner) => (
          <article key={partner.id} className="rounded-sm border border-[#b78d4b2d] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.16em] text-[#8f6f3e]">
                  {partner.type} · {partner.status} · CODE {partner.partnerCode}
                </p>
                <h3 className="mt-1 text-2xl text-[#1f1a15]">{partner.displayName}</h3>
                <p className="text-sm text-[#6f6251]">
                  {partner.user.email} · {partner.specialty || "No specialty"} · {partner._count.bookings} bookings
                </p>
                <p className="mt-1 text-xs text-[#8f6f3e]">
                  Default commissions: {String(partner.defaultServiceCommissionPct)}% services /{" "}
                  {String(partner.defaultProductCommissionPct)}% products
                </p>
                <p className="mt-2 text-xs text-[#5f5344]">
                  Services: {partner.serviceAssignments.map((a) => a.serviceSlug).join(", ") || "None"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => selectPartner(partner)} className="rounded-sm border border-[#b78d4b70] px-3 py-2 text-sm">
                  Assign
                </button>
                <button type="button" onClick={() => void setPartnerStatus(partner.id, "ACTIVE")} className="rounded-sm bg-[#b78d4b] px-3 py-2 text-sm text-white">
                  Activate
                </button>
                <button type="button" onClick={() => void setPartnerStatus(partner.id, "SUSPENDED")} className="rounded-sm border border-[#d07b7b80] px-3 py-2 text-sm text-[#7c2c2c]">
                  Suspend
                </button>
              </div>
            </div>

            {selectedId === partner.id ? (
              <div className="mt-4 grid gap-4 border-t border-[#e4d9c8] pt-4 md:grid-cols-2">
                <div>
                  <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">SERVICES (+ optional % override)</p>
                  <div className="mt-2 max-h-56 space-y-2 overflow-auto">
                    {SERVICE_OPTIONS.map((slug) => (
                      <div key={slug} className="flex items-center gap-2 text-sm text-[#4f4335]">
                        <input
                          type="checkbox"
                          checked={serviceSlugs.includes(slug)}
                          onChange={(e) =>
                            setServiceSlugs((prev) => (e.target.checked ? [...prev, slug] : prev.filter((s) => s !== slug)))
                          }
                        />
                        <span className="min-w-0 flex-1 truncate">{slug}</span>
                        {serviceSlugs.includes(slug) ? (
                          <input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="%"
                            value={serviceRates[slug] ?? ""}
                            onChange={(e) => setServiceRates((prev) => ({ ...prev, [slug]: e.target.value }))}
                            className="w-16 rounded-sm border border-[#b78d4b35] bg-[#fffaf4] px-2 py-1 text-xs"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">PRODUCTS (+ optional % override)</p>
                  <div className="mt-2 max-h-56 space-y-2 overflow-auto">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center gap-2 text-sm text-[#4f4335]">
                        <input
                          type="checkbox"
                          checked={productIds.includes(product.id)}
                          onChange={(e) =>
                            setProductIds((prev) =>
                              e.target.checked ? [...prev, product.id] : prev.filter((id) => id !== product.id),
                            )
                          }
                        />
                        <span className="min-w-0 flex-1 truncate">{product.title}</span>
                        {productIds.includes(product.id) ? (
                          <input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="%"
                            value={productRates[product.id] ?? ""}
                            onChange={(e) => setProductRates((prev) => ({ ...prev, [product.id]: e.target.value }))}
                            className="w-16 rounded-sm border border-[#b78d4b35] bg-[#fffaf4] px-2 py-1 text-xs"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void saveAssignments(partner.id)}
                  className="rounded-sm bg-[#b78d4b] px-4 py-2 text-sm text-white md:col-span-2"
                >
                  Save assignments
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
