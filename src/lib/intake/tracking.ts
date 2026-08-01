import { randomBytes } from "crypto";
import type { IntakeSubmissionStatus } from "@prisma/client";

export const INTAKE_STATUS_LABELS: Record<IntakeSubmissionStatus, string> = {
  PENDING_REVIEW: "Submitted — awaiting review",
  UNDER_PHYSICIAN_REVIEW: "Under physician review",
  NEEDS_LABS: "Further labs / evaluation required",
  NEEDS_FOLLOW_UP: "Needs follow-up",
  APPROVED: "Approved",
  DECLINED: "Declined",
};

export const INTAKE_STATUS_OPTIONS: IntakeSubmissionStatus[] = [
  "PENDING_REVIEW",
  "UNDER_PHYSICIAN_REVIEW",
  "NEEDS_LABS",
  "NEEDS_FOLLOW_UP",
  "APPROVED",
  "DECLINED",
];

export function generateIntakeTrackingToken() {
  return `KP-${randomBytes(5).toString("hex").toUpperCase()}`;
}

export function publicAppBaseUrl() {
  return (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.kianprive.com").replace(
    /\/$/,
    "",
  );
}

export function intakeTrackUrl(referenceId: string, token?: string | null) {
  const base = publicAppBaseUrl();
  if (token) return `${base}/track-intake?ref=${encodeURIComponent(referenceId)}&token=${encodeURIComponent(token)}`;
  return `${base}/track-intake?ref=${encodeURIComponent(referenceId)}`;
}

export function patientFacingIntakeStatus(status: IntakeSubmissionStatus) {
  return INTAKE_STATUS_LABELS[status] ?? status;
}
