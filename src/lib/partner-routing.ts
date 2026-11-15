/**
 * Business routing rules for partner sites (from Alycia / KIAN ops).
 */
export type PartnerSiteKey =
  | "kian-prive"
  | "facial-design"
  | "4everglow"
  | "threefold-strength"
  | "hope-and-haven";

export type PartnerRoutingKind =
  | "processor"
  | "clinic_via_kian"
  | "clinic_own_md_telehealth"
  | "referral_partner";

export type PartnerRoutingProfile = {
  site: PartnerSiteKey;
  kind: PartnerRoutingKind;
  label: string;
  routingNote: string;
  intakesViaKian: boolean;
  isClinic: boolean;
  hasOwnDoctor: boolean;
  usesTelehealthOtherStates: boolean;
};

export const PARTNER_ROUTING: Record<PartnerSiteKey, PartnerRoutingProfile> = {
  "kian-prive": {
    site: "kian-prive",
    kind: "processor",
    label: "KIAN Privé",
    routingNote:
      "Clinical processor: telemedicine, bloodwork/labs, therapy, payment. Paid Rx forwards to Wellness Tech → VitaRelay.",
    intakesViaKian: true,
    isClinic: true,
    hasOwnDoctor: true,
    usesTelehealthOtherStates: true,
  },
  "facial-design": {
    site: "facial-design",
    kind: "clinic_via_kian",
    label: "Facial Design Studio",
    routingNote: "Partner clinic — goes through KIAN Privé first, then Wellness Tech fulfillment.",
    intakesViaKian: true,
    isClinic: true,
    hasOwnDoctor: true,
    usesTelehealthOtherStates: false,
  },
  "threefold-strength": {
    site: "threefold-strength",
    kind: "clinic_via_kian",
    label: "Threefold Strength",
    routingNote: "Partner clinic — goes through KIAN Privé first, then Wellness Tech fulfillment.",
    intakesViaKian: true,
    isClinic: true,
    hasOwnDoctor: true,
    usesTelehealthOtherStates: false,
  },
  "4everglow": {
    site: "4everglow",
    kind: "clinic_own_md_telehealth",
    label: "4everglow",
    routingNote:
      "Own doctor on site for in-state care; out-of-state patients use telehealth. Intakes still process on KIAN.",
    intakesViaKian: true,
    isClinic: true,
    hasOwnDoctor: true,
    usesTelehealthOtherStates: true,
  },
  "hope-and-haven": {
    site: "hope-and-haven",
    kind: "referral_partner",
    label: "Hope & Haven International",
    routingNote: "Not a clinic. Referral / program partner — patients are processed by KIAN Privé.",
    intakesViaKian: true,
    isClinic: false,
    hasOwnDoctor: false,
    usesTelehealthOtherStates: false,
  },
};

export function partnerRoutingFor(site: string | null | undefined): PartnerRoutingProfile {
  const key = String(site || "kian-prive") as PartnerSiteKey;
  return PARTNER_ROUTING[key] || PARTNER_ROUTING["kian-prive"];
}
