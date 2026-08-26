"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckboxGroup,
  Field,
  SectionIntro,
  TextArea,
  TextInput,
} from "@/components/intake/intake-field-kit";
import { SignaturePad } from "@/components/intake/SignaturePad";
import {
  CELEXO_ACTIVE_CONDITIONS,
  CELEXO_AFTERCARE_SUMMARY,
  CELEXO_ALCOHOL,
  CELEXO_ALLERGIES,
  CELEXO_CONSENT_STATEMENTS,
  CELEXO_DELIVERY_METHODS,
  CELEXO_DIET,
  CELEXO_EXERCISE,
  CELEXO_FITZPATRICK,
  CELEXO_GOAL_OPTIONS,
  CELEXO_INTAKE_STEPS,
  CELEXO_MEDICAL_CONDITIONS,
  CELEXO_PRIMARY_CONCERNS,
  CELEXO_PROTOCOLS,
  CELEXO_RECENT_TREATMENTS,
  CELEXO_REGIMENS,
  CELEXO_SCREENING_QUESTIONS,
  CELEXO_SKIN_TYPES,
  CELEXO_SLEEP,
  CELEXO_SMOKING,
  CELEXO_SPF,
  CELEXO_STRESS,
  CELEXO_SUN_EXPOSURE,
  CELEXO_TREATMENT_AREAS,
  CELEXO_WATER,
} from "@/lib/intake/celexo-options";
import {
  celexoIntakeSchema,
  celexoStepValidators,
  defaultCelexoIntake,
} from "@/lib/intake/celexo-schema";

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

function toggleGoal(
  current: Array<{ goal: string; rank: number }>,
  goal: string,
): Array<{ goal: string; rank: number }> {
  const exists = current.find((item) => item.goal === goal);
  if (exists) return current.filter((item) => item.goal !== goal).map((item, index) => ({ ...item, rank: index + 1 }));
  if (current.length >= 3) return current;
  return [...current, { goal, rank: current.length + 1 }];
}

