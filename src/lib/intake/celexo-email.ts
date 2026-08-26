import type { CelexoIntakeFormData } from "@/lib/intake/celexo-schema";
import { CELEXO_SCREENING_QUESTIONS } from "@/lib/intake/celexo-options";
import { buildIntakeUpdateEmail, buildSimpleEmail } from "@/lib/email-templates";
import { intakeTrackUrl } from "@/lib/intake/tracking";

export function getCelexoIntakeReportRecipients() {
  const raw =
    process.env.CELEXO_INTAKE_REPORT_EMAIL ||
    process.env.PEPTIDE_INTAKE_REPORT_EMAIL ||
    process.env.BOOKING_REPORT_EMAIL ||
    "";
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function formatCelexoIntakeEmail(input: {
  data: CelexoIntakeFormData;
  referenceId: string;
  submissionId: string;
}) {
  const { data, referenceId } = input;
  const track = intakeTrackUrl({ referenceCode: referenceId, email: data.patient.email });
  const screeningLines = CELEXO_SCREENING_QUESTIONS.map((q) => {
    const row = data.allergies.screening[q.key];
    return `- ${q.label}: ${row?.answer ?? "—"} ${row?.details ? `(${row.details})` : ""}`;
  }).join("\n");

  const text = [
    `Celexo Exosome Intake — ${data.patient.fullName}`,
    `Reference: ${referenceId}`,
    `Protocol: ${data.selection.protocol}`,
    `Delivery: ${data.selection.deliveryMethod}`,
    `Areas: ${data.selection.treatmentAreas.join(", ")}`,
    `Goals: ${data.selection.primaryGoals.map((g) => `${g.rank}. ${g.goal}`).join("; ")}`,
    "",
    `Phone: ${data.patient.phone}`,
    `Email: ${data.patient.email}`,
    `DOB: ${data.patient.dateOfBirth}`,
    "",
    "Screening:",
    screeningLines,
    "",
    `Track: ${track}`,
  ].join("\n");

  return {
    subject: `Celexo intake — ${data.patient.fullName} (${referenceId})`,
    text,
    html: buildSimpleEmail({
      title: "Celexo Exosome Intake",
      preheader: `${data.patient.fullName} · ${data.selection.protocol}`,
      paragraphs: [
        `${data.patient.fullName} submitted a Korean Exosome / Celexo intake.`,
        `Protocol: ${data.selection.protocol}`,
        `Delivery: ${data.selection.deliveryMethod}`,
        `Areas: ${data.selection.treatmentAreas.join(", ")}`,
        `Reference: ${referenceId}`,
      ],
      button: { href: track, label: "Open tracking link" },
    }),
  };
}

export function formatCelexoPatientConfirmation(input: {
  data: CelexoIntakeFormData;
  referenceId: string;
}) {
  const track = intakeTrackUrl({
    referenceCode: input.referenceId,
    email: input.data.patient.email,
  });
  return buildIntakeUpdateEmail({
    fullName: input.data.patient.fullName,
    body: [
      "Thank you for completing your Celexo Exosome Therapy intake at KIAN Privé.",
      "",
      `Selected protocol: ${input.data.selection.protocol}`,
      `Delivery method: ${input.data.selection.deliveryMethod}`,
      "",
      "Our team will review your form before your appointment. Please bring a photo ID and arrive with a clean face (no makeup or actives) if you are scheduled for microneedling.",
    ].join("\n"),
    statusLabel: "Received — pending clinical review",
    referenceCode: input.referenceId,
    trackUrl: track,
  });
}
