import { z } from "zod";

/** Provider Connect / Wellness Hub intake payload (matches privetherapeutics.solutions form). */
export const wellnessHubIntakeSchema = z.object({
  fullName: z.string().min(1).max(120),
  dateOfBirth: z.string().max(40),
  age: z.string().max(10),
  sexAtBirth: z.string().max(40),
  phone: z.string().max(40),
  email: z.string().email().max(255),
  address: z.string().max(500),
  idNumber: z.string().max(120),
  idIssuePlace: z.string().max(120),
  primaryCarePhysician: z.string().max(120),
  firstAppointmentDate: z.string().max(40),
  assignedProvider: z.string().max(120),
  prescriptionMedications: z.string().max(2000),
  supplementsPeptides: z.string().max(2000),
  medicationAllergies: z.string().max(1000),
  foodAllergies: z.string().max(1000),
  otherAllergies: z.string().max(1000),
  conditions: z.array(z.string().max(120)).max(30),
  otherConditions: z.string().max(1000),
  recentSurgeries: z.string().max(1000),
  pregnantBreastfeeding: z.string().max(40),
  glpMedications: z.array(z.string().max(120)).max(20),
  glpDose: z.string().max(200),
  glpDuration: z.string().max(200),
  glpReasonStopped: z.string().max(500),
  glpSideEffects: z.string().max(2000),
  contraindications: z.array(z.string().max(120)).max(20),
  familyMtcMen2: z.string().max(10),
  allergicReactionAny: z.string().max(10),
  allergicReactionDetails: z.string().max(1000),
  attestationName: z.string().min(1).max(120),
  attestationDate: z.string().min(1).max(40),
  requestedDate: z.string().min(1).max(80),
  requestedTime: z.string().min(1).max(40),
  schedulingNotes: z.string().max(1000).optional(),
});

export type WellnessHubIntakeData = z.infer<typeof wellnessHubIntakeSchema>;

export function formatWellnessHubIntakeEmail(data: WellnessHubIntakeData, referenceId: string) {
  const list = (items: string[]) => (items.length ? items.join(", ") : "—");
  const line = (label: string, value: string) => `${label}: ${value?.trim() || "—"}`;

  const text = [
    "KIAN PRIVÉ — Wellness Hub / Provider Connect Intake",
    "====================================================",
    `Reference ID: ${referenceId}`,
    `Source: Wellness Hub (privetherapeutics.solutions)`,
    "",
    "SCHEDULING REQUEST",
    line("Requested date", data.requestedDate),
    line("Requested time", data.requestedTime),
    line("Discussion notes", data.schedulingNotes ?? ""),
    "",
    "01 PATIENT INFORMATION",
    line("Full Name", data.fullName),
    line("Date of Birth", data.dateOfBirth),
    line("Age", data.age),
    line("Sex at Birth", data.sexAtBirth),
    line("Phone", data.phone),
    line("Email", data.email),
    line("Address", data.address),
    line("Driver's License / Passport #", data.idNumber),
    line("State / Country of Issue", data.idIssuePlace),
    line("Primary Care Physician", data.primaryCarePhysician),
    line("Date of First Appointment", data.firstAppointmentDate),
    line("Assigned KIAN Privé Provider", data.assignedProvider),
    "",
    "02 CURRENT MEDICATIONS, SUPPLEMENTS & ALLERGIES",
    line("Prescription Medications", data.prescriptionMedications),
    line("Supplements & Peptides", data.supplementsPeptides),
    line("Medication Allergies", data.medicationAllergies),
    line("Food Allergies", data.foodAllergies),
    line("Other Allergies", data.otherAllergies),
    "",
    "03 PAST MEDICAL & SURGICAL HISTORY",
    line("Conditions", list(data.conditions)),
    line("Other conditions", data.otherConditions),
    line("Surgical procedures (past 12 months)", data.recentSurgeries),
    line("Pregnant / breastfeeding / planning", data.pregnantBreastfeeding),
    "",
    "04 GLP / WEIGHT-LOSS HISTORY",
    line("Previous medications", list(data.glpMedications)),
    line("Dose", data.glpDose),
    line("Duration Used", data.glpDuration),
    line("Reason Stopped", data.glpReasonStopped),
    line("Side effects / notable experience", data.glpSideEffects),
    "",
    "05 CONTRAINDICATION SCREENING",
    line("Personal history", list(data.contraindications)),
    line("Family history of MTC or MEN2", data.familyMtcMen2),
    line("Allergic reaction to med/supplement/peptide", data.allergicReactionAny),
    line("If yes, substance & reaction", data.allergicReactionDetails),
    "",
    "07 PATIENT ATTESTATION",
    line("Printed Name", data.attestationName),
    line("Date", data.attestationDate),
    "",
    "This information is confidential and protected under HIPAA guidelines.",
  ].join("\n");

  return {
    subject: `[Wellness Hub] Provider Connect — ${data.fullName} — ${data.requestedDate} at ${data.requestedTime}`,
    text,
    html: `<pre style="font-family:ui-monospace,monospace;white-space:pre-wrap;font-size:13px;line-height:1.45">${text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</pre>`,
  };
}

export function formatWellnessHubPatientConfirmation(data: WellnessHubIntakeData, referenceId: string) {
  const text = [
    `Hi ${data.fullName},`,
    "",
    "Thank you for submitting your Provider Connect intake through KIAN Privé Wellness Hub.",
    `Your reference ID is ${referenceId}.`,
    "",
    `Requested appointment: ${data.requestedDate} at ${data.requestedTime}.`,
    "",
    "Our clinical team will review your information and follow up with next steps.",
    "",
    "— KIAN Privé Concierge",
  ].join("\n");

  return {
    subject: `KIAN Privé — Intake received (${referenceId})`,
    text,
    html: `<p>Hi ${data.fullName},</p><p>Thank you for submitting your Provider Connect intake through KIAN Privé Wellness Hub.</p><p>Your reference ID is <strong>${referenceId}</strong>.</p><p>Requested appointment: ${data.requestedDate} at ${data.requestedTime}.</p><p>Our clinical team will review your information and follow up with next steps.</p><p>— KIAN Privé Concierge</p>`,
  };
}

export function getWellnessHubReportRecipients() {
  const raw =
    process.env.WELLNESS_HUB_INTAKE_REPORT_EMAIL ||
    process.env.PEPTIDE_INTAKE_REPORT_EMAIL ||
    process.env.BOOKING_REPORT_EMAIL ||
    "";
  return [...new Set(raw.split(",").map((item) => item.trim()).filter(Boolean))];
}
