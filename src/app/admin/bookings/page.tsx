"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BOOKING_STATUS_LABELS,
  bookingStatusTone,
  formatBookingDateTime,
  formatMoney,
  parseAcuityAppointmentId,
} from "@/lib/admin/booking-display";

type Booking = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceIds: string[];
  serviceTitles: string[];
  preferredDate: string;
  preferredLocation: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  timezone: string | null;
  notes: string | null;
  guestTotal: string;
  memberTotal: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED";
  createdAt: string;
};

const statuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"] as const;
type Filter = "all" | "upcoming" | "past" | (typeof statuses)[number];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadBookings() {
    setLoading(true);
    const response = await fetch("/api/admin/bookings");
    if (!response.ok) {
      setStatusMessage("Could not load bookings. Check that you are signed in as an admin.");
      setLoading(false);
      return;
    }
    const payload = (await response.json()) as { bookings: Booking[] };
    setBookings(payload.bookings);
    setLoading(false);
  }

  useEffect(() => {
    void loadBookings();
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    return bookings.filter((booking) => {
      const start = booking.scheduledStart
        ? new Date(booking.scheduledStart).getTime()
        : new Date(booking.preferredDate).getTime();
      if (filter === "all") return true;
      if (filter === "upcoming") return start >= now && booking.status !== "CANCELED";
      if (filter === "past") return start < now || booking.status === "COMPLETED";
      return booking.status === filter;
    });
  }, [bookings, filter]);

  const counts = useMemo(() => {
    const now = Date.now();
    return {
      all: bookings.length,
      upcoming: bookings.filter(
        (b) =>
          (b.scheduledStart ? new Date(b.scheduledStart).getTime() : new Date(b.preferredDate).getTime()) >=
            now && b.status !== "CANCELED",
      ).length,
      confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
    };
  }, [bookings]);

  async function saveBooking(booking: Booking) {
    const response = await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: booking.status,
        preferredLocation: booking.preferredLocation,
        notes: booking.notes,
      }),
    });
    setStatusMessage(response.ok ? "Booking updated." : "Failed to update booking.");
    if (response.ok) await loadBookings();
  }

  async function deleteBooking(id: string) {
    if (!window.confirm("Delete this booking record? This does not cancel the Acuity appointment.")) return;
    const response = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
    setStatusMessage(response.ok ? "Booking deleted." : "Failed to delete booking.");
    if (response.ok) await loadBookings();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1f1a15]">Service Bookings</h1>
        <p className="mt-2 max-w-2xl text-[#6f6251]">
          Every booking from the online wizard is saved here after confirmation. Acuity appointment IDs appear when
          scheduling is connected.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {(
          [
            ["upcoming", `Upcoming (${counts.upcoming})`],
            ["all", `All (${counts.all})`],
            ["CONFIRMED", `Confirmed (${counts.confirmed})`],
            ["PENDING", `Pending (${counts.pending})`],
            ["past", "Past"],
            ["COMPLETED", "Completed"],
            ["CANCELED", "Canceled"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full border px-4 py-2 transition ${
              filter === key
                ? "border-[#b78d4b] bg-[#fff6e8] text-[#8f6f3e]"
                : "border-[#b78d4b40] bg-white text-[#4f4335] hover:bg-[#fffaf4]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[#6f6251]">Loading bookings…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d7b67666] bg-white/80 p-10 text-center">
          <p className="text-lg text-[#1f1a15]">No bookings in this view</p>
          <p className="mt-2 text-sm text-[#6f6251]">
            New appointments from <span className="text-[#8f6f3e]">/book-online</span> will show up here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const tz = booking.timezone ?? "America/New_York";
            const acuityId = parseAcuityAppointmentId(booking.notes);
            const when = formatBookingDateTime(booking.scheduledStart ?? booking.preferredDate, tz);
            const endWhen = booking.scheduledEnd
              ? formatBookingDateTime(booking.scheduledEnd, tz).split(", ").slice(-1).join(", ")
              : null;

            return (
              <article
                key={booking.id}
                className="rounded-2xl border border-[#b78d4b2d] bg-white p-5 shadow-sm shadow-[#b78d4b12]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xl text-[#1f1a15]">{booking.fullName}</p>
                    <p className="mt-1 text-sm text-[#6f6251]">
                      Booked {formatBookingDateTime(booking.createdAt, tz)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium tracking-wide ${bookingStatusTone(booking.status)}`}
                  >
                    {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl bg-[#fffaf4] p-4">
                    <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">APPOINTMENT</p>
                    <p className="mt-2 text-base text-[#1f1a15]">{when}</p>
                    {endWhen ? <p className="mt-1 text-sm text-[#6f6251]">Ends {endWhen}</p> : null}
                    <p className="mt-1 text-xs text-[#6f6251]">{tz.replace(/_/g, " ")}</p>
                  </div>

                  <div className="rounded-xl bg-[#fffaf4] p-4">
                    <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">CONTACT</p>
                    <p className="mt-2">
                      <a href={`mailto:${booking.email}`} className="text-[#3b3024] hover:text-[#8f6f3e]">
                        {booking.email}
                      </a>
                    </p>
                    <p className="mt-1">
                      <a href={`tel:${booking.phone}`} className="text-sm text-[#3b3024] hover:text-[#8f6f3e]">
                        {booking.phone}
                      </a>
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#fffaf4] p-4">
                    <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">PRICING</p>
                    <p className="mt-2 text-base text-[#1f1a15]">Guest {formatMoney(booking.guestTotal)}</p>
                    <p className="text-sm text-[#6f6251]">Member {formatMoney(booking.memberTotal)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">SERVICES</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {booking.serviceTitles.map((title, index) => (
                      <li
                        key={`${booking.id}-${title}-${index}`}
                        className="rounded-full border border-[#d7b67666] bg-[#fff6e8] px-3 py-1 text-sm text-[#3b3024]"
                      >
                        {title}
                      </li>
                    ))}
                  </ul>
                </div>

                {acuityId ? (
                  <p className="mt-3 text-sm text-[#6f6251]">
                    Acuity appointment{" "}
                    <span className="font-medium text-[#8f6f3e]">#{acuityId}</span>
                    {" · "}
                    <a
                      href="https://secure.acuityscheduling.com/appointments.php"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#8f6f3e] underline-offset-2 hover:underline"
                    >
                      Open Acuity schedule
                    </a>
                  </p>
                ) : null}

                {booking.notes ? (
                  <div className="mt-4 rounded-xl border border-[#d7b67644] bg-[#fffaf4] p-3">
                    <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">NOTES</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#3b3024]">{booking.notes}</p>
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3 border-t border-[#d7b67633] pt-5 md:grid-cols-3">
                  <label className="block text-sm text-[#4f4335]">
                    Location
                    <input
                      value={booking.preferredLocation}
                      onChange={(event) =>
                        setBookings((prev) =>
                          prev.map((row) =>
                            row.id === booking.id ? { ...row, preferredLocation: event.target.value } : row,
                          ),
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2"
                    />
                  </label>
                  <label className="block text-sm text-[#4f4335]">
                    Status
                    <select
                      value={booking.status}
                      onChange={(event) =>
                        setBookings((prev) =>
                          prev.map((row) =>
                            row.id === booking.id
                              ? { ...row, status: event.target.value as Booking["status"] }
                              : row,
                          ),
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2"
                    >
                      {statuses.map((entry) => (
                        <option key={entry} value={entry}>
                          {BOOKING_STATUS_LABELS[entry]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => void saveBooking(booking)}
                      className="rounded-full border border-[#b78d4b80] bg-[#fff6e8] px-4 py-2 text-sm text-[#3b3024] hover:bg-[#fffaf4]"
                    >
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteBooking(booking.id)}
                      className="rounded-full border border-[#d07b7b80] px-4 py-2 text-sm text-[#7c2c2c] hover:bg-[#fdeeee]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {statusMessage ? <p className="text-sm text-[#8f6f3e]">{statusMessage}</p> : null}
    </div>
  );
}
