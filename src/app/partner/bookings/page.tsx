"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  fromDatetimeLocal,
  money,
  partnerBtnDanger,
  partnerBtnGhost,
  partnerBtnPrimary,
  partnerEyebrow,
  partnerInput,
  partnerMuted,
  partnerPanel,
  partnerTitle,
  toDatetimeLocal,
} from "@/components/partner/ui";

type Booking = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  serviceTitles: string[];
  preferredLocation: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  notes: string | null;
  partnerNotes: string | null;
  guestTotal: number | string | null;
  memberTotal: number | string | null;
};

function BookingsInner() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState("");
  const [filter, setFilter] = useState(searchParams.get("status") ?? "");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");

  async function load() {
    const qs = filter ? `?status=${filter}` : "";
    const res = await fetch(`/api/partner/bookings${qs}`);
    if (res.ok) {
      const payload = (await res.json()) as { bookings: Booking[] };
      setBookings(payload.bookings);
    }
  }

  useEffect(() => {
    void load();
  }, [filter]);

  async function updateBooking(id: string, patch: Record<string, unknown>) {
    setStatus("");
    const res = await fetch("/api/partner/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    setStatus(res.ok ? "Updated." : "Update failed.");
    if (res.ok) {
      setEditingId(null);
      await load();
    }
  }

  function openReschedule(booking: Booking) {
    setEditingId(booking.id);
    setScheduleStart(toDatetimeLocal(booking.scheduledStart));
    setScheduleEnd(toDatetimeLocal(booking.scheduledEnd));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className={partnerEyebrow}>OPERATIONS</p>
        <h1 className={partnerTitle}>Bookings</h1>
        <p className={partnerMuted}>Approve, reschedule, complete, or cancel appointments assigned to you.</p>
      </div>
      {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}

      <div className="flex flex-wrap gap-2">
        {["", "PENDING", "CONFIRMED", "COMPLETED", "CANCELED"].map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-sm border px-3 py-2 text-sm ${
              filter === value ? "border-[#b78d4b] bg-[#fff6e8] text-[#8f6f3e]" : "border-[#e4d9c8] bg-white"
            }`}
          >
            {value || "All"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => {
          const gross =
            Number(booking.memberTotal ?? 0) > 0 ? Number(booking.memberTotal) : Number(booking.guestTotal ?? 0);
          return (
            <article key={booking.id} className={`${partnerPanel} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">{booking.status}</p>
                  <h2 className="mt-1 text-2xl text-[#1f1a15]">{booking.fullName}</h2>
                  <p className="text-sm text-[#6f6251]">
                    <a className="underline hover:text-[#8f6f3e]" href={`mailto:${booking.email}`}>
                      {booking.email}
                    </a>
                    {" · "}
                    <a className="underline hover:text-[#8f6f3e]" href={`tel:${booking.phone}`}>
                      {booking.phone}
                    </a>
                  </p>
                  <p className="mt-2 text-sm text-[#4f4335]">{booking.serviceTitles.join(", ")}</p>
                  <p className="mt-1 text-sm text-[#6f6251]">
                    {booking.scheduledStart ? new Date(booking.scheduledStart).toLocaleString() : "Unscheduled"}
                    {booking.scheduledEnd
                      ? ` – ${new Date(booking.scheduledEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : ""}{" "}
                    · {booking.preferredLocation || "Location TBD"}
                    {gross > 0 ? ` · ${money(gross)}` : ""}
                  </p>
                  {booking.notes ? (
                    <p className="mt-2 whitespace-pre-wrap text-xs text-[#6f6251]">Client notes: {booking.notes}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={booking.status !== "PENDING"}
                    onClick={() => void updateBooking(booking.id, { status: "CONFIRMED" })}
                    className={partnerBtnPrimary}
                  >
                    Approve
                  </button>
                  <button type="button" onClick={() => openReschedule(booking)} className={partnerBtnGhost}>
                    Reschedule
                  </button>
                  <button
                    type="button"
                    disabled={booking.status === "COMPLETED" || booking.status === "CANCELED"}
                    onClick={() => void updateBooking(booking.id, { status: "COMPLETED" })}
                    className={partnerBtnGhost}
                  >
                    Complete
                  </button>
                  <button
                    type="button"
                    disabled={booking.status === "CANCELED" || booking.status === "COMPLETED"}
                    onClick={() => void updateBooking(booking.id, { status: "CANCELED" })}
                    className={partnerBtnDanger}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {editingId === booking.id ? (
                <div className="mt-4 grid gap-3 border-t border-[#e4d9c8] pt-4 md:grid-cols-2">
                  <label className="text-sm text-[#4f4335]">
                    Start
                    <input
                      type="datetime-local"
                      value={scheduleStart}
                      onChange={(e) => setScheduleStart(e.target.value)}
                      className={partnerInput}
                    />
                  </label>
                  <label className="text-sm text-[#4f4335]">
                    End
                    <input
                      type="datetime-local"
                      value={scheduleEnd}
                      onChange={(e) => setScheduleEnd(e.target.value)}
                      className={partnerInput}
                    />
                  </label>
                  <div className="flex gap-2 md:col-span-2">
                    <button
                      type="button"
                      className={partnerBtnPrimary}
                      onClick={() =>
                        void updateBooking(booking.id, {
                          scheduledStart: fromDatetimeLocal(scheduleStart),
                          scheduledEnd: fromDatetimeLocal(scheduleEnd),
                        })
                      }
                    >
                      Save schedule
                    </button>
                    <button type="button" className={partnerBtnGhost} onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              <label className="mt-4 block text-sm text-[#4f4335]">
                Internal notes
                <textarea
                  defaultValue={booking.partnerNotes ?? ""}
                  className={partnerInput}
                  rows={2}
                  onBlur={(e) => {
                    if (e.target.value !== (booking.partnerNotes ?? "")) {
                      void updateBooking(booking.id, { partnerNotes: e.target.value });
                    }
                  }}
                />
              </label>
            </article>
          );
        })}
        {!bookings.length ? <p className="text-sm text-[#6f6251]">No bookings in this view.</p> : null}
      </div>
    </div>
  );
}

export default function PartnerBookingsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#6f6251]">Loading bookings…</p>}>
      <BookingsInner />
    </Suspense>
  );
}
