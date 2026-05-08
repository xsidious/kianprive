"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  orderNumber: string;
  email: string | null;
  status: "PENDING" | "PAID" | "PROCESSING" | "FULFILLED" | "DELIVERED" | "CANCELED" | "REFUNDED";
  paymentStatus: "UNPAID" | "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED" | "FAILED";
  fulfillmentStatus: "UNFULFILLED" | "PROCESSING" | "PARTIALLY_FULFILLED" | "FULFILLED" | "DELIVERED";
};

const orderStatuses = ["PENDING", "PAID", "PROCESSING", "FULFILLED", "DELIVERED", "CANCELED", "REFUNDED"] as const;
const paymentStatuses = ["UNPAID", "PAID", "PARTIALLY_REFUNDED", "REFUNDED", "FAILED"] as const;
const fulfillmentStatuses = ["UNFULFILLED", "PROCESSING", "PARTIALLY_FULFILLED", "FULFILLED", "DELIVERED"] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");

  async function loadOrders() {
    const res = await fetch("/api/admin/commerce/orders");
    if (!res.ok) return;
    const payload = (await res.json()) as { orders: Order[] };
    setOrders(payload.orders);
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function saveOrder(order: Order) {
    const response = await fetch(`/api/admin/commerce/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-[#1f1a15]">Orders</h1>
      <p className="text-[#6f6251]">Update order statuses and fulfillments directly from the orders page.</p>

      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-5">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-4">
                <p className="text-lg text-[#1f1a15]">{order.orderNumber}</p>
                <p className="text-sm text-[#6f6251]">{order.email ?? "No email"}</p>
              </div>
              <select value={order.status} onChange={(e) => setOrders((prev) => prev.map((row) => row.id === order.id ? { ...row, status: e.target.value as Order["status"] } : row))} className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2">
                {orderStatuses.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
              </select>
              <select value={order.paymentStatus} onChange={(e) => setOrders((prev) => prev.map((row) => row.id === order.id ? { ...row, paymentStatus: e.target.value as Order["paymentStatus"] } : row))} className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2">
                {paymentStatuses.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
              </select>
              <select value={order.fulfillmentStatus} onChange={(e) => setOrders((prev) => prev.map((row) => row.id === order.id ? { ...row, fulfillmentStatus: e.target.value as Order["fulfillmentStatus"] } : row))} className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2">
                {fulfillmentStatuses.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
              </select>
              <button onClick={() => void saveOrder(order)} className="rounded-full border border-[#b78d4b80] px-3 py-2 text-sm text-[#3b3024]">Save Order</button>
            </div>

            <form
              className="mt-4 grid gap-2 md:grid-cols-5"
              onSubmit={(event) => {
                event.preventDefault();
                void addFulfillment(order.id, new FormData(event.currentTarget));
              }}
            >
              <select name="status" defaultValue="PROCESSING" className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm">
                {fulfillmentStatuses.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
              </select>
              <input name="carrier" placeholder="Carrier" className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm" />
              <input name="trackingNumber" placeholder="Tracking number" className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm" />
              <input name="trackingUrl" placeholder="Tracking URL" className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm" />
              <button className="rounded-full bg-[#b78d4b] px-3 py-2 text-sm text-white">Add Fulfillment</button>
              <input name="notes" placeholder="Notes" className="md:col-span-5 rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm" />
            </form>
          </article>
        ))}
      </div>

      {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}
    </div>
  );
}
