"use client";

import { useEffect, useState } from "react";

import type { RetreatEvent } from "@/lib/events";

export default function AdminRetreatsPage() {
  const [events, setEvents] = useState<RetreatEvent[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadRetreats() {
      try {
        const response = await fetch("/api/retreats");
        if (!response.ok) return;
        const payload = (await response.json()) as { events?: RetreatEvent[] };
        setEvents(payload.events ?? []);
      } catch {
        setStatus("Could not load retreats.");
      }
    }
    void loadRetreats();
  }, []);

  async function save() {
    setStatus("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: [{ key: "retreatEvents", value: events }],
        }),
      });
      if (!response.ok) throw new Error("Failed");
      setStatus("Retreat events saved.");
    } catch {
      setStatus("Save failed.");
    }
  }

  function updateEvent(index: number, key: keyof RetreatEvent, value: string) {
    setEvents((prev) => prev.map((event, i) => (i === index ? { ...event, [key]: value } : event)));
  }

  function addEvent() {
    setEvents((prev) => [
      ...prev,
      {
        slug: `new-retreat-${prev.length + 1}`,
        title: "New Retreat Event",
        subtitle: "Add subtitle",
        description: "Add event description",
        location: "Add location",
        when: "Add event date/time",
        image: "/images/beauty.avif",
      },
    ]);
  }

  function removeEvent(index: number) {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-[#1f1a15]">Retreats Manager</h1>
      <p className="mt-2 text-[#6f6251]">
        Manage retreat/event cards with a visual editor. This controls the Events & Retreats listing and detail pages.
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={addEvent} className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">
          Add Event
        </button>
        <button type="button" onClick={save} className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
          Save Retreat Events
        </button>
        {status ? <p className="self-center text-sm text-[#8f6f3e]">{status}</p> : null}
      </div>

      <div className="grid gap-4">
        {events.map((event, index) => (
          <article key={`${event.slug}-${index}`} className="rounded-2xl border border-[#b78d4b2d] bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm tracking-[0.15em] text-[#8f6f3e]">EVENT {index + 1}</p>
              <button
                type="button"
                onClick={() => removeEvent(index)}
                className="rounded-full border border-[#d07b7b80] px-3 py-1 text-xs text-[#7c2c2c]"
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm text-[#5f5344]">
                Title
                <input value={event.title} onChange={(e) => updateEvent(index, "title", e.target.value)} className="mt-1 w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 text-[#1f1a15]" />
              </label>
              <label className="text-sm text-[#5f5344]">
                Slug
                <input value={event.slug} onChange={(e) => updateEvent(index, "slug", e.target.value)} className="mt-1 w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 text-[#1f1a15]" />
              </label>
              <label className="text-sm text-[#5f5344] md:col-span-2">
                Subtitle
                <input value={event.subtitle} onChange={(e) => updateEvent(index, "subtitle", e.target.value)} className="mt-1 w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 text-[#1f1a15]" />
              </label>
              <label className="text-sm text-[#5f5344]">
                Location
                <input value={event.location} onChange={(e) => updateEvent(index, "location", e.target.value)} className="mt-1 w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 text-[#1f1a15]" />
              </label>
              <label className="text-sm text-[#5f5344]">
                Date / Time
                <input value={event.when} onChange={(e) => updateEvent(index, "when", e.target.value)} className="mt-1 w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 text-[#1f1a15]" />
              </label>
              <label className="text-sm text-[#5f5344] md:col-span-2">
                Image Path
                <input value={event.image} onChange={(e) => updateEvent(index, "image", e.target.value)} className="mt-1 w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 text-[#1f1a15]" />
              </label>
              <label className="text-sm text-[#5f5344] md:col-span-2">
                Ticket URL (Luma, etc.)
                <input
                  value={event.ticketUrl ?? ""}
                  onChange={(e) => updateEvent(index, "ticketUrl", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 text-[#1f1a15]"
                />
              </label>
              <label className="text-sm text-[#5f5344]">
                Ticket Price
                <input
                  value={event.ticketPrice ?? ""}
                  onChange={(e) => updateEvent(index, "ticketPrice", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 text-[#1f1a15]"
                />
              </label>
              <label className="text-sm text-[#5f5344]">
                Host / Presenter
                <input
                  value={event.host ?? ""}
                  onChange={(e) => updateEvent(index, "host", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 text-[#1f1a15]"
                />
              </label>
              <label className="text-sm text-[#5f5344] md:col-span-2">
                Description
                <textarea value={event.description} onChange={(e) => updateEvent(index, "description", e.target.value)} className="mt-1 min-h-[120px] w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 text-[#1f1a15]" />
              </label>
            </div>
          </article>
        ))}
        {events.length === 0 ? (
          <div className="rounded-2xl border border-[#b78d4b2d] bg-white p-5 text-sm text-[#6f6251]">
            No retreat events yet. Click <span className="text-[#8f6f3e]">Add Event</span> to create one.
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
        <p className="text-sm text-[#6f6251]">
          Preview live page:
          {" "}
          <a className="text-[#8f6f3e] underline" href="/events-retreats" target="_blank" rel="noreferrer">
            /events-retreats
          </a>
        </p>
      </div>
    </div>
  );
}