export function CelexoIntakeForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultCelexoIntake);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const progress = ((step + 1) / CELEXO_INTAKE_STEPS.length) * 100;

  function validateStep() {
    const validator = celexoStepValidators[step];
    const parsed = validator.safeParse(form);
    if (!parsed.success) {
      setError("Please complete the required fields on this step before continuing.");
      return false;
    }
    setError("");
    return true;
  }

  async function submit() {
    if (!validateStep()) return;
    const parsed = celexoIntakeSchema.safeParse(form);
    if (!parsed.success) {
      setError("Please review the form and complete all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/intake/celexo", {
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
      <div className="space-y-6 rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-6 sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f6f3e]">Intake received</p>
        <h2 className="font-serif text-3xl text-[#1f1a15]">Thank you for completing your Celexo intake</h2>
        <p className="text-[#6f6251]">
          Your Korean Exosome Therapy form is with our clinical team. Track updates with your request code:
        </p>
        <p className="font-mono text-lg tracking-[0.12em] text-[#1f1a15]">{referenceId}</p>
        <div className="rounded-sm border border-[#2a2420] bg-[#1a1612] p-5 text-[#f7f1e8]">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#c9a86a]">Microneedling aftercare preview</p>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-[#e8dfd0]">
            <div>
              <p className="text-[#c9a86a]">First 24 hours</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {CELEXO_AFTERCARE_SUMMARY.first24.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[#c9a86a]">Days 1–3</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {CELEXO_AFTERCARE_SUMMARY.days1to3.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[#c9a86a]">Days 4–7</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {CELEXO_AFTERCARE_SUMMARY.days4to7.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/track-intake?referenceId=${encodeURIComponent(referenceId)}&email=${encodeURIComponent(form.patient.email)}`}
            className="inline-flex min-h-[44px] items-center rounded-sm bg-[#8a682e] px-5 text-[11px] tracking-[0.18em] text-white"
          >
            TRACK MY INTAKE
          </Link>
          <Link
            href="/book-online"
            className="inline-flex min-h-[44px] items-center rounded-sm border border-[#b78d4b80] px-5 text-[11px] tracking-[0.18em] text-[#3b3024]"
          >
            BOOK APPOINTMENT
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3 text-xs tracking-[0.16em] text-[#8f6f3e]">
          <span>
            STEP {step + 1} / {CELEXO_INTAKE_STEPS.length}
          </span>
          <span>{CELEXO_INTAKE_STEPS[step]}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#efe4d4]">
          <div className="h-full bg-[#b78d4b] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-5 sm:p-7">
        {step === 0 ? (
          <div className="space-y-4">
            <SectionIntro eyebrow="CELEXO" title="Patient information" description="Please complete all sections prior to your Celexo appointment. All information is strictly confidential." />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <TextInput
                  value={form.patient.fullName}
                  onChange={(value) => setForm((p) => ({ ...p, patient: { ...p.patient, fullName: value } }))}
                />
              </Field>
              <Field label="Date of birth">
                <TextInput
                  type="date"
                  value={form.patient.dateOfBirth}
                  onChange={(value) => setForm((p) => ({ ...p, patient: { ...p.patient, dateOfBirth: value } }))}
                />
              </Field>
              <Field label="Gender">
                <TextInput
                  value={form.patient.gender}
                  onChange={(value) => setForm((p) => ({ ...p, patient: { ...p.patient, gender: value } }))}
                />
              </Field>
              <Field label="Preferred pronouns">
                <TextInput
                  value={form.patient.preferredPronouns}
                  onChange={(value) => setForm((p) => ({ ...p, patient: { ...p.patient, preferredPronouns: value } }))}
                />
              </Field>
              <Field label="Phone">
                <TextInput
                  value={form.patient.phone}
                  onChange={(value) => setForm((p) => ({ ...p, patient: { ...p.patient, phone: value } }))}
                />
              </Field>
              <Field label="Email">
                <TextInput
                  type="email"
                  value={form.patient.email}
                  onChange={(value) => setForm((p) => ({ ...p, patient: { ...p.patient, email: value } }))}
                />
              </Field>
              <Field label="Address">
                <TextInput
                  value={form.patient.address}
                  onChange={(value) => setForm((p) => ({ ...p, patient: { ...p.patient, address: value } }))}
                />
              </Field>
              <Field label="City / State / ZIP">
                <TextInput
                  value={form.patient.cityStateZip}
                  onChange={(value) => setForm((p) => ({ ...p, patient: { ...p.patient, cityStateZip: value } }))}
                />
              </Field>
              <Field label="Referring provider">
                <TextInput
                  value={form.patient.referringProvider}
                  onChange={(value) => setForm((p) => ({ ...p, patient: { ...p.patient, referringProvider: value } }))}
                />
              </Field>
              <Field label="Preferred visit date">
                <TextInput
                  type="date"
                  value={form.patient.visitDate}
                  onChange={(value) => setForm((p) => ({ ...p, patient: { ...p.patient, visitDate: value } }))}
                />
              </Field>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-6">
            <SectionIntro eyebrow="CELEXO" title="Celexo product & treatment selection" description="Powered by ABio Materials Korea — plant-based Centella Exo-Cica and Black Label adipose-derived exosome protocols." />
            <div>
              <p className="text-sm font-medium text-[#3b3024]">Step 1 — Select your Celexo protocol</p>
              <ChoiceGroup
                options={CELEXO_PROTOCOLS}
                value={form.selection.protocol}
                onChange={(value) =>
                  setForm((p) => ({
                    ...p,
                    selection: {
                      ...p.selection,
                      protocol: value as (typeof CELEXO_PROTOCOLS)[number],
                    },
                  }))
                }
              />
              <div className="mt-3 grid gap-3 text-xs leading-relaxed text-[#6f6251] sm:grid-cols-2">
                <p className="rounded-sm border border-[#efe4d4] bg-white p-3">
                  <strong className="text-[#3b3024]">Plant-Based:</strong> sensitive/reactive skin, pigmentation,
                  redness, first-time clients, brightening & barrier restoration.
                </p>
                <p className="rounded-sm border border-[#efe4d4] bg-white p-3">
                  <strong className="text-[#3b3024]">Black Label:</strong> deeper regeneration, hair restoration,
                  collagen stimulation, advanced rejuvenation.
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[#3b3024]">Step 2 — Delivery method</p>
              <ChoiceGroup
                options={CELEXO_DELIVERY_METHODS}
                value={form.selection.deliveryMethod}
                onChange={(value) =>
                  setForm((p) => ({
                    ...p,
                    selection: {
                      ...p.selection,
                      deliveryMethod: value as (typeof CELEXO_DELIVERY_METHODS)[number],
                    },
                  }))
                }
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#3b3024]">Step 3 — Treatment area(s)</p>
              <CheckboxGroup
                options={CELEXO_TREATMENT_AREAS}
                selected={form.selection.treatmentAreas}
                onChange={(treatmentAreas) =>
                  setForm((p) => ({ ...p, selection: { ...p.selection, treatmentAreas } }))
                }
              />
              <div className="mt-3">
                <Field label="Other treatment area(s)">
                  <TextInput
                    value={form.selection.otherTreatmentArea}
                    onChange={(value) =>
                      setForm((p) => ({ ...p, selection: { ...p.selection, otherTreatmentArea: value } }))
                    }
                  />
                </Field>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[#3b3024]">Primary goals (select up to 3 — order ranks automatically)</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {CELEXO_GOAL_OPTIONS.map((goal) => {
                  const selected = form.selection.primaryGoals.find((item) => item.goal === goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          selection: {
                            ...p.selection,
                            primaryGoals: toggleGoal(p.selection.primaryGoals, goal),
                          },
                        }))
                      }
                      className={`rounded-sm border px-3 py-2.5 text-left text-sm ${
                        selected
                          ? "border-[#b78d4b] bg-[#fff6e8] text-[#3b3024]"
                          : "border-[#b78d4b2d] bg-white text-[#5f5344]"
                      }`}
                    >
                      {selected ? `${selected.rank}. ` : ""}
                      {goal}
                    </button>
                  );
                })}
              </div>
              {form.selection.primaryGoals.some((g) => g.goal === "Other") ? (
                <div className="mt-3">
                  <Field label="Describe other goal">
                    <TextInput
                      value={form.selection.otherGoal}
                      onChange={(value) =>
                        setForm((p) => ({ ...p, selection: { ...p.selection, otherGoal: value } }))
                      }
                    />
                  </Field>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <SectionIntro eyebrow="CELEXO" title="Skin profile & history" description="Help us tailor depth, product choice, and downtime expectations." />
            <div>
              <p className="text-sm font-medium text-[#3b3024]">Skin type</p>
              <ChoiceGroup
                options={CELEXO_SKIN_TYPES}
                value={form.skin.skinType}
                onChange={(skinType) => setForm((p) => ({ ...p, skin: { ...p.skin, skinType } }))}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#3b3024]">Fitzpatrick type</p>
              <ChoiceGroup
                options={CELEXO_FITZPATRICK}
                value={form.skin.fitzpatrick}
                onChange={(fitzpatrick) => setForm((p) => ({ ...p, skin: { ...p.skin, fitzpatrick } }))}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#3b3024]">Primary concern</p>
              <ChoiceGroup
                options={CELEXO_PRIMARY_CONCERNS}
                value={form.skin.primaryConcern}
                onChange={(primaryConcern) => setForm((p) => ({ ...p, skin: { ...p.skin, primaryConcern } }))}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#3b3024]">Current regimen</p>
              <ChoiceGroup
                options={CELEXO_REGIMENS}
                value={form.skin.currentRegimen}
                onChange={(currentRegimen) => setForm((p) => ({ ...p, skin: { ...p.skin, currentRegimen } }))}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#3b3024]">Active skin conditions</p>
              <CheckboxGroup
                options={CELEXO_ACTIVE_CONDITIONS}
                selected={form.skin.activeConditions}
                exclusiveOption="None / Other"
                onChange={(activeConditions) => setForm((p) => ({ ...p, skin: { ...p.skin, activeConditions } }))}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#3b3024]">Recent treatments (within 30 days)</p>
              <CheckboxGroup
                options={CELEXO_RECENT_TREATMENTS}
                selected={form.skin.recentTreatments}
                exclusiveOption="None"
                onChange={(recentTreatments) => setForm((p) => ({ ...p, skin: { ...p.skin, recentTreatments } }))}
              />
              <div className="mt-3">
                <Field label="Details / date of last treatment">
                  <TextArea
                    value={form.skin.recentTreatmentDetails}
                    onChange={(value) => setForm((p) => ({ ...p, skin: { ...p.skin, recentTreatmentDetails: value } }))}
                    rows={3}
                  />
                </Field>
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <SectionIntro eyebrow="CELEXO" title="Medical history & medications" description="Relevant conditions and current prescriptions help keep your protocol safe." />
            <div>
              <p className="text-sm font-medium text-[#3b3024]">Relevant medical conditions</p>
              <CheckboxGroup
                options={CELEXO_MEDICAL_CONDITIONS}
                selected={form.medical.conditions}
                exclusiveOption="None of the above"
                onChange={(conditions) => setForm((p) => ({ ...p, medical: { ...p.medical, conditions } }))}
              />
            </div>
            <Field label="Other conditions">
              <TextArea
                value={form.medical.otherConditions}
                onChange={(value) => setForm((p) => ({ ...p, medical: { ...p.medical, otherConditions: value } }))}
              />
            </Field>
            <Field label="Current medications & topical prescriptions" hint="Include dose / frequency / purpose when known.">
              <TextArea
                value={form.medical.medications}
                onChange={(value) => setForm((p) => ({ ...p, medical: { ...p.medical, medications: value } }))}
                rows={5}
              />
            </Field>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-5">
            <SectionIntro eyebrow="CELEXO" title="Allergies & contraindication screening" description="Answer every screening question. Add details when you select Yes." />
            <div>
              <p className="text-sm font-medium text-[#3b3024]">Known allergies</p>
              <CheckboxGroup
                options={CELEXO_ALLERGIES}
                selected={form.allergies.items}
                exclusiveOption="None Known"
                onChange={(items) => setForm((p) => ({ ...p, allergies: { ...p.allergies, items } }))}
              />
              <div className="mt-3">
                <Field label="Specify allergens">
                  <TextInput
                    value={form.allergies.specify}
                    onChange={(value) => setForm((p) => ({ ...p, allergies: { ...p.allergies, specify: value } }))}
                  />
                </Field>
              </div>
            </div>
            <div className="space-y-4">
              {CELEXO_SCREENING_QUESTIONS.map((q) => {
                const row = form.allergies.screening[q.key] ?? { answer: "", details: "" };
                return (
                  <div key={q.key} className="rounded-sm border border-[#efe4d4] bg-white p-4">
                    <p className="text-sm text-[#3b3024]">{q.label}</p>
                    <div className="mt-3 flex gap-2">
                      {(["yes", "no"] as const).map((answer) => (
                        <button
                          key={answer}
                          type="button"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              allergies: {
                                ...p.allergies,
                                screening: {
                                  ...p.allergies.screening,
                                  [q.key]: { ...row, answer },
                                },
                              },
                            }))
                          }
                          className={`rounded-sm border px-4 py-2 text-xs uppercase tracking-[0.14em] ${
                            row.answer === answer
                              ? "border-[#b78d4b] bg-[#fff6e8] text-[#3b3024]"
                              : "border-[#e4d9c8] text-[#6f6251]"
                          }`}
                        >
                          {answer}
                        </button>
                      ))}
                    </div>
                    {row.answer === "yes" && q.key !== "firstMicroneedling" ? (
                      <div className="mt-3">
                        <Field label="Details">
                          <TextInput
                            value={row.details}
                            onChange={(details) =>
                              setForm((p) => ({
                                ...p,
                                allergies: {
                                  ...p.allergies,
                                  screening: {
                                    ...p.allergies.screening,
                                    [q.key]: { ...row, details },
                                  },
                                },
                              }))
                            }
                          />
                        </Field>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-5">
            <SectionIntro eyebrow="CELEXO" title="Lifestyle & wellness" description="These details support recovery planning and home-care recommendations." />
            {(
              [
                ["sunExposure", "Sun exposure", CELEXO_SUN_EXPOSURE],
                ["spfUse", "SPF use", CELEXO_SPF],
                ["diet", "Diet / nutrition", CELEXO_DIET],
                ["waterIntake", "Water intake", CELEXO_WATER],
                ["stressLevel", "Stress level", CELEXO_STRESS],
                ["sleepQuality", "Sleep quality", CELEXO_SLEEP],
                ["exercise", "Exercise", CELEXO_EXERCISE],
                ["smoking", "Smoking / vaping", CELEXO_SMOKING],
                ["alcohol", "Alcohol use", CELEXO_ALCOHOL],
              ] as const
            ).map(([key, label, options]) => (
              <div key={key}>
                <p className="text-sm font-medium text-[#3b3024]">{label}</p>
                <ChoiceGroup
                  options={options}
                  value={form.lifestyle[key]}
                  onChange={(value) => setForm((p) => ({ ...p, lifestyle: { ...p.lifestyle, [key]: value } }))}
                />
              </div>
            ))}
            <Field label="Supplements or skincare actives currently in use" hint="e.g. Vitamin C, retinol, AHA/BHA, peptides, collagen, NAD+">
              <TextArea
                value={form.lifestyle.supplementsActives}
                onChange={(value) =>
                  setForm((p) => ({ ...p, lifestyle: { ...p.lifestyle, supplementsActives: value } }))
                }
              />
            </Field>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="space-y-5">
            <SectionIntro eyebrow="CELEXO" title="Informed consent & authorization" description="Celexo plant-derived and Celexo Black Label human ASCE-derived exosomes are advanced biotechnology products by ABio Materials, Korea. Individual results vary. Treatments are administered by or under the supervision of qualified wellness professionals." />
            <div className="space-y-3 rounded-sm border border-[#f0d4d4] bg-[#fff8f6] p-4 text-sm leading-relaxed text-[#6f5230]">
              <p className="font-medium uppercase tracking-[0.14em]">Important disclaimer — exosome source</p>
              <p>
                Plant-based Celexo does not contain human, animal, or blood-derived material. Black Label originates from
                human adipose stem cells and is screened to applicable biosafety standards. These products have not been
                evaluated by the FDA to diagnose, cure, treat, or prevent disease.
              </p>
            </div>
            <CheckboxGroup
              options={CELEXO_CONSENT_STATEMENTS}
              selected={form.consent.acknowledgments}
              onChange={(acknowledgments) => setForm((p) => ({ ...p, consent: { ...p.consent, acknowledgments } }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Printed full name">
                <TextInput
                  value={form.consent.printedName}
                  onChange={(value) => setForm((p) => ({ ...p, consent: { ...p.consent, printedName: value } }))}
                />
              </Field>
              <Field label="Signature date">
                <TextInput
                  type="date"
                  value={form.consent.signatureDate}
                  onChange={(value) => setForm((p) => ({ ...p, consent: { ...p.consent, signatureDate: value } }))}
                />
              </Field>
              <Field label="Parent / guardian (if applicable)">
                <TextInput
                  value={form.consent.guardianName}
                  onChange={(value) => setForm((p) => ({ ...p, consent: { ...p.consent, guardianName: value } }))}
                />
              </Field>
              <Field label="Relationship">
                <TextInput
                  value={form.consent.guardianRelationship}
                  onChange={(value) =>
                    setForm((p) => ({ ...p, consent: { ...p.consent, guardianRelationship: value } }))
                  }
                />
              </Field>
            </div>
            <SignaturePad
              value={form.consent.signatureDataUrl || null}
              onChange={(dataUrl) =>
                setForm((p) => ({ ...p, consent: { ...p.consent, signatureDataUrl: dataUrl || "" } }))
              }
              label="Patient signature"
            />
          </div>
        ) : null}

        {error ? <p className="mt-5 text-sm text-red-700">{error}</p> : null}

        <div className="mt-7 flex flex-wrap gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep((value) => Math.max(0, value - 1));
              }}
              className="inline-flex min-h-[44px] items-center rounded-sm border border-[#b78d4b80] px-5 text-[11px] tracking-[0.18em] text-[#3b3024]"
            >
              BACK
            </button>
          ) : null}
          {step < CELEXO_INTAKE_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (!validateStep()) return;
                setStep((value) => Math.min(CELEXO_INTAKE_STEPS.length - 1, value + 1));
              }}
              className="inline-flex min-h-[44px] items-center rounded-sm bg-[#8a682e] px-5 text-[11px] tracking-[0.18em] text-white"
            >
              CONTINUE
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submit()}
              className="inline-flex min-h-[44px] items-center rounded-sm bg-[#8a682e] px-5 text-[11px] tracking-[0.18em] text-white disabled:opacity-60"
            >
              {submitting ? "SUBMITTING…" : "SUBMIT CELEXO INTAKE"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
