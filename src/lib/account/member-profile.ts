export const SEX_AT_BIRTH_OPTIONS = ["", "Female", "Male", "Intersex", "Prefer not to say"] as const;
export const PREGNANCY_STATUS_OPTIONS = [
  "",
  "No",
  "Pregnant",
  "Breastfeeding",
  "Planning pregnancy",
  "Not applicable",
] as const;
export const PREFERRED_CONTACT_OPTIONS = ["", "Phone", "Text", "Email"] as const;

export type MemberProfileDraft = {
  name: string;
  phone: string;
  company: string;
  dateOfBirth: string;
  sexAtBirth: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  preferredContact: string;
  primaryCarePhysician: string;
  medicalConditions: string;
  allergies: string;
  medications: string;
  supplements: string;
  pregnancyStatus: string;
  emergencyContact: string;
  emergencyRelationship: string;
  emergencyPhone: string;
};

export function emptyMemberProfile(): MemberProfileDraft {
  return {
    name: "",
    phone: "",
    company: "",
    dateOfBirth: "",
    sexAtBirth: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    preferredContact: "",
    primaryCarePhysician: "",
    medicalConditions: "",
    allergies: "",
    medications: "",
    supplements: "",
    pregnancyStatus: "",
    emergencyContact: "",
    emergencyRelationship: "",
    emergencyPhone: "",
  };
}

export function publicMemberProfile(user: {
  name?: string | null;
  email?: string | null;
  profile?: Partial<MemberProfileDraft> | null;
}) {
  return {
    ...memberProfileFromRecord({
      ...user.profile,
      name: user.name ?? user.profile?.name ?? "",
    }),
    email: user.email ?? "",
  };
}

export function memberProfileFromRecord(
  record: Partial<MemberProfileDraft> | null | undefined,
): MemberProfileDraft {
  const empty = emptyMemberProfile();
  if (!record) return empty;
  const next = { ...empty };
  for (const key of Object.keys(empty) as Array<keyof MemberProfileDraft>) {
    const value = record[key];
    next[key] = typeof value === "string" ? value : "";
  }
  return next;
}

function optionalText(value: unknown, max: number) {
  if (value === undefined) return undefined;
  const text = String(value).trim().slice(0, max);
  return text || null;
}

/** Only fields present on the body are written. Missing keys leave the live row unchanged. */
export function memberProfileWriteData(body: Partial<MemberProfileDraft>) {
  const fields = {
    phone: optionalText(body.phone, 40),
    company: optionalText(body.company, 160),
    dateOfBirth: optionalText(body.dateOfBirth, 40),
    sexAtBirth: optionalText(body.sexAtBirth, 40),
    addressLine1: optionalText(body.addressLine1, 200),
    city: optionalText(body.city, 80),
    state: optionalText(body.state, 40),
    postalCode: optionalText(body.postalCode, 20),
    preferredContact: optionalText(body.preferredContact, 40),
    primaryCarePhysician: optionalText(body.primaryCarePhysician, 160),
    medicalConditions: optionalText(body.medicalConditions, 4000),
    allergies: optionalText(body.allergies, 2000),
    medications: optionalText(body.medications, 2000),
    supplements: optionalText(body.supplements, 2000),
    pregnancyStatus: optionalText(body.pregnancyStatus, 40),
    emergencyContact: optionalText(body.emergencyContact, 120),
    emergencyRelationship: optionalText(body.emergencyRelationship, 80),
    emergencyPhone: optionalText(body.emergencyPhone, 40),
  };
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
}
