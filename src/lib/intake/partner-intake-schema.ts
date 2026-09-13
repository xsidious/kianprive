import { z } from "zod";

export const PARTNER_SITES = ["facial-design", "4everglow"] as const;
export type PartnerSite = (typeof PARTNER_SITES)[number];

export const PARTNER_INTAKE_TYPES = [
  "booking",
  "peptide_intake",
  "partner_application",
  "pro_pricing",
] as const;
export type PartnerIntakeType = (typeof PARTNER_INTAKE_TYPES)[number];

export const SITE_LABELS: Record<PartnerSite, string> = {
  "facial-design": "Facial Design Studio",
  "4everglow": "4everglow Wellness",
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
  const email =
    data.patientEmail?.trim().toLowerCase() ||
    asString(p.email || p.patientEmail || p.contactEmail).toLowerCase();
  const fullName =
    data.patientName?.trim() ||
    asString(p.fullName || p.name || p.patientName || p.contactName) ||
    "Partner submission";
  const phone =
    data.patientPhone?.trim() ||
    asString(p.phone || p.patientPhone || p.contactPhone) ||
    "n/a";
  const dateOfBirth =
    data.patientDateOfBirth?.trim() ||
    asString(p.dateOfBirth || p.dob || p.patientDateOfBirth) ||
    "n/a";

  return { email, fullName, phone, dateOfBirth };
}

export function partnerProgramLabels(site: PartnerSite, type: PartnerIntakeType) {
  return [`Partner · ${SITE_LABELS[site]}`, type.replace(/_/g, " ")];
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
  const lines = Object.entries(input.payload).map(([key, value]) => {
    const rendered =
      value == null
        ? ""
        : typeof value === "string" || typeof value === "number" || typeof value === "boolean"
          ? String(value)
          : JSON.stringify(value);
    return `${key}: ${rendered}`;
  });

  const subject = `[${siteLabel}] ${input.type.replace(/_/g, " ")} — ${input.contact.fullName} (${input.referenceCode})`;
  const text = [
    `Partner site: ${siteLabel}`,
    `Type: ${input.type}`,
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
      : process.env.FOREVERGLOW_INTAKE_SECRET?.trim();

  const allowed = [shared, perSite].filter(Boolean) as string[];
  return allowed.some((secret) => secret === headerSecret);
}
