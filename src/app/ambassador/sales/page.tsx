"use client";

import { useEffect, useState } from "react";
import { adminEyebrow, adminMuted, adminPanel, adminTitle, statusTone } from "@/components/admin/ui";

type OrderRow = {
  id: string;
  orderNumber: string;
  email: string | null;
  total: number | string;
  paymentStatus: string;
  status: string;
  createdAt: string;
};

function money(value: number | string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export default function AmbassadorSalesPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/ambassador/sales")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load sales");
        const payload = (await res.json()) as { orders: OrderRow[] };
        setOrders(payload.orders);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Attributed commerce</p>
        <h1 className={adminTitle}>Sales</h1>
        <p className={adminMuted}>Orders placed through your ambassador code or QR link.</p>
      </div>
      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}
      <div className={`${adminPanel} overflow-hidden`}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#efe6d8] bg-[#fffaf2] text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[#f0e8db]">
                <td className="px-4 py-3 text-[#6f6251]">{new Date(order.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-[#1f1a15]">{order.orderNumber}</td>
                <td className="px-4 py-3 text-[#6f6251]">{order.email ?? "—"}</td>
                <td className="px-4 py-3 text-[#1f1a15]">{money(order.total)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
            {!orders.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#6f6251]">
                  No attributed sales yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
