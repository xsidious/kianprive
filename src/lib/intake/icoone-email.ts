import type { IcooneIntake } from "@/lib/intake/icoone-schema";
import { buildSimpleEmail } from "@/lib/email-templates";
import { intakeTrackUrl } from "@/lib/intake/tracking";

export function getIcooneIntakeReportRecipients() {
  const raw =
    process.env.ICOONE_INTAKE_REPORT_EMAIL ||
    process.env.BOOKING_REPORT_EMAIL ||
    process.env.PEPTIDE_INTAKE_REPORT_EMAIL ||
    "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function formatIcooneIntakeEmail(input: { data: IcooneIntake; referenceId: string }) {
  const { data, referenceId } = input;
  const track = intakeTrackUrl({ referenceCode: referenceId, email: data.patient.email });
  const text = [
    `Icoone Lymphatic Drainage intake — ${data.patient.fullName}`,
    `Reference: ${referenceId}`,
    `Recent illness: ${data.recentIllness}`,
    `Physician cleared Icoone: ${data.physicianCleared}`,
    `Focus: ${data.focusAreas.join(", ")}`,
    `History: ${data.medicalHistory.conditions.join(", ")}`,
    `Phone: ${data.patient.phone}`,
    `Email: ${data.patient.email}`,
    `Track: ${track}`,
  ].join("\n");
  return {
    subject: `Icoone intake — ${data.patient.fullName} (${referenceId})`,
    text,
    html: buildSimpleEmail({
      title: "Icoone Lymphatic Drainage intake",
      preheader: `${data.patient.fullName} completed the Icoone intake`,
      paragraphs: [
        `${data.patient.fullName} completed the Icoone lymphatic drainage intake.`,
        `Recent illness in the last week: ${data.recentIllness}. Physician clearance: ${data.physicianCleared}.`,
        `Areas of focus: ${data.focusAreas.join(", ")}.`,
        `Reference: ${referenceId}`,
      ],
      button: { href: track, label: "Open tracking link" },
    }),
  };
}

export function formatIcoonePatientConfirmation(input: { data: IcooneIntake; referenceId: string }) {
  const track = intakeTrackUrl({ referenceCode: input.referenceId, email: input.data.patient.email });
  return {
    subject: `Your Icoone intake — ${input.referenceId}`,
    text: `Thank you, ${input.data.patient.fullName}. Your Icoone intake is with the KIAN team. Reference ${input.referenceId}. Track: ${track}`,
    html: buildSimpleEmail({
      title: "Icoone intake received",
      preheader: `Reference ${input.referenceId}`,
      paragraphs: [
        `Thank you, ${input.data.patient.fullName}. Your Icoone lymphatic drainage intake is with the KIAN team.`,
        `Your request code is ${input.referenceId}.`,
      ],
      button: { href: track, label: "Track my intake" },
    }),
  };
}
