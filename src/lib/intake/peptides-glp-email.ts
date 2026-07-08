import type { PeptidesGlpIntakeFormData } from "@/lib/intake/peptides-glp-schema";
import { ACKNOWLEDGMENT_STATEMENTS } from "@/lib/intake/peptides-glp-options";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function line(label: string, value?: string | null) {
  if (!value?.trim()) return "";
  return `${label}: ${value.trim()}`;
}

function listBlock(label: string, values: string[]) {
  if (!values.length) return "";
  return `${label}:\n${values.map((item) => `  - ${item}`).join("\n")}`;
}

export function getPeptideIntakeReportRecipients() {
  const configured =
    process.env.PEPTIDE_INTAKE_REPORT_EMAIL ??
    process.env.BOOKING_REPORT_EMAIL ??
    "";
  return configured
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatPeptideIntakeEmail(data: PeptidesGlpIntakeFormData, referenceId: string) {
  const sections = [
    "KIAN Privé — Comprehensive Therapeutics Intake (Peptide / GLP)",
    `Reference ID: ${referenceId}`,
    `Submitted: ${new Date().toISOString()}`,
    "",
    "=== 01 PATIENT INFORMATION ===",
    line("Full Name", data.patient.fullName),
    line("Date of Birth", data.patient.dateOfBirth),
    line("Age", data.patient.age),
    line("Height", data.patient.height),
    line("Weight", data.patient.weight),
    line("BMI", data.patient.bmi),
    line("Sex at Birth", data.patient.sexAtBirth),
    line("Gender Identity", data.patient.genderIdentity),
    line("Phone", data.patient.phone),
    line("Email", data.patient.email),
    line("Primary Care Physician", data.patient.primaryCarePhysician),
    line("Referring Physician", data.patient.referringPhysician),
    line("Date of First Appointment", data.patient.firstAppointmentDate),
    "",
    "=== 02 PROGRAM OF INTEREST ===",
    listBlock("Programs", data.programs),
    "",
    "=== 03 TREATMENT GOALS ===",
    listBlock("Primary Goals", data.goals.primaryGoals),
    line("Other Goal", data.goals.otherGoal),
    line("Desired Goal Weight", data.goals.desiredGoalWeight),
    line("Aesthetic / Wellness Outcomes", data.goals.aestheticOutcomes),
    "",
    "=== 04 WEIGHT & METABOLIC HISTORY ===",
    line("Current Weight", data.weightHistory.currentWeight),
    line("Highest Adult Weight", data.weightHistory.highestAdultWeight),
    line("Lowest Adult Weight", data.weightHistory.lowestAdultWeight),
    line("Weight Struggle Duration", data.weightHistory.struggleDuration),
    listBlock("Previous Approaches", data.weightHistory.previousApproaches),
    data.weightHistory.previousTherapies.length
      ? data.weightHistory.previousTherapies
          .map(
            (entry, index) =>
              `Previous Therapy ${index + 1}: ${entry.therapy}\n  Dose: ${entry.dose || "—"}\n  Duration: ${entry.duration || "—"}\n  Reason Stopped: ${entry.reasonStopped || "—"}\n  Side Effects: ${entry.sideEffects || "—"}`,
          )
          .join("\n")
      : "",
    line("Previous Therapy Experience", data.weightHistory.previousTherapyExperience),
    "",
    "=== 05 MEDICAL HISTORY ===",
    listBlock("Conditions", data.medicalHistory.conditions),
    line("Hormonal Disorder Detail", data.medicalHistory.hormonalDisorderDetail),
    line("Other Conditions", data.medicalHistory.otherConditions),
    line("Other Conditions Detail", data.medicalHistory.otherConditionsDetail),
    line("Surgery in Past 12 Months", data.medicalHistory.recentSurgery),
    line("Surgery Detail", data.medicalHistory.recentSurgeryDetail),
    line("Pregnant / Breastfeeding / Planning", data.medicalHistory.pregnantBreastfeedingPlanning),
    "",
    "=== 06 CONTRAINDICATIONS ===",
    listBlock("Screening Items", data.contraindications.items),
    line("Medication Allergy", data.contraindications.medicationAllergy),
    line("Allergy Detail", data.contraindications.medicationAllergyDetail),
    "",
    "=== 07 FAMILY HISTORY ===",
    listBlock("Family History", data.familyHistory),
    "",
    "=== 08 MEDICATIONS & ALLERGIES ===",
    line("Prescription Medications", data.medications.prescriptions),
    line("Supplements", data.medications.supplements),
    line("Peptides in Use", data.medications.peptidesInUse),
    line("Hormones / HRT", data.medications.hormones),
    line("Medication Allergies", data.medications.medicationAllergies),
    line("Food Allergies", data.medications.foodAllergies),
    line("Other Allergies", data.medications.otherAllergies),
    "",
    "=== 09 LIFESTYLE ===",
    line("Activity Frequency", data.lifestyle.activityFrequency),
    line("Average Daily Steps", data.lifestyle.averageDailySteps),
    line("Average Sleep", data.lifestyle.averageSleepHours),
    line("Diet Type", data.lifestyle.dietType),
    line("Other Diet", data.lifestyle.otherDiet),
    line("Skincare Routine", data.lifestyle.skincareRoutine),
    line("Skincare Routine Detail", data.lifestyle.skincareRoutineDetail),
    line("Alcohol / Substances", data.lifestyle.alcoholOrSubstances),
    line("Alcohol / Substances Detail", data.lifestyle.alcoholOrSubstancesDetail),
    listBlock("Smoking Status", data.lifestyle.smokingStatus),
    line("Stress Level", data.lifestyle.stressLevel),
    "",
    "=== 10 NUTRITION ===",
    line("Meals Per Day", data.nutrition.mealsPerDay),
    line("Water Intake (oz/day)", data.nutrition.waterIntakeOz),
    line("Protein Intake (g/day)", data.nutrition.proteinIntakeG),
    listBlock("Eating Patterns", data.nutrition.eatingPatterns),
    "",
    "=== 11 WOMEN'S HEALTH ===",
    line("Last Menstrual Period", data.womensHealth.lastMenstrualPeriod),
    line("Birth Control Method", data.womensHealth.birthControlMethod),
    listBlock("Selections", data.womensHealth.selections),
    "",
    "=== 12 LABORATORY HISTORY ===",
    listBlock("Recent Labs", data.labs.recentLabs),
    "",
    "=== 13 SYMPTOMS ===",
    listBlock("Current Symptoms", data.symptoms),
    "",
    "=== 14 ACKNOWLEDGMENTS ===",
    ACKNOWLEDGMENT_STATEMENTS.map((statement, index) => {
      const initial = data.acknowledgments.initials[String(index)] ?? "";
      return `[${initial || "—"}] ${statement}`;
    }).join("\n"),
    "",
    "=== 15 CONSENT ===",
    line("Referral Source", data.consent.referralSource),
    line("Referral Other", data.consent.referralOther),
    line("Client Signature", data.consent.clientSignature),
    line("Printed Name", data.consent.printedName),
    line("Signature Date", data.consent.signatureDate),
    "",
    "This transmission contains protected health information (PHI). Handle in accordance with HIPAA and KIAN Privé privacy policies.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<pre style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;line-height:1.5">${escapeHtml(sections)}</pre>`;

  return {
    subject: `[HIPAA] Peptide/GLP Intake — ${data.patient.fullName} (${referenceId})`,
    text: sections,
    html,
  };
}

export function formatPeptideIntakePatientConfirmation(data: PeptidesGlpIntakeFormData, referenceId: string) {
  const text = [
    `Dear ${data.patient.fullName},`,
    "",
    "Thank you for submitting your KIAN Privé Comprehensive Therapeutics Intake Form.",
    "",
    `Reference ID: ${referenceId}`,
    "A KIAN Privé clinician will review your information and contact you regarding next steps.",
    "",
    "This message confirms receipt only and does not constitute medical approval or a prescription.",
    "",
    "KIAN Privé — Physician-Led Luxury Wellness Concierge",
    "North Miami Beach, Florida",
  ].join("\n");

  return {
    subject: "We received your KIAN Privé therapeutics intake",
    text,
    html: `<p>${text.replaceAll("\n\n", "</p><p>").replaceAll("\n", "<br/>")}</p>`,
  };
}
