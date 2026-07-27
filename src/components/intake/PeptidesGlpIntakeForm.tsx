"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckboxGroup,
  Field,
  SectionIntro,
  TextArea,
  TextInput,
  YesNoField,
} from "@/components/intake/intake-field-kit";
import {
  ACKNOWLEDGMENT_STATEMENTS,
  ACTIVITY_FREQUENCY_OPTIONS,
  CONTRAINDICATION_OPTIONS,
  DIET_TYPE_OPTIONS,
  EATING_PATTERN_OPTIONS,
  FAMILY_HISTORY_OPTIONS,
  INTAKE_STEPS,
  MEDICAL_CONDITION_OPTIONS,
  PREVIOUS_THERAPY_OPTIONS,
  PREVIOUS_WEIGHT_LOSS_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  PROGRAM_OPTIONS,
  RECENT_LAB_OPTIONS,
  REFERRAL_SOURCE_OPTIONS,
  SMOKING_STATUS_OPTIONS,
  STRESS_LEVEL_OPTIONS,
  SYMPTOM_OPTIONS,
  WEIGHT_STRUGGLE_OPTIONS,
  WOMENS_HEALTH_OPTIONS,
} from "@/lib/intake/peptides-glp-options";
import {
  defaultPeptidesGlpIntake,
  peptidesGlpIntakeSchema,
  peptidesGlpStepValidators,
  type PeptidesGlpIntakeFormData,
} from "@/lib/intake/peptides-glp-schema";

export function PeptidesGlpIntakeForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PeptidesGlpIntakeFormData>(defaultPeptidesGlpIntake);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const currentStep = INTAKE_STEPS[step];
  const progress = ((step + 1) / INTAKE_STEPS.length) * 100;

  const update = <K extends keyof PeptidesGlpIntakeFormData>(key: K, value: PeptidesGlpIntakeFormData[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const validateStep = () => {
    const validator = peptidesGlpStepValidators[step];
    const parsed = validator.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      setError("Please complete the required fields on this step before continuing.");
      return false;
    }
    setFieldErrors({});
    setError("");
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((value) => Math.min(value + 1, INTAKE_STEPS.length - 1));
  };

  const goBack = () => {
    setError("");
    setFieldErrors({});
    setStep((value) => Math.max(value - 1, 0));
  };

  const submit = async () => {
    if (!validateStep()) return;
    const parsed = peptidesGlpIntakeSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      setError("Please review the form and complete all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/intake/peptides-glp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = (await response.json()) as { error?: string; referenceId?: string };
      if (!response.ok) {
        setError(payload.error ?? "Submission failed. Please try again or contact concierge.");
        return;
      }
      setReferenceId(payload.referenceId ?? null);
      setStep(INTAKE_STEPS.length);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const bmiPreview = useMemo(() => {
    const heightIn = Number(form.patient.height);
    const weightLb = Number(form.patient.weight);
    if (!heightIn || !weightLb) return "";
    const bmi = (703 * weightLb) / (heightIn * heightIn);
    return Number.isFinite(bmi) ? bmi.toFixed(1) : "";
  }, [form.patient.height, form.patient.weight]);

  if (referenceId) {
    return (
      <div className="rounded-sm border border-[#1f7a7a4f] bg-[#eef8f8] p-8 text-center">
        <p className="text-xs tracking-[0.2em] text-[#1b6568]">INTAKE RECEIVED</p>
        <h2 className="mt-3 text-3xl text-[#1f1a15]">Thank you</h2>
        <p className="mx-auto mt-4 max-w-2xl text-[#28585a]">
          Your Comprehensive Therapeutics Intake has been securely submitted. A KIAN Privé clinician will review your
          information and contact you regarding approval and next steps.
        </p>
        <p className="mt-4 text-sm text-[#1b6568]">
          Reference ID: <strong>{referenceId}</strong>
        </p>
        <p className="mx-auto mt-4 max-w-xl text-xs text-[#3d6d6f]">
          A confirmation has been sent to {form.patient.email}. This form is confidential and protected under HIPAA
          guidelines.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/services/glp1-peptides" className="rounded-sm bg-[#8a682e] px-5 py-2 text-sm text-white">
            Back to Compound Therapy
          </Link>
          <Link href="/book-online" className="rounded-sm border border-[#1f7a7a55] bg-white px-5 py-2 text-sm text-[#28585a]">
            Book Online
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-[#b78d4b2d] bg-white p-6 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] sm:p-8">
      <div className="mb-6">
        <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">SECURE CLINICAL INTAKE</p>
        <h1 className="mt-2 text-3xl text-[#1f1a15] md:text-4xl">Comprehensive Therapeutics Intake</h1>
        <p className="mt-3 max-w-3xl text-sm text-[#6f6251]">
          Peptide Therapy • GLP-1 / GLP-2 / GLP-3 Receptor Agonist Therapy. This form is strictly confidential and
          protected under HIPAA guidelines. Information is transmitted securely to KIAN Privé operations and your
          reviewing clinician only.
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f1e7d7]">
          <div className="h-full rounded-sm bg-[#b78d4b] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-[#8f6f3e]">
          Step {step + 1} of {INTAKE_STEPS.length}: {currentStep.title}
        </p>
      </div>

      {step === 0 ? (
        <div className="space-y-6">
          <SectionIntro eyebrow="SECTION 01" title="Patient Information" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full Name *">
              <TextInput value={form.patient.fullName} onChange={(v) => update("patient", { ...form.patient, fullName: v })} required />
            </Field>
            <Field label="Date of Birth *">
              <TextInput type="date" value={form.patient.dateOfBirth} onChange={(v) => update("patient", { ...form.patient, dateOfBirth: v })} required />
            </Field>
            <Field label="Age *">
              <TextInput value={form.patient.age} onChange={(v) => update("patient", { ...form.patient, age: v })} required />
            </Field>
            <Field label="Height (inches) *">
              <TextInput value={form.patient.height} onChange={(v) => update("patient", { ...form.patient, height: v, bmi: bmiPreview })} required />
            </Field>
            <Field label="Weight (lbs) *">
              <TextInput value={form.patient.weight} onChange={(v) => update("patient", { ...form.patient, weight: v, bmi: bmiPreview })} required />
            </Field>
            <Field label="BMI">
              <TextInput value={form.patient.bmi || bmiPreview} onChange={(v) => update("patient", { ...form.patient, bmi: v })} />
            </Field>
            <Field label="Sex at Birth *">
              <select
                value={form.patient.sexAtBirth}
                onChange={(e) => update("patient", { ...form.patient, sexAtBirth: e.target.value as "Male" | "Female" })}
                className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] px-3 py-2.5 text-sm"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </Field>
            <Field label="Gender Identity (optional)">
              <TextInput value={form.patient.genderIdentity} onChange={(v) => update("patient", { ...form.patient, genderIdentity: v })} />
            </Field>
            <Field label="Phone *">
              <TextInput type="tel" value={form.patient.phone} onChange={(v) => update("patient", { ...form.patient, phone: v })} required />
            </Field>
            <Field label="Email *">
              <TextInput type="email" value={form.patient.email} onChange={(v) => update("patient", { ...form.patient, email: v })} required />
            </Field>
            <Field label="Primary Care Physician">
              <TextInput value={form.patient.primaryCarePhysician} onChange={(v) => update("patient", { ...form.patient, primaryCarePhysician: v })} />
            </Field>
            <Field label="Referring Physician (if any)">
              <TextInput value={form.patient.referringPhysician} onChange={(v) => update("patient", { ...form.patient, referringPhysician: v })} />
            </Field>
            <Field label="Date of First Appointment">
              <TextInput type="date" value={form.patient.firstAppointmentDate} onChange={(v) => update("patient", { ...form.patient, firstAppointmentDate: v })} />
            </Field>
          </div>
          <SectionIntro eyebrow="SECTION 02" title="Program of Interest" description="Select all programs you wish to explore with your KIAN Privé clinician." />
          <CheckboxGroup options={PROGRAM_OPTIONS} selected={form.programs} onChange={(programs) => update("programs", programs)} />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-6">
          <SectionIntro eyebrow="SECTION 03" title="Treatment Goals & Aspirations" />
          <Field label="Primary goals for therapy *">
            <CheckboxGroup options={PRIMARY_GOAL_OPTIONS} selected={form.goals.primaryGoals} onChange={(primaryGoals) => update("goals", { ...form.goals, primaryGoals })} />
          </Field>
          <Field label="Other goal (if selected)">
            <TextInput value={form.goals.otherGoal} onChange={(v) => update("goals", { ...form.goals, otherGoal: v })} />
          </Field>
          <Field label="Desired goal weight (if applicable)">
            <TextInput value={form.goals.desiredGoalWeight} onChange={(v) => update("goals", { ...form.goals, desiredGoalWeight: v })} />
          </Field>
          <Field label="Specific aesthetic or wellness outcomes you hope to achieve">
            <TextArea value={form.goals.aestheticOutcomes} onChange={(v) => update("goals", { ...form.goals, aestheticOutcomes: v })} />
          </Field>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-6">
          <SectionIntro eyebrow="SECTION 04" title="Weight & Metabolic History" />
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Current Weight"><TextInput value={form.weightHistory.currentWeight} onChange={(v) => update("weightHistory", { ...form.weightHistory, currentWeight: v })} /></Field>
            <Field label="Highest Adult Weight"><TextInput value={form.weightHistory.highestAdultWeight} onChange={(v) => update("weightHistory", { ...form.weightHistory, highestAdultWeight: v })} /></Field>
            <Field label="Lowest Adult Weight"><TextInput value={form.weightHistory.lowestAdultWeight} onChange={(v) => update("weightHistory", { ...form.weightHistory, lowestAdultWeight: v })} /></Field>
          </div>
          <Field label="How long have you struggled with your weight?">
            <select value={form.weightHistory.struggleDuration} onChange={(e) => update("weightHistory", { ...form.weightHistory, struggleDuration: e.target.value })} className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] px-3 py-2.5 text-sm">
              <option value="">Select one</option>
              {WEIGHT_STRUGGLE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Previous weight-loss approaches">
            <CheckboxGroup options={PREVIOUS_WEIGHT_LOSS_OPTIONS} selected={form.weightHistory.previousApproaches} onChange={(previousApproaches) => update("weightHistory", { ...form.weightHistory, previousApproaches })} />
          </Field>
          <Field label="Previous peptide / GLP therapies used">
            <CheckboxGroup
              options={PREVIOUS_THERAPY_OPTIONS}
              selected={form.weightHistory.previousTherapies.map((item) => item.therapy)}
              onChange={(selected) =>
                update("weightHistory", {
                  ...form.weightHistory,
                  previousTherapies: selected.map((therapy) => form.weightHistory.previousTherapies.find((item) => item.therapy === therapy) ?? { therapy, dose: "", duration: "", reasonStopped: "", sideEffects: "" }),
                })
              }
            />
          </Field>
          {form.weightHistory.previousTherapies.map((entry, index) => (
            <div key={entry.therapy} className="rounded-sm border border-[#b78d4b2d] bg-[#fffaf2] p-4">
              <p className="text-sm font-medium text-[#3b3024]">{entry.therapy}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Field label="Dose"><TextInput value={entry.dose} onChange={(v) => { const next = [...form.weightHistory.previousTherapies]; next[index] = { ...entry, dose: v }; update("weightHistory", { ...form.weightHistory, previousTherapies: next }); }} /></Field>
                <Field label="Duration"><TextInput value={entry.duration} onChange={(v) => { const next = [...form.weightHistory.previousTherapies]; next[index] = { ...entry, duration: v }; update("weightHistory", { ...form.weightHistory, previousTherapies: next }); }} /></Field>
                <Field label="Reason stopped"><TextInput value={entry.reasonStopped} onChange={(v) => { const next = [...form.weightHistory.previousTherapies]; next[index] = { ...entry, reasonStopped: v }; update("weightHistory", { ...form.weightHistory, previousTherapies: next }); }} /></Field>
                <Field label="Side effects"><TextInput value={entry.sideEffects} onChange={(v) => { const next = [...form.weightHistory.previousTherapies]; next[index] = { ...entry, sideEffects: v }; update("weightHistory", { ...form.weightHistory, previousTherapies: next }); }} /></Field>
              </div>
            </div>
          ))}
          <Field label="Describe your experience with prior treatments">
            <TextArea value={form.weightHistory.previousTherapyExperience} onChange={(v) => update("weightHistory", { ...form.weightHistory, previousTherapyExperience: v })} />
          </Field>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-6">
          <SectionIntro eyebrow="SECTION 05" title="Medical History" />
          <CheckboxGroup options={MEDICAL_CONDITION_OPTIONS} selected={form.medicalHistory.conditions} onChange={(conditions) => update("medicalHistory", { ...form.medicalHistory, conditions })} />
          <Field label="Hormonal disorder details (if applicable)"><TextInput value={form.medicalHistory.hormonalDisorderDetail} onChange={(v) => update("medicalHistory", { ...form.medicalHistory, hormonalDisorderDetail: v })} /></Field>
          <YesNoField label="Other pre-existing medical conditions not listed?" value={form.medicalHistory.otherConditions} onChange={(otherConditions) => update("medicalHistory", { ...form.medicalHistory, otherConditions })} />
          {form.medicalHistory.otherConditions === "yes" ? <Field label="Please specify"><TextArea value={form.medicalHistory.otherConditionsDetail} onChange={(v) => update("medicalHistory", { ...form.medicalHistory, otherConditionsDetail: v })} /></Field> : null}
          <YesNoField label="Surgical procedures in the past 12 months?" value={form.medicalHistory.recentSurgery} onChange={(recentSurgery) => update("medicalHistory", { ...form.medicalHistory, recentSurgery })} />
          {form.medicalHistory.recentSurgery === "yes" ? <Field label="Please specify"><TextArea value={form.medicalHistory.recentSurgeryDetail} onChange={(v) => update("medicalHistory", { ...form.medicalHistory, recentSurgeryDetail: v })} /></Field> : null}
          <YesNoField label="Currently pregnant, breastfeeding, or planning pregnancy?" value={form.medicalHistory.pregnantBreastfeedingPlanning} onChange={(pregnantBreastfeedingPlanning) => update("medicalHistory", { ...form.medicalHistory, pregnantBreastfeedingPlanning })} />
          <SectionIntro eyebrow="SECTION 06" title="Contraindications & Safety Screening" />
          <CheckboxGroup options={CONTRAINDICATION_OPTIONS} selected={form.contraindications.items} exclusiveOption="None of the above" onChange={(items) => update("contraindications", { ...form.contraindications, items })} />
          <YesNoField label="Allergic reaction to medication, supplement, or peptide?" value={form.contraindications.medicationAllergy} onChange={(medicationAllergy) => update("contraindications", { ...form.contraindications, medicationAllergy })} />
          {form.contraindications.medicationAllergy === "yes" ? <Field label="Substance and reaction"><TextArea value={form.contraindications.medicationAllergyDetail} onChange={(v) => update("contraindications", { ...form.contraindications, medicationAllergyDetail: v })} /></Field> : null}
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-6">
          <SectionIntro eyebrow="SECTION 07" title="Family History" />
          <CheckboxGroup options={FAMILY_HISTORY_OPTIONS} selected={form.familyHistory} exclusiveOption="None of the above" onChange={(familyHistory) => update("familyHistory", familyHistory)} />
          <SectionIntro eyebrow="SECTION 08" title="Current Medications, Supplements & Allergies" />
          <Field label="Prescription medications"><TextArea value={form.medications.prescriptions} onChange={(v) => update("medications", { ...form.medications, prescriptions: v })} /></Field>
          <Field label="Supplements"><TextArea value={form.medications.supplements} onChange={(v) => update("medications", { ...form.medications, supplements: v })} /></Field>
          <Field label="Peptides currently in use"><TextArea value={form.medications.peptidesInUse} onChange={(v) => update("medications", { ...form.medications, peptidesInUse: v })} /></Field>
          <Field label="Hormones / hormone replacement therapy"><TextArea value={form.medications.hormones} onChange={(v) => update("medications", { ...form.medications, hormones: v })} /></Field>
          <Field label="Medication allergies"><TextArea value={form.medications.medicationAllergies} onChange={(v) => update("medications", { ...form.medications, medicationAllergies: v })} /></Field>
          <Field label="Food allergies"><TextArea value={form.medications.foodAllergies} onChange={(v) => update("medications", { ...form.medications, foodAllergies: v })} /></Field>
          <Field label="Other allergies"><TextArea value={form.medications.otherAllergies} onChange={(v) => update("medications", { ...form.medications, otherAllergies: v })} /></Field>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-6">
          <SectionIntro eyebrow="SECTION 09" title="Lifestyle & Wellness Profile" />
          <Field label="Physical activity frequency">
            <select value={form.lifestyle.activityFrequency} onChange={(e) => update("lifestyle", { ...form.lifestyle, activityFrequency: e.target.value })} className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] px-3 py-2.5 text-sm">
              <option value="">Select one</option>
              {ACTIVITY_FREQUENCY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Average daily steps"><TextInput value={form.lifestyle.averageDailySteps} onChange={(v) => update("lifestyle", { ...form.lifestyle, averageDailySteps: v })} /></Field>
            <Field label="Average sleep (hours/night)"><TextInput value={form.lifestyle.averageSleepHours} onChange={(v) => update("lifestyle", { ...form.lifestyle, averageSleepHours: v })} /></Field>
          </div>
          <Field label="Typical diet">
            <select value={form.lifestyle.dietType} onChange={(e) => update("lifestyle", { ...form.lifestyle, dietType: e.target.value })} className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] px-3 py-2.5 text-sm">
              <option value="">Select one</option>
              {DIET_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          {form.lifestyle.dietType === "Other" ? <Field label="Other diet"><TextInput value={form.lifestyle.otherDiet} onChange={(v) => update("lifestyle", { ...form.lifestyle, otherDiet: v })} /></Field> : null}
          <YesNoField label="Follow a specific skincare or wellness routine?" value={form.lifestyle.skincareRoutine} onChange={(skincareRoutine) => update("lifestyle", { ...form.lifestyle, skincareRoutine })} />
          {form.lifestyle.skincareRoutine === "yes" ? <Field label="Describe routine"><TextArea value={form.lifestyle.skincareRoutineDetail} onChange={(v) => update("lifestyle", { ...form.lifestyle, skincareRoutineDetail: v })} /></Field> : null}
          <YesNoField label="Consume alcohol or use recreational substances?" value={form.lifestyle.alcoholOrSubstances} onChange={(alcoholOrSubstances) => update("lifestyle", { ...form.lifestyle, alcoholOrSubstances })} />
          {form.lifestyle.alcoholOrSubstances === "yes" ? <Field label="Frequency and type"><TextArea value={form.lifestyle.alcoholOrSubstancesDetail} onChange={(v) => update("lifestyle", { ...form.lifestyle, alcoholOrSubstancesDetail: v })} /></Field> : null}
          <Field label="Smoking status"><CheckboxGroup options={SMOKING_STATUS_OPTIONS} selected={form.lifestyle.smokingStatus} onChange={(smokingStatus) => update("lifestyle", { ...form.lifestyle, smokingStatus })} /></Field>
          <Field label="Current stress level">
            <select value={form.lifestyle.stressLevel} onChange={(e) => update("lifestyle", { ...form.lifestyle, stressLevel: e.target.value })} className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] px-3 py-2.5 text-sm">
              <option value="">Select one</option>
              {STRESS_LEVEL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <SectionIntro eyebrow="SECTION 10" title="Nutrition Profile" />
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Meals per day"><TextInput value={form.nutrition.mealsPerDay} onChange={(v) => update("nutrition", { ...form.nutrition, mealsPerDay: v })} /></Field>
            <Field label="Water intake (oz/day)"><TextInput value={form.nutrition.waterIntakeOz} onChange={(v) => update("nutrition", { ...form.nutrition, waterIntakeOz: v })} /></Field>
            <Field label="Protein intake (g/day)"><TextInput value={form.nutrition.proteinIntakeG} onChange={(v) => update("nutrition", { ...form.nutrition, proteinIntakeG: v })} /></Field>
          </div>
          <CheckboxGroup options={EATING_PATTERN_OPTIONS} selected={form.nutrition.eatingPatterns} exclusiveOption="None of the above" onChange={(eatingPatterns) => update("nutrition", { ...form.nutrition, eatingPatterns })} />
          <SectionIntro eyebrow="SECTION 11" title="Women's Health (if applicable)" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Last menstrual period"><TextInput value={form.womensHealth.lastMenstrualPeriod} onChange={(v) => update("womensHealth", { ...form.womensHealth, lastMenstrualPeriod: v })} /></Field>
            <Field label="Birth control method"><TextInput value={form.womensHealth.birthControlMethod} onChange={(v) => update("womensHealth", { ...form.womensHealth, birthControlMethod: v })} /></Field>
          </div>
          <CheckboxGroup options={WOMENS_HEALTH_OPTIONS} selected={form.womensHealth.selections} exclusiveOption="None of the above" onChange={(selections) => update("womensHealth", { ...form.womensHealth, selections })} />
        </div>
      ) : null}

      {step === 6 ? (
        <div className="space-y-6">
          <SectionIntro eyebrow="SECTION 12" title="Laboratory History" description="KIAN Privé may order a baseline panel prior to initiating therapy." />
          <CheckboxGroup options={RECENT_LAB_OPTIONS} selected={form.labs.recentLabs} exclusiveOption="None on file" onChange={(recentLabs) => update("labs", { recentLabs })} />
          <SectionIntro eyebrow="SECTION 13" title="Symptoms Checklist" />
          <CheckboxGroup options={SYMPTOM_OPTIONS} selected={form.symptoms} exclusiveOption="None of the above" onChange={(symptoms) => update("symptoms", symptoms)} />
        </div>
      ) : null}

      {step === 7 ? (
        <div className="space-y-6">
          <SectionIntro eyebrow="SECTION 14" title="Patient Expectations & Acknowledgments" description="Initial each statement to confirm your understanding." />
          <div className="space-y-3">
            {ACKNOWLEDGMENT_STATEMENTS.map((statement, index) => (
              <div key={statement} className="rounded-sm border border-[#b78d4b2d] bg-[#fffaf2] p-4">
                <p className="text-sm text-[#4f4335]">{statement}</p>
                <Field label="Initial *">
                  <TextInput
                    value={form.acknowledgments.initials[String(index)] ?? ""}
                    onChange={(v) =>
                      update("acknowledgments", {
                        initials: { ...form.acknowledgments.initials, [String(index)]: v },
                      })
                    }
                  />
                </Field>
              </div>
            ))}
          </div>
          <SectionIntro eyebrow="SECTION 15" title="Informed Consent, Safety Disclosure & Attestation" />
          <div className="rounded-sm border border-[#1f7a7a42] bg-[#eef8f8] p-4 text-sm text-[#28585a]">
            <p>
              Your clinician has discussed potential side effects including nausea, vomiting, constipation, diarrhea,
              gallbladder disease, pancreatitis, dehydration, hypoglycemia, possible muscle loss, and rare allergic
              reactions.
            </p>
          </div>
          <label className="flex items-start gap-3 text-sm text-[#4f4335]">
            <input type="checkbox" checked={form.consent.informedSafetyDiscussed} onChange={(e) => update("consent", { ...form.consent, informedSafetyDiscussed: e.target.checked ? true : (false as never) })} className="mt-1" />
            <span>I acknowledge review of informed safety screening information. *</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-[#4f4335]">
            <input type="checkbox" checked={form.consent.telemedicineAttestation} onChange={(e) => update("consent", { ...form.consent, telemedicineAttestation: e.target.checked ? true : (false as never) })} className="mt-1" />
            <span>
              Telemedicine attestation: I certify that the information provided is accurate and complete, I understand
              telemedicine limitations, and I authorize KIAN Privé to request relevant outside medical records. *
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-[#4f4335]">
            <input type="checkbox" checked={form.consent.informedConsent} onChange={(e) => update("consent", { ...form.consent, informedConsent: e.target.checked ? true : (false as never) })} className="mt-1" />
            <span>
              Informed consent: I confirm this information is accurate and consent to consultation with a KIAN Privé
              clinician for peptide and/or GLP receptor agonist therapy. *
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-[#4f4335]">
            <input type="checkbox" checked={form.consent.hipaaPrivacyAcknowledged} onChange={(e) => update("consent", { ...form.consent, hipaaPrivacyAcknowledged: e.target.checked ? true : (false as never) })} className="mt-1" />
            <span>
              I understand this form is strictly confidential and protected under HIPAA. KIAN Privé will use this
              information solely to personalize my care plan. *
            </span>
          </label>
          <Field label="How did you hear about KIAN Privé? *">
            <select value={form.consent.referralSource} onChange={(e) => update("consent", { ...form.consent, referralSource: e.target.value })} className="mt-1 w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] px-3 py-2.5 text-sm">
              <option value="">Select one</option>
              {REFERRAL_SOURCE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          {form.consent.referralSource === "Other" ? <Field label="Please specify"><TextInput value={form.consent.referralOther} onChange={(v) => update("consent", { ...form.consent, referralOther: v })} /></Field> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Client signature (type full legal name) *"><TextInput value={form.consent.clientSignature} onChange={(v) => update("consent", { ...form.consent, clientSignature: v })} /></Field>
            <Field label="Printed name *"><TextInput value={form.consent.printedName} onChange={(v) => update("consent", { ...form.consent, printedName: v })} /></Field>
            <Field label="Signature date *"><TextInput type="date" value={form.consent.signatureDate} onChange={(v) => update("consent", { ...form.consent, signatureDate: v })} /></Field>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-sm border border-[#b4231840] bg-[#fff5f5] px-4 py-3 text-sm text-[#8f2d2d]">{error}</p> : null}
      {Object.keys(fieldErrors).length ? (
        <p className="mt-2 text-xs text-[#8f2d2d]">Some required fields need attention on this step.</p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <button type="button" onClick={goBack} disabled={step === 0 || submitting} className="rounded-sm border border-[#b78d4b70] bg-white px-5 py-2 text-sm text-[#3b3024] disabled:opacity-40">
          Back
        </button>
        {step < INTAKE_STEPS.length - 1 ? (
          <button type="button" onClick={goNext} className="rounded-sm bg-[#b78d4b] px-5 py-2 text-sm text-white">
            Continue
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting} className="rounded-sm bg-[#1f7a7a] px-5 py-2 text-sm text-white disabled:opacity-60">
            {submitting ? "Submitting securely…" : "Submit Intake Form"}
          </button>
        )}
      </div>
    </div>
  );
}
