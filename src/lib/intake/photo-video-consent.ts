import { z } from "zod";

/** Medical treatments that require the HIPAA media authorization on booking. */
export const PHOTO_VIDEO_CONSENT_SERVICE_IDS = [
  "iv-therapy",
  "physician-visit",
  "telemedicine",
  "comprehensive-bloodwork",
  "glp1-peptides",
  "microneedling-with-exosomes",
  "hair-restoration",
  "facial-aesthetics",
  "icoone-laser",
  "korean-organic-skincare",
  "nutrition",
] as const;

export function bookingRequiresPhotoVideoConsent(serviceIds: string[]) {
  const medical = new Set<string>(PHOTO_VIDEO_CONSENT_SERVICE_IDS);
  // Nurse visit / lab draw pathways also require consent
  return serviceIds.some((id) => medical.has(id) || id.startsWith("lab-panel-"));
}

export const PHOTO_VIDEO_CONSENT_TITLE =
  "Photo, Video, Testimonial, HIPAA Authorization Consent and Release";

/**
 * Adapted from the Practice media authorization for KIAN Privé clinical records.
 * Brand-specific physician names are replaced with the practice entity.
 */
export const PHOTO_VIDEO_CONSENT_PARAGRAPHS = [
  "I, the undersigned patient (or parent/legal guardian, if applicable), voluntarily authorize and grant permission to KIAN Privé, its medical practice, and their respective owners, physicians, nurses, providers, employees, contractors, agents, affiliates, successors, and assigns (collectively, the “Practice”) to photograph, videotape, audio record, and otherwise capture my likeness, image, voice, statements, testimonials, treatment results, and related information (collectively, the “Materials”).",
  "Description of Materials: Photographs, videos, audio recordings, testimonials, before-and-after images, treatment-related images, event photographs, educational content, promotional content, and other media created in connection with my treatment, consultation, participation in Practice activities, or interactions with the Practice.",
  "Authorization and Use: I authorize the Practice to use, reproduce, edit, modify, publish, distribute, display, transmit, and otherwise utilize the Materials, in whole or in part, for any lawful purpose, including but not limited to: marketing and advertising; social media platforms; websites and online content; printed materials and brochures; educational and training materials; presentations and seminars; public relations and publicity; internal business purposes; and any other lawful promotional, educational, or business purpose.",
  "HIPAA Authorization: I understand that the Materials may reveal information regarding my medical condition, treatment, procedures, services received, or treatment outcomes and may constitute Protected Health Information (“PHI”) under applicable federal and state laws, including the Health Insurance Portability and Accountability Act (“HIPAA”). I voluntarily authorize the Practice to use and disclose such information to the extent contained in or reasonably inferable from the Materials for the purposes described in this Authorization and Release. I understand that information disclosed pursuant to this Authorization may be subject to redisclosure by third parties and may no longer be protected by HIPAA or other privacy laws once publicly released.",
  "Identification: The Practice may use my image, likeness, voice, statements, and treatment results with or without my name. I understand that complete anonymity cannot be guaranteed and that I may be identifiable from the Materials, even if my name is not used.",
  "No Compensation: I understand and agree that I shall receive no compensation, royalty, fee, payment, or other remuneration now or in the future arising from the creation, use, publication, display, distribution, or other exploitation of the Materials.",
  "Ownership: I acknowledge and agree that all photographs, videos, recordings, and other Materials created by or on behalf of the Practice shall be the sole and exclusive property of the Practice. I waive any right to inspect or approve the finished product or the specific use to which the Materials may be applied.",
  "Release and Waiver: To the fullest extent permitted by law, I hereby release, discharge, and hold harmless the Practice from and against any and all claims, demands, causes of action, liabilities, damages, costs, or expenses arising from or related to the authorized use of the Materials, including but not limited to claims for invasion of privacy, violation of publicity rights, defamation, emotional distress, copyright infringement, or misappropriation of likeness.",
  "No Impact on Treatment: I understand that my decision whether to sign this Authorization and Release is entirely voluntary and will not affect my eligibility for treatment, quality of care, payment, insurance benefits, or any services provided by the Practice.",
  "Revocation: I understand that I may revoke this Authorization at any time by providing written notice to the Practice. Such revocation shall apply only to future uses of the Materials and shall not affect any use, disclosure, publication, distribution, or reliance occurring prior to the Practice’s receipt of the revocation. I understand that Materials already published, distributed, shared, or disseminated may not be capable of being retrieved, removed, or destroyed.",
  "Expiration: Unless earlier revoked as provided herein, this Authorization shall remain in effect indefinitely.",
  "Results Disclaimer: I acknowledge that any photographs, videos, testimonials, statements, or treatment results used by the Practice are for informational, educational, and promotional purposes only. I understand that individual results vary and that no representation or guarantee is being made that any other patient will achieve the same or similar results.",
  "I have read and understand this Authorization and Release, have had the opportunity to ask questions, and voluntarily agree to its terms.",
] as const;

export const PHOTO_VIDEO_CONSENT_ACK =
  "I have read and agree to the Photo, Video, Testimonial, HIPAA Authorization Consent and Release.";

/** Zod fields to nest under intake/booking consent payloads. */
export const photoVideoConsentFieldsSchema = z.object({
  photoVideoConsentAccepted: z.boolean().refine((value) => value === true, {
    message: "Photo/video HIPAA media authorization is required.",
  }),
  photoVideoConsentSignedAt: z.string().min(1, "Consent date is required."),
  photoVideoConsentPrintedName: z.string().trim().min(2, "Printed name is required for media consent."),
  photoVideoSignatureDataUrl: z.string().refine((value) => value.startsWith("data:image"), {
    message: "A handwritten signature is required.",
  }),
  photoVideoDateOfBirth: z.string().min(1, "Date of birth is required."),
  photoVideoGuardianName: z.string().trim().optional().default(""),
  photoVideoGuardianRelationship: z.string().trim().optional().default(""),
});

export type PhotoVideoConsentFields = z.infer<typeof photoVideoConsentFieldsSchema>;

export const defaultPhotoVideoConsentFields: PhotoVideoConsentFields = {
  photoVideoConsentAccepted: false,
  photoVideoConsentSignedAt: "",
  photoVideoConsentPrintedName: "",
  photoVideoSignatureDataUrl: "",
  photoVideoDateOfBirth: "",
  photoVideoGuardianName: "",
  photoVideoGuardianRelationship: "",
};

export function formatPhotoVideoConsentForNotes(fields: PhotoVideoConsentFields) {
  const lines = [
    `[${PHOTO_VIDEO_CONSENT_TITLE}]`,
    `Accepted: ${fields.photoVideoConsentAccepted ? "YES" : "NO"}`,
    `Printed name: ${fields.photoVideoConsentPrintedName}`,
    `Date of birth: ${fields.photoVideoDateOfBirth || "—"}`,
    `Date signed: ${fields.photoVideoConsentSignedAt}`,
    `Handwritten signature: ${fields.photoVideoSignatureDataUrl.startsWith("data:image") ? "YES" : "NO"}`,
  ];
  if (fields.photoVideoGuardianName?.trim()) {
    lines.push(
      `Guardian: ${fields.photoVideoGuardianName}`,
      `Relationship: ${fields.photoVideoGuardianRelationship || "—"}`,
    );
  }
  return lines.join("\n");
}
