"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminEyebrow, adminMuted, adminPanel, adminTitle, statusTone } from "@/components/admin/ui";

type Patient = {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  dateOfBirth: string;
  city: string;
  state: string;
  preferredContact: string;
  medicalConditions: string;
  allergies: string;
  medications: string;
  status?: string;
  source?: string;
  intakeId?: string | null;
  bookingId?: string | null;
  lastActivityAt?: string;
  serviceTitles?: string[];
};

export default function ProviderPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/provider/patients")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load patient records.");
        const payload = (await res.json()) as { patients: Patient[] };
        setPatients(payload.patients);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((patient) =>
      `${patient.name ?? ""} ${patient.email} ${patient.phone}`.toLowerCase().includes(q),
    );
  }, [patients, query]);

  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Clinical records</p>
        <h1 className={adminTitle}>Your patients</h1>
        <p className={adminMuted}>
          People from intakes and consultations assigned to you — not the full member directory.
        </p>
      </div>
      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name, email, or phone"
        className="w-full max-w-md rounded-sm border border-[#d9c7a8] bg-white px-3 py-2 text-sm"
      />
      <div className="grid gap-3">
        {visible.length === 0 ? (
          <p className={`${adminPanel} p-5 text-sm text-[#6f6251]`}>No assigned patients match.</p>
        ) : (
          visible.map((patient) => (
            <article key={`${patient.email}-${patient.id}`} className={`${adminPanel} p-4`}>
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setOpenId((current) => (current === patient.id ? null : patient.id))}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-serif text-xl text-[#1f1a15]">{patient.name || "Unnamed patient"}</p>
                  {patient.status ? (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(patient.status)}`}>
                      {patient.status.replaceAll("_", " ")}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-[#6f6251]">
                  {patient.email}
                  {patient.phone ? ` · ${patient.phone}` : " · No phone on file"}
                  {patient.source ? ` · via ${patient.source}` : ""}
                </p>
              </button>
              {openId === patient.id ? (
                <dl className="mt-4 grid gap-2 text-sm text-[#3b3024] sm:grid-cols-2">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Date of birth</dt>
                    <dd>{patient.dateOfBirth || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Location</dt>
                    <dd>{[patient.city, patient.state].filter(Boolean).join(", ") || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Preferred contact</dt>
                    <dd>{patient.preferredContact || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Services</dt>
                    <dd>{(patient.serviceTitles ?? []).join(", ") || "—"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Conditions</dt>
                    <dd>{patient.medicalConditions || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Allergies</dt>
                    <dd>{patient.allergies || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Medications</dt>
                    <dd>{patient.medications || "—"}</dd>
                  </div>
                  {patient.intakeId ? (
                    <div className="sm:col-span-2">
                      <Link href={`/provider/intake/${patient.intakeId}`} className="text-sm text-[#8f6f3e] underline">
                        Open assigned intake →
                      </Link>
                    </div>
                  ) : null}
                </dl>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
