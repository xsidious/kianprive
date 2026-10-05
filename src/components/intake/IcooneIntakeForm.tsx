"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckboxGroup, Field, SectionIntro, TextArea, TextInput, YesNoField } from "@/components/intake/intake-field-kit";
import {
  ICOONE_ALCOHOL,
  ICOONE_DELIVERY,
  ICOONE_DISCLAIMER,
  ICOONE_FOCUS_AREAS,
  ICOONE_HEARD_ABOUT,
  ICOONE_HISTORY,
  ICOONE_HISTORY_WHO,
  ICOONE_PROTOCOLS,
  ICOONE_SURGERY_SITES,
  ICOONE_SYMPTOMS,
  ICOONE_WOMEN,
} from "@/lib/intake/icoone-options";
import { defaultIcooneIntake, icooneIntakeSchema } from "@/lib/intake/icoone-schema";

function ChoiceGroup({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const checked = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-sm border px-3 py-2.5 text-left text-sm transition ${
              checked
                ? "border-[#b78d4b] bg-[#fff6e8] text-[#3b3024]"
                : "border-[#b78d4b2d] bg-white text-[#5f5344] hover:border-[#b78d4b66]"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function IcooneIntakeForm() {
  const [form, setForm] = useState(defaultIcooneIntake);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  async function submit() {
    const parsed = icooneIntakeSchema.safeParse({
      ...form,
      surgerySite: form.surgerySite || undefined,
      delivery: form.delivery || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please complete the required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/intake/icoone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake: parsed.data }),
      });
      const data = (await res.json()) as { error?: string; referenceId?: string };
      if (!res.ok) throw new Error(data.error || "Could not submit intake.");
      setReferenceId(data.referenceId ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit intake.");
    } finally {
      setSubmitting(false);
    }
  }

  if (referenceId) {
    return (
      <div className="space-y-4 rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-6">
        <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">INTAKE RECEIVED</p>
        <h2 className="font-serif text-3xl text-[#1f1a15]">Your Icoone intake is with the team</h2>
        <p className="text-[#6f6251]">Use this request code if you need to follow up before your lymphatic drainage appointment.</p>
        <p className="font-mono text-lg tracking-[0.12em] text-[#1f1a15]">{referenceId}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/track-intake?referenceId=${encodeURIComponent(referenceId)}&email=${encodeURIComponent(form.patient.email)}`} className="inline-flex min-h-[44px] items-center rounded-sm bg-[#8a682e] px-5 text-[11px] tracking-[0.18em] text-white">
            TRACK MY INTAKE
          </Link>
          <Link href="/book-online?service=icoone-laser" className="inline-flex min-h-[44px] items-center rounded-sm border border-[#b78d4b80] px-5 text-[11px] tracking-[0.18em] text-[#3b3024]">
            BOOK ICOONE
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-sm border border-[#e4d9c8] bg-white p-5 sm:p-6">
        <SectionIntro eyebrow="BEFORE YOUR VISIT" title="About you" description="Please complete this intake prior to your Icoone lymphatic drainage appointment." />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name"><TextInput value={form.patient.fullName} onChange={(fullName) => setForm({ ...form, patient: { ...form.patient, fullName } })} /></Field>
          <Field label="Email"><TextInput type="email" value={form.patient.email} onChange={(email) => setForm({ ...form, patient: { ...form.patient, email } })} /></Field>
          <Field label="Phone"><TextInput value={form.patient.phone} onChange={(phone) => setForm({ ...form, patient: { ...form.patient, phone } })} /></Field>
          <Field label="Date of birth"><TextInput type="date" value={form.patient.dateOfBirth} onChange={(dateOfBirth) => setForm({ ...form, patient: { ...form.patient, dateOfBirth } })} /></Field>
          <Field label="How old are you?"><TextInput value={form.patient.age} onChange={(age) => setForm({ ...form, patient: { ...form.patient, age } })} /></Field>
          <Field label="Occupation"><TextInput value={form.patient.occupation} onChange={(occupation) => setForm({ ...form, patient: { ...form.patient, occupation } })} /></Field>
        </div>
        <div className="mt-4">
          <YesNoField
            label="Do you or have you had any cold, flu or virus symptoms in the last week?"
            value={form.recentIllness || undefined}
            onChange={(recentIllness) => setForm({ ...form, recentIllness })}
          />
        </div>
        <div className="mt-4">
          <Field label="How did you hear about us?">
            <ChoiceGroup options={ICOONE_HEARD_ABOUT} value={form.heardAbout} onChange={(heardAbout) => setForm({ ...form, heardAbout: heardAbout as typeof form.heardAbout })} />
          </Field>
          <div className="mt-3">
            <Field label="Friend or professional referral name?">
              <TextInput value={form.referralName} onChange={(referralName) => setForm({ ...form, referralName })} />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-[#e4d9c8] bg-white p-5 sm:p-6">
        <SectionIntro eyebrow="HISTORY" title="Cosmetic surgery and physician clearance" />
        <YesNoField label="Have you had cosmetic surgery?" value={form.cosmeticSurgery || undefined} onChange={(cosmeticSurgery) => setForm({ ...form, cosmeticSurgery })} />
        {form.cosmeticSurgery === "yes" ? (
          <div className="mt-4 space-y-4">
            <Field label="If yes, where?">
              <ChoiceGroup options={ICOONE_SURGERY_SITES} value={form.surgerySite} onChange={(surgerySite) => setForm({ ...form, surgerySite: surgerySite as typeof form.surgerySite })} />
            </Field>
            <Field label="When?"><TextInput value={form.surgeryWhen} onChange={(surgeryWhen) => setForm({ ...form, surgeryWhen })} /></Field>
            <Field label="Doctor's name and phone number"><TextInput value={form.surgeonNamePhone} onChange={(surgeonNamePhone) => setForm({ ...form, surgeonNamePhone })} /></Field>
            <Field label="Notes"><TextArea value={form.surgeryNotes} onChange={(surgeryNotes) => setForm({ ...form, surgeryNotes })} /></Field>
          </div>
        ) : null}
        <div className="mt-4">
          <YesNoField
            label="Have you cleared lymphatic drainage with the Icoone machine with your physician?"
            value={form.physicianCleared || undefined}
            onChange={(physicianCleared) => setForm({ ...form, physicianCleared })}
          />
        </div>
      </section>

      <section className="rounded-sm border border-[#e4d9c8] bg-white p-5 sm:p-6">
        <SectionIntro eyebrow="TREATMENT" title="Areas of focus" description="Check all that apply." />
        <CheckboxGroup options={ICOONE_FOCUS_AREAS} selected={form.focusAreas} onChange={(focusAreas) => setForm({ ...form, focusAreas: focusAreas as typeof form.focusAreas })} />
        <div className="mt-4 grid gap-4">
          <Field label="Are you under a doctor's care? If yes, please describe."><TextArea value={form.underDoctorCare} onChange={(underDoctorCare) => setForm({ ...form, underDoctorCare })} /></Field>
          <Field label="Do you have any drug allergies? If yes, what?"><TextArea value={form.drugAllergies} onChange={(drugAllergies) => setForm({ ...form, drugAllergies })} /></Field>
        </div>
      </section>

      <section className="rounded-sm border border-[#e4d9c8] bg-white p-5 sm:p-6">
        <SectionIntro eyebrow="MEDICAL HISTORY" title="You or your immediate family" description="Parents, siblings, and grandparents. Do you now or have you ever had any of these? Check all that apply." />
        <CheckboxGroup
          options={ICOONE_HISTORY}
          selected={form.medicalHistory.conditions}
          exclusiveOption="None"
          onChange={(conditions) => setForm({ ...form, medicalHistory: { ...form.medicalHistory, conditions: conditions as typeof form.medicalHistory.conditions, who: conditions.includes("None") ? [] : form.medicalHistory.who } })}
        />
        {form.medicalHistory.conditions.some((item) => item !== "None") ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-[#3b3024]">If yes to any of the above, who?</p>
            <CheckboxGroup options={ICOONE_HISTORY_WHO} selected={form.medicalHistory.who} onChange={(who) => setForm({ ...form, medicalHistory: { ...form.medicalHistory, who: who as typeof form.medicalHistory.who } })} />
          </div>
        ) : null}
      </section>

      <section className="rounded-sm border border-[#e4d9c8] bg-white p-5 sm:p-6">
        <SectionIntro eyebrow="TODAY" title="Symptoms you are currently experiencing" description="Check all that apply." />
        <CheckboxGroup
          options={ICOONE_SYMPTOMS}
          selected={form.symptoms}
          exclusiveOption="None of the above"
          onChange={(symptoms) => setForm({ ...form, symptoms: symptoms as typeof form.symptoms })}
        />
        <div className="mt-4 grid gap-4">
          <Field label="Do you take prescription drugs or supplements? If yes, what and how often?"><TextArea value={form.medications} onChange={(medications) => setForm({ ...form, medications })} /></Field>
          <Field label="Are you using or have you ever used peptides for weight management or inflammation?"><TextArea value={form.peptides} onChange={(peptides) => setForm({ ...form, peptides })} /></Field>
        </div>
      </section>

      <section className="rounded-sm border border-[#e4d9c8] bg-white p-5 sm:p-6">
        <SectionIntro eyebrow="WOMEN ONLY" title="Women only" description="Leave this section blank if it does not apply." />
        <CheckboxGroup options={ICOONE_WOMEN} selected={form.womenOnly} onChange={(womenOnly) => setForm({ ...form, womenOnly: womenOnly as typeof form.womenOnly })} />
        <div className="mt-4 space-y-4">
          <YesNoField label="Do you have children?" value={form.children || undefined} onChange={(children) => setForm({ ...form, children })} />
          {form.children === "yes" ? (
            <>
              <Field label="If yes, how many?"><TextInput value={form.childrenCount} onChange={(childrenCount) => setForm({ ...form, childrenCount })} /></Field>
              <Field label="Age of youngest child?"><TextInput value={form.youngestChildAge} onChange={(youngestChildAge) => setForm({ ...form, youngestChildAge })} /></Field>
              <Field label="Natural or C-Section">
                <ChoiceGroup options={ICOONE_DELIVERY} value={form.delivery} onChange={(delivery) => setForm({ ...form, delivery: delivery as typeof form.delivery })} />
              </Field>
            </>
          ) : null}
          <YesNoField label="Have you reached menopause?" value={form.menopause || undefined} onChange={(menopause) => setForm({ ...form, menopause })} />
          {form.menopause === "yes" ? (
            <Field label="If yes, at what age?"><TextInput value={form.menopauseAge} onChange={(menopauseAge) => setForm({ ...form, menopauseAge })} /></Field>
          ) : null}
        </div>
      </section>

      <section className="rounded-sm border border-[#e4d9c8] bg-white p-5 sm:p-6">
        <SectionIntro eyebrow="LIFESTYLE" title="Substances" />
        <YesNoField label="Are you currently using or do you have a history of illegal drug use?" value={form.illegalDrugUse || undefined} onChange={(illegalDrugUse) => setForm({ ...form, illegalDrugUse })} />
        <div className="mt-4">
          <p className="text-sm font-medium text-[#3b3024]">Please describe your alcohol consumption</p>
          <CheckboxGroup options={ICOONE_ALCOHOL} selected={form.alcohol} exclusiveOption="Never" onChange={(alcohol) => setForm({ ...form, alcohol: alcohol as typeof form.alcohol })} />
        </div>
      </section>

      <section className="rounded-sm border border-[#e4d9c8] bg-white p-5 sm:p-6">
        <SectionIntro eyebrow="AGREEMENT" title="Disclaimer" />
        <div className="space-y-3 text-sm leading-relaxed text-[#5f5344]">
          {ICOONE_DISCLAIMER.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-4">
          <YesNoField label="You accept and agree to the terms" value={form.disclaimerAccepted || undefined} onChange={(disclaimerAccepted) => setForm({ ...form, disclaimerAccepted })} />
        </div>
        <div className="mt-4">
          <Field label="Type signature to accept"><TextInput value={form.typedSignature} onChange={(typedSignature) => setForm({ ...form, typedSignature })} /></Field>
        </div>
      </section>

      <section className="rounded-sm border border-dashed border-[#b78d4b80] bg-[#fffaf4] p-5 sm:p-6">
        <SectionIntro eyebrow="CLINICIAN ONLY" title="Completed at the visit" description="Height, weight, and protocol are filled in by the clinician. You can leave these blank." />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Height"><TextInput value={form.clinician.height} onChange={(height) => setForm({ ...form, clinician: { ...form.clinician, height } })} /></Field>
          <Field label="Weight"><TextInput value={form.clinician.weight} onChange={(weight) => setForm({ ...form, clinician: { ...form.clinician, weight } })} /></Field>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-[#3b3024]">Protocol</p>
          <CheckboxGroup options={ICOONE_PROTOCOLS} selected={form.clinician.protocols} onChange={(protocols) => setForm({ ...form, clinician: { ...form.clinician, protocols: protocols as typeof form.clinician.protocols } })} />
        </div>
      </section>

      {error ? <p className="text-sm font-medium text-[#7c2c2c]">{error}</p> : null}
      <button type="button" disabled={submitting} onClick={() => void submit()} className="inline-flex min-h-[48px] items-center rounded-sm bg-[#8a682e] px-6 text-[11px] tracking-[0.18em] text-white disabled:opacity-60">
        {submitting ? "SENDING…" : "SUBMIT ICOONE INTAKE"}
      </button>
    </div>
  );
}
