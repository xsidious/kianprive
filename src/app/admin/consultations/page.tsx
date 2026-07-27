"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminEyebrow,
  adminMuted,
  adminPanel,
  adminSelect,
  adminStat,
  adminTitle,
  statusTone,
} from "@/components/admin/ui";

type ProviderOption = { id: string; displayName: string; partnerCode: string; status: string };

type Consultation = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceIds: string[];
  serviceTitles: string[];
  preferredLocation: string | null;
  scheduledStart: string | null;
  status: string;
  guestTotal: number | string | null;
  memberTotal: number | string | null;
  notes: string | null;
  partnerId: string | null;
  createdAt: string;
  partner: {
    id: string;
    displayName: string;
    partnerCode: string;
    specialty: string | null;
    user: { email: string };
  } | null;
};

function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value ?? 0));
}

export default function AdminConsultationsPage() {
  const [bookings, setBookings] = useState<Consultation[]>([]);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    telemedicine: 0,
    unassigned: 0,
    completedMtd: 0,
  });
  const [providerId, setProviderId] = useState("");
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("all");
  const [message, setMessage] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  async function load() {
    const qs = new URLSearchParams();
    if (providerId) qs.set("providerId", providerId);
    if (status) qs.set("status", status);
    if (kind) qs.set("kind", kind);
    const res = await fetch(`/api/admin/consultations?${qs.toString()}`);
    if (!res.ok) {
      setMessage("Could not load consultations.");
      return;
    }
    const payload = (await res.json()) as {
      bookings: Consultation[];
      providers: ProviderOption[];
      stats: typeof stats;
    };
    setBookings(payload.bookings ?? []);
    setProviders(payload.providers ?? []);
    setStats(payload.stats);
  }

  useEffect(() => {
    void load();
  }, [providerId, status, kind]);

  async function assignProvider(bookingId: string, nextProviderId: string) {
    setMessage("");
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId: nextProviderId || null }),
    });
    setMessage(res.ok ? "Practitioner assigned." : "Failed to assign practitioner.");
    setAssigningId(null);
    if (res.ok) await load();
  }

  async function setBookingStatus(bookingId: string, nextStatus: string) {
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setMessage(res.ok ? "Status updated." : "Failed to update status.");
    if (res.ok) await load();
  }

  const title = useMemo(() => {
    if (kind === "telemedicine") return "Telemedicine";
    if (kind === "consultation") return "Consultations";
    return "Consultations & telemedicine";
  }, [kind]);

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Clinical operations</p>
        <h1 className={adminTitle}>{title}</h1>
        <p className={adminMuted}>
          All practitioner consultations and telemedicine visits. Assign practitioners, complete visits, and track who
          is owed visit pay. Prescription pathways are excluded from practitioner commission.
        </p>
      </div>

      {message ? <p className="text-sm text-[#1b6568]">{message}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Total</p>
          <p className="mt-2 font-serif text-3xl">{stats.total}</p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Telemedicine</p>
          <p className="mt-2 font-serif text-3xl">{stats.telemedicine}</p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Completed MTD</p>
          <p className="mt-2 font-serif text-3xl">{stats.completedMtd}</p>
        </div>
        <div className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Unassigned</p>
          <p className="mt-2 font-serif text-3xl">{stats.unassigned}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select className={adminSelect} value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="all">All consults + provider visits</option>
          <option value="telemedicine">Telemedicine only</option>
          <option value="consultation">Consultations only</option>
        </select>
        <select className={adminSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELED">CANCELED</option>
        </select>
        <select className={adminSelect} value={providerId} onChange={(e) => setProviderId(e.target.value)}>
          <option value="">All practitioners</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.displayName} ({p.partnerCode})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {bookings.map((booking) => {
          const gross =
            Number(booking.memberTotal ?? 0) > 0 ? Number(booking.memberTotal) : Number(booking.guestTotal ?? 0);
          return (
            <article key={booking.id} className={`${adminPanel} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(booking.status)}`}>
                      {booking.status}
                    </span>
                    {booking.serviceIds.includes("telemedicine") ? (
                      <span className="rounded-full bg-[#eef6f3] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#1b6568]">
                        Telemedicine
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-2 font-serif text-2xl text-[#1f1a15]">{booking.fullName}</h2>
                  <p className="text-sm text-[#6f6251]">
                    {booking.email} · {booking.phone}
                  </p>
                  <p className="mt-2 text-sm text-[#4f4335]">{booking.serviceTitles.join(", ")}</p>
                  <p className="mt-1 text-sm text-[#6f6251]">
                    {booking.scheduledStart
                      ? new Date(booking.scheduledStart).toLocaleString()
                      : "Unscheduled"}{" "}
                    · {booking.preferredLocation || "Location TBD"}
                    {gross > 0 ? ` · ${money(gross)}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-[#8f6f3e]">
                    Practitioner:{" "}
                    {booking.partner
                      ? `${booking.partner.displayName} (${booking.partner.partnerCode})`
                      : "Unassigned"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={adminBtnGhost} onClick={() => setAssigningId(booking.id)}>
                    Assign
                  </button>
                  <button
                    type="button"
                    className={adminBtnGhost}
                    disabled={booking.status === "COMPLETED" || booking.status === "CANCELED"}
                    onClick={() => void setBookingStatus(booking.id, "COMPLETED")}
                  >
                    Complete
                  </button>
                  <button
                    type="button"
                    className={adminBtnPrimary}
                    disabled={booking.status !== "PENDING"}
                    onClick={() => void setBookingStatus(booking.id, "CONFIRMED")}
                  >
                    Confirm
                  </button>
                </div>
              </div>

              {assigningId === booking.id ? (
                <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-[#efe6d8] pt-4">
                  <select
                    className={adminSelect}
                    defaultValue={booking.partnerId ?? ""}
                    id={`assign-${booking.id}`}
                  >
                    <option value="">Unassigned</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.displayName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={adminBtnPrimary}
                    onClick={() => {
                      const el = document.getElementById(`assign-${booking.id}`) as HTMLSelectElement | null;
                      void assignProvider(booking.id, el?.value ?? "");
                    }}
                  >
                    Save assignment
                  </button>
                  <button type="button" className={adminBtnGhost} onClick={() => setAssigningId(null)}>
                    Cancel
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
        {!bookings.length ? (
          <p className={`${adminPanel} p-6 text-sm text-[#6f6251]`}>No consultations match these filters.</p>
        ) : null}
      </div>
    </div>
  );
}
