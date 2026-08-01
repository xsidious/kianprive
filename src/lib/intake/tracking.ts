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

/** Patient-facing request code, e.g. KP-7F3A-9C2E */
export function generateIntakeTrackingToken() {
  const hex = randomBytes(4).toString("hex").toUpperCase();
  return `KP-${hex.slice(0, 4)}-${hex.slice(4)}`;
}

export function normalizeIntakeReference(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function publicAppBaseUrl() {
  return (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.kianprive.com").replace(
    /\/$/,
    "",
  );
}

export function intakeTrackUrl(opts: {
  referenceCode: string;
  email?: string | null;
}) {
  const base = publicAppBaseUrl();
  const params = new URLSearchParams();
  params.set("ref", opts.referenceCode);
  if (opts.email?.trim()) params.set("email", opts.email.trim());
  return `${base}/track-intake?${params.toString()}`;
}

export function patientFacingIntakeStatus(status: IntakeSubmissionStatus) {
  return INTAKE_STATUS_LABELS[status] ?? status;
}

/** Resolve patient reference: prefers KP-XXXX-XXXX token, falls back to internal cuid. */
export function intakeReferenceWhere(email: string, referenceRaw: string) {
  const reference = normalizeIntakeReference(referenceRaw);
  const emailFilter = { equals: email.trim().toLowerCase(), mode: "insensitive" as const };

  if (reference.startsWith("KP-")) {
    return {
      email: emailFilter,
      publicTrackingToken: reference,
    };
  }

  return {
    email: emailFilter,
    OR: [{ publicTrackingToken: reference }, { id: referenceRaw.trim() }],
  };
}
