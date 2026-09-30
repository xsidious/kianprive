"use client";

import { ConsentAgreement, splitConsentSections } from "@/components/intake/ConsentAgreement";
import { NURSE_CONSENT_ACK, NURSE_CONSENT_PARAGRAPHS } from "@/lib/intake/nurse-consent";

export type NurseConsentValue = {
  nurseConsentAccepted: boolean;
  nurseConsentSignedAt: string;
  nurseConsentPrintedName: string;
  nurseConsentGuardianName?: string;
  nurseConsentGuardianRelationship?: string;
};

type Props = {
  value: NurseConsentValue;
  onChange: (next: NurseConsentValue) => void;
  compact?: boolean;
  className?: string;
};

const HIGHLIGHTS = [
  "A KIAN Privé nurse gives the treatment your physician approved, and may pause it if it is not safe.",
  "IV therapy and injections can cause bruising, infection, allergic reaction, and, rarely, serious complications.",
  "Results are not guaranteed. Prepared medications and supplies are generally not refundable once they are set aside for you.",
];

export function NurseConsentBlock({ value, onChange, className = "" }: Props) {
  return (
    <ConsentAgreement
      className={className}
      eyebrow="IV therapy"
      title="Nursing treatment agreement"
      lede="A short summary is below. Open the full agreement before you sign. Vitals and the nurse’s signature are completed at your visit."
      highlights={HIGHLIGHTS}
      sections={splitConsentSections(NURSE_CONSENT_PARAGRAPHS)}
      acknowledgment={NURSE_CONSENT_ACK}
      value={{
        accepted: value.nurseConsentAccepted,
        signedAt: value.nurseConsentSignedAt,
        printedName: value.nurseConsentPrintedName,
        guardianName: value.nurseConsentGuardianName,
        guardianRelationship: value.nurseConsentGuardianRelationship,
      }}
      onChange={(next) =>
        onChange({
          nurseConsentAccepted: next.accepted,
          nurseConsentSignedAt: next.signedAt,
          nurseConsentPrintedName: next.printedName,
          nurseConsentGuardianName: next.guardianName ?? "",
          nurseConsentGuardianRelationship: next.guardianRelationship ?? "",
        })
      }
    />
  );
}
