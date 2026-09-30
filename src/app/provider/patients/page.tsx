"use client";

import { useEffect, useMemo, useState } from "react";
import { adminEyebrow, adminMuted, adminPanel, adminTitle } from "@/components/admin/ui";

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
        <h1 className={adminTitle}>Members & patients</h1>
        <p className={adminMuted}>
          Active member accounts with the phone number, email, and health details on file. Use this list for care,
          email, and text messages.
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
          <p className={`${adminPanel} p-5 text-sm text-[#6f6251]`}>No member records match.</p>
        ) : (
          visible.map((patient) => (
            <article key={patient.id} className={`${adminPanel} p-4`}>
              <button type="button" className="w-full text-left" onClick={() => setOpenId((current) => (current === patient.id ? null : patient.id))}>
                <p className="font-serif text-xl text-[#1f1a15]">{patient.name || "Unnamed member"}</p>
                <p className="mt-1 text-sm text-[#6f6251]">
                  {patient.email}
                  {patient.phone ? ` · ${patient.phone}` : " · No phone on file"}
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
                  <div className="sm:col-span-2">
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Medical conditions</dt>
                    <dd className="whitespace-pre-wrap">{patient.medicalConditions || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Allergies</dt>
                    <dd className="whitespace-pre-wrap">{patient.allergies || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Medications</dt>
                    <dd className="whitespace-pre-wrap">{patient.medications || "—"}</dd>
                  </div>
                </dl>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
