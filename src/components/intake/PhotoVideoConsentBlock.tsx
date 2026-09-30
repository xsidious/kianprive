"use client";

import { ConsentAgreement, splitConsentSections } from "@/components/intake/ConsentAgreement";
import { PHOTO_VIDEO_CONSENT_ACK, PHOTO_VIDEO_CONSENT_PARAGRAPHS } from "@/lib/intake/photo-video-consent";

export type PhotoVideoConsentValue = {
  photoVideoConsentAccepted: boolean;
  photoVideoConsentSignedAt: string;
  photoVideoConsentPrintedName: string;
  photoVideoGuardianName?: string;
  photoVideoGuardianRelationship?: string;
};

type Props = {
  value: PhotoVideoConsentValue;
  onChange: (next: PhotoVideoConsentValue) => void;
  compact?: boolean;
  className?: string;
};

const HIGHLIGHTS = [
  "You allow KIAN Privé to photograph, record, and share your likeness, voice, and treatment results.",
  "Those images can show medical details, and they may no longer be private once they are published.",
  "You are not paid for this use. You may revoke it in writing for anything not already published.",
];

export function PhotoVideoConsentBlock({ value, onChange, className = "" }: Props) {
  return (
    <ConsentAgreement
      className={className}
      eyebrow="Photos and video"
      title="Media authorization"
      lede="A short summary is below. The full release is one tap away, and that is what you are agreeing to."
      highlights={HIGHLIGHTS}
      sections={splitConsentSections(PHOTO_VIDEO_CONSENT_PARAGRAPHS)}
      acknowledgment={PHOTO_VIDEO_CONSENT_ACK}
      value={{
        accepted: value.photoVideoConsentAccepted,
        signedAt: value.photoVideoConsentSignedAt,
        printedName: value.photoVideoConsentPrintedName,
        guardianName: value.photoVideoGuardianName,
        guardianRelationship: value.photoVideoGuardianRelationship,
      }}
      onChange={(next) =>
        onChange({
          photoVideoConsentAccepted: next.accepted,
          photoVideoConsentSignedAt: next.signedAt,
          photoVideoConsentPrintedName: next.printedName,
          photoVideoGuardianName: next.guardianName ?? "",
          photoVideoGuardianRelationship: next.guardianRelationship ?? "",
        })
      }
    />
  );
}
