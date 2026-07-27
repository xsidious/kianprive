"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AdminModal } from "@/components/admin/AdminModal";
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

type OrderItem = {
  id: string;
  title: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
  product?: { featuredImage?: string | null; slug?: string } | null;
};

type Order = {
  id: string;
  orderNumber: string;
  email: string | null;
  phone?: string | null;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  subtotal?: number | string;
  shippingTotal?: number | string;
  taxTotal?: number | string;
  total?: number | string;
  createdAt?: string;
  shippingAddress?: Record<string, string> | null;
  notes?: string | null;
  items?: OrderItem[];
  fulfillments?: { id: string; carrier?: string | null; trackingNumber?: string | null; status: string }[];
};

const orderStatuses = ["PENDING", "PAID", "PROCESSING", "FULFILLED", "DELIVERED", "CANCELED", "REFUNDED"] as const;
const paymentStatuses = ["UNPAID", "PAID", "PARTIALLY_REFUNDED", "REFUNDED", "FAILED"] as const;
const fulfillmentStatuses = ["UNFULFILLED", "PROCESSING", "PARTIALLY_FULFILLED", "FULFILLED", "DELIVERED"] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function loadOrders() {
    const res = await fetch("/api/admin/commerce/orders");
    if (!res.ok) return;
    const payload = (await res.json()) as { orders: Order[] };
    setOrders(payload.orders);
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  async function saveOrder(order: Order) {
    const response = await fetch(`/api/admin/commerce/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        email: order.email,
      }),
    });
    setStatus(response.ok ? "Order updated." : "Failed to update order.");
    if (response.ok) await loadOrders();
  }

  async function addFulfillment(orderId: string, formData: FormData) {
    const body = {
      status: String(formData.get("status") || "PROCESSING"),
      carrier: String(formData.get("carrier") || ""),
      trackingNumber: String(formData.get("trackingNumber") || ""),
      trackingUrl: String(formData.get("trackingUrl") || ""),
      notes: String(formData.get("notes") || ""),
    };
    const response = await fetch(`/api/admin/commerce/orders/${orderId}/fulfillments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setStatus(response.ok ? "Fulfillment added." : "Failed to add fulfillment.");
    if (response.ok) await loadOrders();
  }

  const paidTotal = useMemo(
    () => orders.filter((o) => o.paymentStatus === "PAID").reduce((sum, o) => sum + Number(o.total ?? 0), 0),
    [orders],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Commerce</p>
        <h1 className={adminTitle}>Orders</h1>
        <p className={adminMuted}>Review line items, customer details, payments, and fulfillment in one organized view.</p>
      </div>

      {status ? <p className="text-sm text-[#1b6568]">{status}</p> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Orders</p>
          <p className="mt-2 font-serif text-3xl">{orders.length}</p>
        </div>
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Paid revenue</p>
          <p className="mt-2 font-serif text-3xl">{money(paidTotal)}</p>
        </div>
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Unfulfilled</p>
          <p className="mt-2 font-serif text-3xl">
            {orders.filter((o) => o.fulfillmentStatus === "UNFULFILLED" || o.fulfillmentStatus === "PROCESSING").length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className={`${adminPanel} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-xl text-[#1f1a15]">{order.orderNumber}</p>
                <p className="mt-1 text-sm text-[#6f6251]">
                  {order.email ?? "No email"}
                  {order.createdAt ? ` · ${new Date(order.createdAt).toLocaleString()}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(order.fulfillmentStatus)}`}>
                  {order.fulfillmentStatus.replaceAll("_", " ")}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {(order.items ?? []).slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-[#fffaf3] px-3 py-2">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#efe4d4]">
                    {item.product?.featuredImage ? (
                      <Image src={item.product.featuredImage} alt={item.title} fill className="object-cover" unoptimized />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#1f1a15]">{item.title}</p>
                    <p className="text-xs text-[#6f6251]">
                      Qty {item.quantity} · {money(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm text-[#1f1a15]">{money(item.lineTotal)}</p>
                </div>
              ))}
              {(order.items?.length ?? 0) > 3 ? (
                <p className="text-xs text-[#8f6f3e]">+{(order.items?.length ?? 0) - 3} more items</p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-serif text-2xl text-[#1f1a15]">{money(order.total)}</p>
              <button type="button" className={adminBtnPrimary} onClick={() => setSelectedId(order.id)}>
                View order
              </button>
            </div>
          </article>
        ))}
        {!orders.length ? <div className={`${adminPanel} p-8 text-sm text-[#6f6251]`}>No orders yet.</div> : null}
      </div>

      <AdminModal open={Boolean(selected)} title={selected?.orderNumber ?? "Order"} eyebrow="Order detail" wide onClose={() => setSelectedId(null)}>
        {selected ? (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Order status</span>
                <select
                  className={`${adminSelect} w-full`}
                  value={selected.status}
                  onChange={(e) =>
                    setOrders((prev) => prev.map((row) => (row.id === selected.id ? { ...row, status: e.target.value } : row)))
                  }
                >
                  {orderStatuses.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Payment</span>
                <select
                  className={`${adminSelect} w-full`}
                  value={selected.paymentStatus}
                  onChange={(e) =>
                    setOrders((prev) =>
                      prev.map((row) => (row.id === selected.id ? { ...row, paymentStatus: e.target.value } : row)),
                    )
                  }
                >
                  {paymentStatuses.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Fulfillment</span>
                <select
                  className={`${adminSelect} w-full`}
                  value={selected.fulfillmentStatus}
                  onChange={(e) =>
                    setOrders((prev) =>
                      prev.map((row) => (row.id === selected.id ? { ...row, fulfillmentStatus: e.target.value } : row)),
                    )
                  }
                >
                  {fulfillmentStatuses.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <section className="rounded-2xl border border-[#efe4d4] bg-[#fffaf3] p-4">
              <h3 className="font-serif text-lg text-[#1f1a15]">Customer</h3>
              <p className="mt-2 text-sm text-[#2b2218]">{selected.email ?? "—"}</p>
              <p className="text-sm text-[#6f6251]">{selected.phone ?? "No phone"}</p>
              {selected.shippingAddress ? (
                <p className="mt-2 text-sm text-[#6f6251]">
                  {[selected.shippingAddress.line1, selected.shippingAddress.city, selected.shippingAddress.state, selected.shippingAddress.postal]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              ) : null}
            </section>

            <section className="space-y-2">
              <h3 className="font-serif text-lg text-[#1f1a15]">Products</h3>
              {(selected.items ?? []).map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-[#efe4d4] bg-white p-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#efe4d4]">
                    {item.product?.featuredImage ? (
                      <Image src={item.product.featuredImage} alt={item.title} fill className="object-cover" unoptimized />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[#1f1a15]">{item.title}</p>
                    <p className="text-xs text-[#6f6251]">
                      {item.sku ? `SKU ${item.sku} · ` : ""}Qty {item.quantity} · {money(item.unitPrice)} each
                    </p>
                  </div>
                  <p className="font-medium text-[#1f1a15]">{money(item.lineTotal)}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-2 rounded-2xl border border-[#efe4d4] bg-[#fffaf3] p-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(selected.subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{money(selected.shippingTotal)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{money(selected.taxTotal)}</span></div>
              <div className="flex justify-between border-t border-[#e5d7c2] pt-2 font-medium"><span>Total</span><span>{money(selected.total)}</span></div>
            </section>

            <form
              className="grid gap-2 rounded-2xl border border-[#efe4d4] p-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                void addFulfillment(selected.id, new FormData(event.currentTarget));
              }}
            >
              <h3 className="font-serif text-lg text-[#1f1a15] md:col-span-2">Add fulfillment</h3>
              <select name="status" defaultValue="PROCESSING" className={adminSelect}>
                {fulfillmentStatuses.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
              <input name="carrier" placeholder="Carrier" className={adminInput} />
              <input name="trackingNumber" placeholder="Tracking number" className={adminInput} />
              <input name="trackingUrl" placeholder="Tracking URL" className={adminInput} />
              <input name="notes" placeholder="Notes" className={`${adminInput} md:col-span-2`} />
              <button className={`${adminBtnPrimary} md:col-span-2`}>Save fulfillment</button>
            </form>

            <div className="flex flex-wrap gap-2">
              <button type="button" className={adminBtnPrimary} onClick={() => void saveOrder(selected)}>
                Save status changes
              </button>
              <button type="button" className={adminBtnGhost} onClick={() => setSelectedId(null)}>
                Close
              </button>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
