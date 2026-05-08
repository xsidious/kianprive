"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  fullName: string;
  email: string;
  serviceTitles: string[];
  preferredDate: string;
  preferredLocation: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED";
};

const statuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"] as const;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState("");

  async function loadBookings() {
    const response = await fetch("/api/admin/bookings");
    if (!response.ok) return;
    const payload = (await response.json()) as { bookings: Booking[] };
    setBookings(payload.bookings);
  }

  useEffect(() => {
    void loadBookings();
  }, []);

  async function saveBooking(booking: Booking) {
    const response = await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: booking.status,
        preferredLocation: booking.preferredLocation,
      }),
    });
    setStatus(response.ok ? "Booking updated." : "Failed to update booking.");
    if (response.ok) await loadBookings();
  }

  async function deleteBooking(id: string) {
    const response = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
    setStatus(response.ok ? "Booking deleted." : "Failed to delete booking.");
    if (response.ok) await loadBookings();
  }

  return (
    <div>
      <h1 className="text-3xl text-[#1f1a15]">Service Bookings</h1>
      <p className="mt-2 text-[#6f6251]">CRUD management for consultation and service booking requests.</p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#d7b67666] bg-white">
        <table className="w-full text-left text-sm text-[#3b3024]">
          <thead className="bg-[#fff6e8]">
            <tr>
              <th className="p-3">Client</th>
              <th className="p-3">Services</th>
              <th className="p-3">Date</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t border-[#d7b67633] align-top">
                <td className="p-3">
                  <p>{booking.fullName}</p>
                  <p className="text-xs text-[#6f6251]">{booking.email}</p>
                </td>
                <td className="p-3">{booking.serviceTitles.join(", ")}</td>
                <td className="p-3">{new Date(booking.preferredDate).toISOString().slice(0, 10)}</td>
                <td className="p-3">
                  <input
                    value={booking.preferredLocation}
                    onChange={(event) =>
                      setBookings((prev) => prev.map((row) => row.id === booking.id ? { ...row, preferredLocation: event.target.value } : row))
                    }
                    className="w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2"
                  />
                </td>
                <td className="p-3">
                  <select
                    value={booking.status}
                    onChange={(event) =>
                      setBookings((prev) => prev.map((row) => row.id === booking.id ? { ...row, status: event.target.value as Booking["status"] } : row))
                    }
                    className="w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2"
                  >
                    {statuses.map((entry) => (
                      <option key={entry} value={entry}>{entry}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => void saveBooking(booking)} className="rounded-full border border-[#b78d4b80] px-3 py-1.5 text-xs text-[#3b3024]">
                      Save
                    </button>
                    <button onClick={() => void deleteBooking(booking.id)} className="rounded-full border border-[#d07b7b80] px-3 py-1.5 text-xs text-[#7c2c2c]">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {status ? <p className="mt-3 text-sm text-[#8f6f3e]">{status}</p> : null}
    </div>
  );
}
