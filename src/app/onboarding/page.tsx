"use client";

import { useEffect, useState } from "react";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialInput,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const payload = (await res.json()) as {
        profile: {
          name: string;
          phone: string;
          dateOfBirth: string;
          medicalConditions: string;
          allergies: string;
          medications: string;
          emergencyContact: string;
          emergencyPhone: string;
        };
      };
      setName(payload.profile.name ?? "");
      setPhone(payload.profile.phone ?? "");
      setDateOfBirth(payload.profile.dateOfBirth ?? "");
      setMedicalConditions(payload.profile.medicalConditions ?? "");
      setAllergies(payload.profile.allergies ?? "");
      setMedications(payload.profile.medications ?? "");
      setEmergencyContact(payload.profile.emergencyContact ?? "");
      setEmergencyPhone(payload.profile.emergencyPhone ?? "");
      setLoading(false);
    }
    void load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        dateOfBirth,
        medicalConditions,
        allergies,
        medications,
        emergencyContact,
        emergencyPhone,
        completeOnboarding: true,
      }),
    });
    if (!res.ok) {
      setError("Could not save your profile.");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <div className={`${editorialPanel} p-6 sm:p-8`}>
          <EditorialEyebrow>WELCOME</EditorialEyebrow>
          <h1 className="mt-4 font-serif text-4xl text-[#1f1a15]">Finish your member profile</h1>
          <p className="mt-3 max-w-2xl text-[#6f6251]">
            Confirm your details and add any medical conditions, allergies, or medications so your care team has them on
            file.
          </p>
        </div>
        <form className={`mt-8 space-y-4 ${editorialPanel} p-6`} onSubmit={(e) => void onSubmit(e)}>
          <input className={editorialInput} required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={editorialInput} placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className={editorialInput} placeholder="Date of birth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          <textarea className={`${editorialInput} min-h-24`} placeholder="Medical conditions" value={medicalConditions} onChange={(e) => setMedicalConditions(e.target.value)} />
          <textarea className={`${editorialInput} min-h-20`} placeholder="Allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
          <textarea className={`${editorialInput} min-h-20`} placeholder="Medications" value={medications} onChange={(e) => setMedications(e.target.value)} />
          <input className={editorialInput} placeholder="Emergency contact name" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
          <input className={editorialInput} placeholder="Emergency contact phone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button disabled={loading} className={`w-full ${editorialCtaPrimary}`}>
            {loading ? "LOADING…" : "SAVE AND CONTINUE"}
          </button>
        </form>
      </EditorialSection>
    </div>
  );
}
