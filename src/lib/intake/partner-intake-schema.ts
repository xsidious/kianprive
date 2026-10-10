import { z } from "zod";

export const PARTNER_SITES = ["facial-design", "4everglow", "threefold-strength"] as const;
export type PartnerSite = (typeof PARTNER_SITES)[number];

/** Distinct intake channels from partner clinics — each maps to a different clinical workflow. */
export const PARTNER_INTAKE_TYPES = [
  "booking",
  "peptide_intake",
  "skin_peptide_intake",
  "wellness_intake",
  "partner_application",
  "pro_pricing",
] as const;
export type PartnerIntakeType = (typeof PARTNER_INTAKE_TYPES)[number];

export const SITE_LABELS: Record<PartnerSite, string> = {
  "facial-design": "Facial Design Studio",
  "4everglow": "4everglow Wellness",
  "threefold-strength": "Threefold Strength",
};

export const TYPE_LABELS: Record<PartnerIntakeType, string> = {
  booking: "Booking / consultation",
  peptide_intake: "Clinical peptide / GLP intake",
  skin_peptide_intake: "Skin peptide intake",
  wellness_intake: "Wellness peptide intake",
  partner_application: "Partner application",
  pro_pricing: "Pro / wholesale pricing",
};

export const partnerIntakeEnvelopeSchema = z.object({
  site: z.enum(PARTNER_SITES),
  type: z.enum(PARTNER_INTAKE_TYPES),
  payload: z.record(z.string(), z.unknown()),
  patientEmail: z.string().email().optional(),
  patientName: z.string().min(1).max(200).optional(),
  patientPhone: z.string().max(40).optional(),
  patientDateOfBirth: z.string().max(40).optional(),
  referralCode: z.string().max(64).optional(),
  externalRef: z.string().max(120).optional(),
});

export type PartnerIntakeEnvelope = z.infer<typeof partnerIntakeEnvelopeSchema>;

function asString(value: unknown, fallback = "") {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

/** Pull common contact fields from nested partner payloads. */
export function resolvePartnerContact(data: PartnerIntakeEnvelope) {
  const p = data.payload;
  const nestedPatient =
    p.patient && typeof p.patient === "object" && !Array.isArray(p.patient)
      ? (p.patient as Record<string, unknown>)
      : null;
  const email =
    data.patientEmail?.trim().toLowerCase() ||
    asString(nestedPatient?.email || p.email || p.patientEmail || p.contactEmail).toLowerCase();
  const fullName =
    data.patientName?.trim() ||
    asString(
      nestedPatient?.fullName || p.fullName || p.name || p.patientName || p.contactName,
    ) ||
    "Partner submission";
  const phone =
    data.patientPhone?.trim() ||
    asString(nestedPatient?.phone || p.phone || p.patientPhone || p.contactPhone) ||
    "n/a";
  const dateOfBirth =
    data.patientDateOfBirth?.trim() ||
    asString(
      nestedPatient?.dateOfBirth || p.dateOfBirth || p.dob || p.patientDateOfBirth,
    ) ||
    "n/a";

  return { email, fullName, phone, dateOfBirth };
}

export function partnerProgramLabels(
  site: PartnerSite,
  type: PartnerIntakeType,
  payload: Record<string, unknown> = {},
) {
  const labels = [`Partner · ${SITE_LABELS[site]}`, TYPE_LABELS[type]];
  const purpose = asString(payload.purpose || payload.intakePurpose || payload.kianProgram);
  if (purpose) labels.push(purpose);
  const service = asString(payload.serviceInterest || payload.service || payload.primaryService);
  if (service && !labels.includes(service)) labels.push(service);
  if (Array.isArray(payload.programs)) {
    for (const program of payload.programs) {
      const label = asString(program);
      if (label && !labels.includes(label)) labels.push(label);
    }
  }
  return labels;
}

export function formatPartnerIntakeStaffEmail(input: {
  site: PartnerSite;
  type: PartnerIntakeType;
  referenceCode: string;
  contact: { email: string; fullName: string; phone: string };
  referralCode?: string | null;
  externalRef?: string | null;
  payload: Record<string, unknown>;
}) {
  const siteLabel = SITE_LABELS[input.site];
  const typeLabel = TYPE_LABELS[input.type];
  const lines = Object.entries(input.payload).map(([key, value]) => {
    const rendered =
      value == null
        ? ""
        : typeof value === "string" || typeof value === "number" || typeof value === "boolean"
          ? String(value)
          : JSON.stringify(value);
    return `${key}: ${rendered}`;
  });

  const subject = `[${siteLabel}] ${typeLabel} — ${input.contact.fullName} (${input.referenceCode})`;
  const text = [
    `Partner site: ${siteLabel}`,
    `Type: ${typeLabel} (${input.type})`,
    `Reference: ${input.referenceCode}`,
    input.externalRef ? `External ref: ${input.externalRef}` : null,
    input.referralCode ? `Referral code: ${input.referralCode}` : null,
    "",
    `Name: ${input.contact.fullName}`,
    `Email: ${input.contact.email}`,
    `Phone: ${input.contact.phone}`,
    "",
    "Payload:",
    ...lines,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<pre style="font-family:ui-monospace,monospace;white-space:pre-wrap">${text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")}</pre>`;

  return { subject, text, html };
}

export function authorizePartnerIntake(req: Request, site: PartnerSite) {
  const headerSecret =
    req.headers.get("x-partner-intake-secret")?.trim() ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!headerSecret) return false;

  const shared = process.env.PARTNER_INTAKE_SECRET?.trim();
  const perSite =
    site === "facial-design"
      ? process.env.FACIAL_DESIGN_INTAKE_SECRET?.trim()
      : site === "4everglow"
        ? process.env.FOREVERGLOW_INTAKE_SECRET?.trim()
        : process.env.THREEFOLD_INTAKE_SECRET?.trim();

  const allowed = [shared, perSite].filter(Boolean) as string[];
  return allowed.some((secret) => secret === headerSecret);
}
