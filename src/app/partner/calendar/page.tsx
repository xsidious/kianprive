"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  partnerBtnGhost,
  partnerEyebrow,
  partnerMuted,
  partnerPanel,
  partnerTitle,
} from "@/components/partner/ui";

type Booking = {
  id: string;
  fullName: string;
  status: string;
  serviceTitles: string[];
  scheduledStart: string | null;
  preferredLocation: string | null;
};

export default function PartnerCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [view, setView] = useState<"day" | "week">("week");
  const [anchor, setAnchor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    void fetch("/api/partner/bookings").then(async (res) => {
      if (!res.ok) return;
      const payload = (await res.json()) as { bookings: Booking[] };
      setBookings(payload.bookings.filter((b) => b.scheduledStart && b.status !== "CANCELED"));
    });
  }, []);

  const rangeStart = useMemo(() => {
    const d = new Date(anchor);
    d.setHours(0, 0, 0, 0);
    if (view === "week") {
      d.setDate(d.getDate() - d.getDay());
    }
    return d;
  }, [anchor, view]);

  const days = useMemo(() => {
    const count = view === "day" ? 1 : 7;
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [rangeStart, view]);

  const rangeEnd = useMemo(() => {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + days.length);
    return d;
  }, [rangeStart, days.length]);

  function shift(delta: number) {
    setAnchor((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta * (view === "day" ? 1 : 7));
      return next;
    });
  }

  function bookingsForDay(day: Date) {
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return bookings
      .filter((b) => {
        const t = new Date(b.scheduledStart!).getTime();
        return t >= start.getTime() && t < end.getTime();
      })
      .sort((a, b) => new Date(a.scheduledStart!).getTime() - new Date(b.scheduledStart!).getTime());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={partnerEyebrow}>SCHEDULE</p>
          <h1 className={partnerTitle}>Calendar</h1>
          <p className={partnerMuted}>
            {rangeStart.toLocaleDateString()} – {new Date(rangeEnd.getTime() - 1).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => shift(-1)} className={partnerBtnGhost}>
            ← Prev
          </button>
          <button
            type="button"
            onClick={() => {
              const d = new Date();
              d.setHours(0, 0, 0, 0);
              setAnchor(d);
            }}
            className={partnerBtnGhost}
          >
            Today
          </button>
          <button type="button" onClick={() => shift(1)} className={partnerBtnGhost}>
            Next →
          </button>
          <button
            type="button"
            onClick={() => setView("day")}
            className={`rounded-sm border px-3 py-2 text-sm ${view === "day" ? "border-[#b78d4b] bg-[#fff6e8]" : "border-[#e4d9c8]"}`}
          >
            Day
          </button>
          <button
            type="button"
            onClick={() => setView("week")}
            className={`rounded-sm border px-3 py-2 text-sm ${view === "week" ? "border-[#b78d4b] bg-[#fff6e8]" : "border-[#e4d9c8]"}`}
          >
            Week
          </button>
        </div>
      </div>

      <div className={`grid gap-3 ${view === "week" ? "md:grid-cols-7" : "grid-cols-1"}`}>
        {days.map((day) => {
          const items = bookingsForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <section
              key={day.toISOString()}
              className={`${partnerPanel} min-h-[160px] p-3 ${isToday ? "border-[#b78d4b]" : ""}`}
            >
              <h2 className="text-sm text-[#1f1a15]">
                <span className="text-xs tracking-[0.12em] text-[#8f6f3e]">
                  {day.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <br />
                {day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </h2>
              <ul className="mt-3 space-y-2">
                {items.map((b) => (
                  <li key={b.id} className="rounded-sm bg-[#fff8ee] p-2 text-xs text-[#4f4335]">
                    <Link href="/partner/bookings" className="font-medium text-[#1f1a15] hover:text-[#8f6f3e]">
                      {new Date(b.scheduledStart!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                      {b.fullName}
                    </Link>
                    <p className="mt-0.5 text-[#6f6251]">{b.serviceTitles[0]}</p>
                    <p className="text-[#8f6f3e]">{b.status}</p>
                  </li>
                ))}
                {!items.length ? <li className="text-xs text-[#b0a090]">Free</li> : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
