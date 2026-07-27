"use client";

import { useEffect, useState } from "react";
import { adminEyebrow, adminMuted, adminPanel, adminTitle, money, statusTone } from "@/components/admin/ui";

type OrderRow = {
  id: string;
  orderNumber: string;
  email: string | null;
  total: number | string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  items?: { title: string; quantity: number; lineTotal: number | string }[];
};

type BookingRow = {
  id: string;
  fullName: string;
  email: string;
  status: string;
  serviceTitles: string[];
  scheduledStart: string | null;
  createdAt: string;
  guestTotal: number | string;
  memberTotal: number | string;
};

export default function AmbassadorSalesPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/ambassador/sales")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load sales");
        const payload = (await res.json()) as { orders: OrderRow[]; bookings: BookingRow[] };
        setOrders(payload.orders);
        setBookings(payload.bookings ?? []);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Attributed activity</p>
        <h1 className={adminTitle}>Sales & bookings</h1>
        <p className={adminMuted}>Orders and bookings placed through your ambassador code, link, or QR.</p>
      </div>
      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}

      <section className={`${adminPanel} overflow-hidden`}>
        <div className="border-b border-[#efe6d8] px-4 py-3">
          <h2 className="font-serif text-xl text-[#1f1a15]">Shop orders</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#efe6d8] bg-[#fffaf2] text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[#f0e8db] align-top">
                <td className="px-4 py-3 text-[#6f6251]">{new Date(order.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-[#1f1a15]">
                  <p>{order.orderNumber}</p>
                  <p className="text-xs text-[#6f6251]">{order.email ?? "—"}</p>
                </td>
                <td className="px-4 py-3 text-[#6f6251]">
                  {(order.items ?? []).map((item) => (
                    <p key={`${order.id}-${item.title}`}>
                      {item.title} × {item.quantity}
                    </p>
                  ))}
                </td>
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
                  No attributed shop sales yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section className={`${adminPanel} overflow-hidden`}>
        <div className="border-b border-[#efe6d8] px-4 py-3">
          <h2 className="font-serif text-xl text-[#1f1a15]">Bookings</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#efe6d8] bg-[#fffaf2] text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
            <tr>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Services</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-[#f0e8db] align-top">
                <td className="px-4 py-3 text-[#6f6251]">{new Date(booking.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-[#1f1a15]">
                  <p>{booking.fullName}</p>
                  <p className="text-xs text-[#6f6251]">{booking.email}</p>
                </td>
                <td className="px-4 py-3 text-[#6f6251]">{booking.serviceTitles.join(", ")}</td>
                <td className="px-4 py-3 text-[#6f6251]">
                  {booking.scheduledStart ? new Date(booking.scheduledStart).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
            {!bookings.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#6f6251]">
                  No attributed bookings yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
