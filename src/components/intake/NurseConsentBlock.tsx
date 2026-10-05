"use client";

import { ConsentAgreement, splitConsentSections } from "@/components/intake/ConsentAgreement";
import { NURSE_CONSENT_ACK, NURSE_CONSENT_PARAGRAPHS } from "@/lib/intake/nurse-consent";

export type NurseConsentValue = {
  nurseConsentAccepted: boolean;
  nurseConsentSignedAt: string;
  nurseConsentPrintedName: string;
  nurseConsentSignatureDataUrl: string;
  nurseConsentGuardianName?: string;
  nurseConsentGuardianRelationship?: string;
};

type Props = {
  value: NurseConsentValue;
  onChange: (next: NurseConsentValue) => void;
  patientName: string;
  onPatientNameChange: (value: string) => void;
  dateOfBirth: string;
  onDateOfBirthChange: (value: string) => void;
  serviceDate?: string;
  compact?: boolean;
  className?: string;
};

const HIGHLIGHTS = [
  "A KIAN Privé nurse gives the treatment your physician approved, and may pause it if it is not safe.",
  "You accept the risks of IV therapy, including bruising, allergic reaction, and rare serious complications.",
];

export function NurseConsentBlock({
  value,
  onChange,
  patientName,
  onPatientNameChange,
  dateOfBirth,
  onDateOfBirthChange,
  serviceDate,
  className = "",
}: Props) {
  return (
    <ConsentAgreement
      className={className}
      eyebrow="IV therapy"
      title="Nursing treatment agreement"
      lede="Your visit details are filled in below. Accept the agreement and sign. The nurse completes vitals at the appointment."
      highlights={HIGHLIGHTS}
      sections={splitConsentSections(NURSE_CONSENT_PARAGRAPHS)}
      acknowledgment={NURSE_CONSENT_ACK}
      patientName={patientName}
      onPatientNameChange={onPatientNameChange}
      dateOfBirth={dateOfBirth}
      onDateOfBirthChange={onDateOfBirthChange}
      serviceDate={serviceDate}
      value={{
        accepted: value.nurseConsentAccepted,
        signedAt: value.nurseConsentSignedAt,
        printedName: value.nurseConsentPrintedName,
        signatureDataUrl: value.nurseConsentSignatureDataUrl,
        guardianName: value.nurseConsentGuardianName,
        guardianRelationship: value.nurseConsentGuardianRelationship,
      }}
      onChange={(next) =>
        onChange({
          nurseConsentAccepted: next.accepted,
          nurseConsentSignedAt: next.signedAt,
          nurseConsentPrintedName: next.printedName,
          nurseConsentSignatureDataUrl: next.signatureDataUrl,
          nurseConsentGuardianName: next.guardianName ?? "",
          nurseConsentGuardianRelationship: next.guardianRelationship ?? "",
        })
      }
    />
  );
}
