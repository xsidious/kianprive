"use client";

import { ConsentAgreement, splitConsentSections } from "@/components/intake/ConsentAgreement";
import { PHOTO_VIDEO_CONSENT_ACK, PHOTO_VIDEO_CONSENT_PARAGRAPHS } from "@/lib/intake/photo-video-consent";

export type PhotoVideoConsentValue = {
  photoVideoConsentAccepted: boolean;
  photoVideoConsentSignedAt: string;
  photoVideoConsentPrintedName: string;
  photoVideoSignatureDataUrl?: string;
  photoVideoGuardianName?: string;
  photoVideoGuardianRelationship?: string;
};

type Props = {
  value: PhotoVideoConsentValue;
  onChange: (next: PhotoVideoConsentValue) => void;
  patientName?: string;
  onPatientNameChange?: (value: string) => void;
  dateOfBirth?: string;
  onDateOfBirthChange?: (value: string) => void;
  serviceDate?: string;
  compact?: boolean;
  className?: string;
};

const HIGHLIGHTS = [
  "You allow KIAN Privé to use photos, video, and testimonials from your care.",
  "You are not paid for this use, and you may revoke it in writing for anything not already published.",
];

export function PhotoVideoConsentBlock({
  value,
  onChange,
  patientName = "",
  onPatientNameChange,
  dateOfBirth = "",
  onDateOfBirthChange,
  serviceDate,
  className = "",
}: Props) {
  return (
    <ConsentAgreement
      className={className}
      eyebrow="Photos and video"
      title="Media authorization"
      lede="Your name and date of birth carry over from the form. Accept this release and sign."
      highlights={HIGHLIGHTS}
      sections={splitConsentSections(PHOTO_VIDEO_CONSENT_PARAGRAPHS)}
      acknowledgment={PHOTO_VIDEO_CONSENT_ACK}
      patientName={patientName || value.photoVideoConsentPrintedName}
      onPatientNameChange={onPatientNameChange ?? (() => undefined)}
      dateOfBirth={dateOfBirth}
      onDateOfBirthChange={onDateOfBirthChange ?? (() => undefined)}
      serviceDate={serviceDate}
      value={{
        accepted: value.photoVideoConsentAccepted,
        signedAt: value.photoVideoConsentSignedAt,
        printedName: value.photoVideoConsentPrintedName,
        signatureDataUrl: value.photoVideoSignatureDataUrl ?? "",
        guardianName: value.photoVideoGuardianName,
        guardianRelationship: value.photoVideoGuardianRelationship,
      }}
      onChange={(next) =>
        onChange({
          photoVideoConsentAccepted: next.accepted,
          photoVideoConsentSignedAt: next.signedAt,
          photoVideoConsentPrintedName: next.printedName,
          photoVideoSignatureDataUrl: next.signatureDataUrl,
          photoVideoGuardianName: next.guardianName ?? "",
          photoVideoGuardianRelationship: next.guardianRelationship ?? "",
        })
      }
    />
  );
}
