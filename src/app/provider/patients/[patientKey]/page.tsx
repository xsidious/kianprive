"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminEyebrow, adminMuted, adminPanel, adminTitle, statusTone } from "@/components/admin/ui";

type ChartPatient = {
  email: string;
  userId: string | null;
  name: string;
  phone: string;
  dateOfBirth: string;
  city: string;
  state: string;
  medicalConditions: string;
  allergies: string;
  medications: string;
  preferredContact: string;
  notesCount: number;
  filesCount: number;
};

type ChartNote = {
  id: string;
  visibility: "CLINICAL" | "CLIENT";
  body: string;
  createdAt: string;
  authorPartnerId: string | null;
};

type ChartFile = {
  id: string;
  fileName: string | null;
  mimeType: string | null;
  url: string;
  visibility: "CLINICAL" | "CLIENT";
  legacy?: boolean;
  createdAt: string;
};

type Slot = { id: string; label?: string; start?: string };

type ServiceAssignment = { serviceSlug: string };

export default function ProviderPatientChartPage() {
  const params = useParams<{ patientKey: string }>();
  const patientKey = decodeURIComponent(params.patientKey || "");

  const [patient, setPatient] = useState<ChartPatient | null>(null);
  const [intakes, setIntakes] = useState<Array<{ id: string; status: string; programs: string[]; createdAt: string }>>([]);
  const [bookings, setBookings] = useState<
    Array<{ id: string; status: string; serviceTitles: string[]; scheduledStart: string | null; createdAt: string }>
  >([]);
  const [notes, setNotes] = useState<ChartNote[]>([]);
  const [files, setFiles] = useState<ChartFile[]>([]);
  const [legacyFiles, setLegacyFiles] = useState<ChartFile[]>([]);
  const [noteTab, setNoteTab] = useState<"CLINICAL" | "CLIENT">("CLINICAL");
  const [noteBody, setNoteBody] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [services, setServices] = useState<ServiceAssignment[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState("");
  const [location, setLocation] = useState("Clinic");
  const [bookingNotes, setBookingNotes] = useState("");
  const [partnerNotes, setPartnerNotes] = useState("");
  const [bookingBusy, setBookingBusy] = useState(false);

  const loadChart = useCallback(async () => {
    setError("");
    const res = await fetch(`/api/provider/patients/${encodeURIComponent(patientKey)}`);
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error || "Could not load patient chart.");
    }
    const data = (await res.json()) as {
      patient: ChartPatient;
      intakes: typeof intakes;
      bookings: typeof bookings;
    };
    setPatient(data.patient);
    setIntakes(data.intakes);
    setBookings(data.bookings);
  }, [patientKey]);

  const loadNotes = useCallback(async () => {
    const res = await fetch(
      `/api/provider/patients/${encodeURIComponent(patientKey)}/notes?visibility=${noteTab}`,
    );
    if (!res.ok) throw new Error("Could not load notes.");
    const data = (await res.json()) as { notes: ChartNote[] };
    setNotes(data.notes);
  }, [patientKey, noteTab]);

  const loadFiles = useCallback(async () => {
    const res = await fetch(`/api/provider/patients/${encodeURIComponent(patientKey)}/files`);
    if (!res.ok) throw new Error("Could not load files.");
    const data = (await res.json()) as { files: ChartFile[]; legacy: ChartFile[] };
    setFiles(data.files);
    setLegacyFiles(data.legacy);
  }, [patientKey]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadChart(), loadNotes(), loadFiles()])
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loadChart, loadNotes, loadFiles]);

  useEffect(() => {
    void fetch("/api/partner/me")
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as {
          partner?: { serviceAssignments?: ServiceAssignment[] };
        };
        const rows = data.partner?.serviceAssignments ?? [];
        setServices(rows);
        if (rows[0]?.serviceSlug) setServiceId(rows[0].serviceSlug);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!serviceId) {
      setSlots([]);
      setSlotId("");
      return;
    }
    void fetch(`/api/scheduling/slots?serviceId=${encodeURIComponent(serviceId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load slots.");
        const data = (await res.json()) as { slots?: Slot[] };
        const next = data.slots ?? [];
        setSlots(next);
        setSlotId(next[0]?.id || "");
      })
      .catch(() => {
        setSlots([]);
        setSlotId("");
      });
  }, [serviceId]);

  const gallery = useMemo(() => [...files, ...legacyFiles], [files, legacyFiles]);

  async function submitNote() {
    setMessage("");
    setError("");
    const res = await fetch(`/api/provider/patients/${encodeURIComponent(patientKey)}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility: noteTab, body: noteBody }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setError(data?.error || "Could not save note.");
      return;
    }
    setNoteBody("");
    setMessage(`${noteTab === "CLINICAL" ? "Clinical" : "Client"} note saved.`);
    await loadNotes();
    await loadChart();
  }

  async function submitBooking() {
    if (!patient) return;
    setBookingBusy(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/provider/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: patient.name,
          email: patient.email,
          phone: patient.phone || "0000000000",
          preferredLocation: location,
          serviceIds: [serviceId],
          scheduledSlotId: slotId,
          notes: bookingNotes || undefined,
          partnerNotes: partnerNotes || undefined,
          patientDateOfBirth: patient.dateOfBirth || undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string; booking?: { id: string } } | null;
      if (!res.ok) throw new Error(data?.error || "Could not create booking.");
      setMessage(`Booking confirmed (${data?.booking?.id?.slice(0, 8)}…).`);
      setBookingNotes("");
      setPartnerNotes("");
      await loadChart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setBookingBusy(false);
    }
  }

  async function uploadFile(file: File, visibility: "CLINICAL" | "CLIENT") {
    setMessage("");
    setError("");
    const form = new FormData();
    form.set("file", file);
    form.set("visibility", visibility);
    const res = await fetch(`/api/provider/patients/${encodeURIComponent(patientKey)}/files`, {
      method: "POST",
      body: form,
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setError(data?.error || "Upload failed.");
      return;
    }
    setMessage("File uploaded.");
    await loadFiles();
    await loadChart();
  }

  if (loading && !patient) {
    return <p className={adminMuted}>Loading patient chart…</p>;
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[#7c2c2c]">{error || "Patient not found."}</p>
        <Link href="/provider/patients" className="text-sm text-[#8f6f3e] underline">
          ← Back to patients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={adminEyebrow}>Patient chart</p>
          <h1 className={adminTitle}>{patient.name}</h1>
          <p className={adminMuted}>
            {patient.email}
            {patient.phone ? ` · ${patient.phone}` : ""}
            {patient.dateOfBirth ? ` · DOB ${patient.dateOfBirth}` : ""}
          </p>
        </div>
        <Link href="/provider/patients" className="text-sm text-[#8f6f3e] underline">
          ← All patients
        </Link>
      </div>

      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}
      {message ? <p className="text-sm text-[#2d5c3a]">{message}</p> : null}

      <section className={`${adminPanel} grid gap-3 p-5 sm:grid-cols-2`}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Location</p>
          <p className="text-sm">{[patient.city, patient.state].filter(Boolean).join(", ") || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Preferred contact</p>
          <p className="text-sm">{patient.preferredContact || "—"}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Conditions</p>
          <p className="text-sm">{patient.medicalConditions || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Allergies</p>
          <p className="text-sm">{patient.allergies || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Medications</p>
          <p className="text-sm">{patient.medications || "—"}</p>
        </div>
      </section>

      <section className={`${adminPanel} space-y-4 p-5`}>
        <h2 className="font-serif text-2xl text-[#1f1a15]">Book a service</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Service</span>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full rounded-sm border border-[#d9c7a8] bg-white px-3 py-2"
            >
              {services.length === 0 ? <option value="">No assigned services</option> : null}
              {services.map((s) => (
                <option key={s.serviceSlug} value={s.serviceSlug}>
                  {s.serviceSlug}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Slot</span>
            <select
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              className="w-full rounded-sm border border-[#d9c7a8] bg-white px-3 py-2"
            >
              {slots.length === 0 ? <option value="">No open slots</option> : null}
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label || slot.start || slot.id}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-sm border border-[#d9c7a8] bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Client-facing notes</span>
            <textarea
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              rows={3}
              className="w-full rounded-sm border border-[#d9c7a8] bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Internal partner notes</span>
            <textarea
              value={partnerNotes}
              onChange={(e) => setPartnerNotes(e.target.value)}
              rows={3}
              className="w-full rounded-sm border border-[#d9c7a8] bg-white px-3 py-2"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={bookingBusy || !serviceId || !slotId}
          onClick={() => void submitBooking()}
          className="rounded-sm bg-[#1f1a15] px-4 py-2 text-sm text-[#f7f1e6] disabled:opacity-50"
        >
          {bookingBusy ? "Booking…" : "Confirm booking"}
        </button>
      </section>

      <section className={`${adminPanel} space-y-4 p-5`}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNoteTab("CLINICAL")}
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.12em] ${
              noteTab === "CLINICAL" ? "bg-[#1f1a15] text-[#f7f1e6]" : "border border-[#d9c7a8] text-[#6f6251]"
            }`}
          >
            Clinical notes
          </button>
          <button
            type="button"
            onClick={() => setNoteTab("CLIENT")}
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.12em] ${
              noteTab === "CLIENT" ? "bg-[#1f1a15] text-[#f7f1e6]" : "border border-[#d9c7a8] text-[#6f6251]"
            }`}
          >
            Client notes
          </button>
        </div>
        <p className={adminMuted}>
          {noteTab === "CLINICAL"
            ? "Clinician-only. Not shown to the patient."
            : "Visible to the patient in their member chart."}
        </p>
        <textarea
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          rows={4}
          placeholder={noteTab === "CLINICAL" ? "Add a clinical note…" : "Add a client-visible note…"}
          className="w-full rounded-sm border border-[#d9c7a8] bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={!noteBody.trim()}
          onClick={() => void submitNote()}
          className="rounded-sm bg-[#8f6f3e] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Save {noteTab === "CLINICAL" ? "clinical" : "client"} note
        </button>
        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-[#6f6251]">No {noteTab.toLowerCase()} notes yet.</p>
          ) : (
            notes.map((note) => (
              <article key={note.id} className="rounded-sm border border-[#eadfcd] bg-[#fbf7f0] p-3 text-sm">
                <p className="whitespace-pre-wrap text-[#3b3024]">{note.body}</p>
                <p className="mt-2 text-[11px] text-[#8f6f3e]">{new Date(note.createdAt).toLocaleString()}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className={`${adminPanel} space-y-4 p-5`}>
        <h2 className="font-serif text-2xl text-[#1f1a15]">Files & pictures</h2>
        <div className="flex flex-wrap gap-3">
          <label className="cursor-pointer rounded-sm border border-[#d9c7a8] bg-white px-3 py-2 text-sm">
            Upload clinical file
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(file, "CLINICAL");
                e.currentTarget.value = "";
              }}
            />
          </label>
          <label className="cursor-pointer rounded-sm border border-[#d9c7a8] bg-white px-3 py-2 text-sm">
            Upload client-visible file
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(file, "CLIENT");
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.length === 0 ? (
            <p className="text-sm text-[#6f6251]">No files yet.</p>
          ) : (
            gallery.map((file) => (
              <figure key={file.id} className="overflow-hidden rounded-sm border border-[#eadfcd] bg-white">
                {file.mimeType?.startsWith("image") || file.url.startsWith("data:image") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={file.url} alt={file.fileName || "Patient file"} className="h-40 w-full object-contain bg-[#f7f1e6]" />
                ) : (
                  <a href={file.url} target="_blank" rel="noreferrer" className="flex h-40 items-center justify-center text-sm text-[#8f6f3e] underline">
                    Open {file.fileName || "file"}
                  </a>
                )}
                <figcaption className="space-y-1 p-2 text-xs text-[#6f6251]">
                  <p className="truncate font-medium text-[#3b3024]">{file.fileName || "Untitled"}</p>
                  <p>
                    {file.visibility}
                    {file.legacy ? " · legacy" : ""}
                  </p>
                </figcaption>
              </figure>
            ))
          )}
        </div>
      </section>

      <section className={`${adminPanel} space-y-3 p-5`}>
        <h2 className="font-serif text-2xl text-[#1f1a15]">Assigned intakes & bookings</h2>
        <div className="grid gap-2">
          {intakes.map((intake) => (
            <Link
              key={intake.id}
              href={`/provider/intake/${intake.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#eadfcd] px-3 py-2 text-sm hover:bg-[#fbf7f0]"
            >
              <span>Intake · {intake.programs.join(", ") || "programs"}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${statusTone(intake.status)}`}>
                {intake.status.replaceAll("_", " ")}
              </span>
            </Link>
          ))}
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#eadfcd] px-3 py-2 text-sm"
            >
              <span>
                Booking · {booking.serviceTitles.join(", ") || "services"}
                {booking.scheduledStart ? ` · ${new Date(booking.scheduledStart).toLocaleString()}` : ""}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${statusTone(booking.status)}`}>
                {booking.status}
              </span>
            </div>
          ))}
          {intakes.length === 0 && bookings.length === 0 ? (
            <p className="text-sm text-[#6f6251]">No linked intakes or bookings.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
