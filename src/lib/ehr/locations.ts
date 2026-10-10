/**
 * Wellness Tech EHR is the central chart. Each location keeps its own
 * clinicians, and a copy of every patient record lands in this database.
 * Only a medical director or supervising physician may prescribe peptides
 * or order lab work.
 */

export const WELLNESS_TECH_EHR = "Wellness Tech EHR";

export type EhrClinicianRole =
  | "medical-director"
  | "physician"
  | "medical-advisor"
  | "administrator"
  | "nurse";

export type EhrClinician = {
  name: string;
  role: EhrClinicianRole;
  canPrescribe: boolean;
  emails: string[];
  partnerCodes: string[];
  aliases: string[];
};

export type EhrLocation = {
  id: string;
  label: string;
  aliases: string[];
  clinicians: EhrClinician[];
};

export const EHR_LOCATIONS: EhrLocation[] = [
  {
    id: "kian",
    label: "KIAN",
    aliases: ["kian", "kian prive", "kianprive", "wellness-hub", "wellness hub", "privetherapeutics", "celexo"],
    clinicians: [
      {
        name: "Dr. Carmen Ramirez",
        role: "medical-director",
        canPrescribe: true,
        emails: ["carmen.ramirez@kianprive.com", "carmenramirezmd@yahoo.com", "millenniumedgemed@gmail.com"],
        partnerCodes: ["CARMENRAM"],
        aliases: ["dr. carmen", "carmen ramirez", "dr carmen"],
      },
      {
        name: "Alycia Lerer",
        role: "administrator",
        canPrescribe: false,
        emails: [],
        partnerCodes: [],
        aliases: ["alycia lerer", "alycia"],
      },
    ],
  },
  {
    id: "facial-aesthetics",
    label: "Facial aesthetics",
    aliases: ["facial aesthetics", "facial-design", "facial design", "facial design studio"],
    clinicians: [
      {
        name: "Dr. Karl Rayan",
        role: "physician",
        canPrescribe: true,
        emails: ["karl.ryan@kianprive.com"],
        partnerCodes: ["KARLRYAN"],
        aliases: ["karl rayan", "karl ryan", "dr. karl"],
      },
      {
        name: "Dr. Carmen Ramirez",
        role: "medical-advisor",
        canPrescribe: true,
        emails: ["carmen.ramirez@kianprive.com", "carmenramirezmd@yahoo.com", "millenniumedgemed@gmail.com"],
        partnerCodes: ["CARMENRAM"],
        aliases: ["carmen ramirez", "dr. carmen ramirez"],
      },
    ],
  },
  {
    id: "joa",
    label: "JOA",
    aliases: ["joa"],
    clinicians: [
      {
        name: "Dr. Chyle Beaird",
        role: "medical-director",
        canPrescribe: true,
        emails: ["chyle.beaird@kianprive.com"],
        partnerCodes: ["CHYLEBEAIRD"],
        aliases: ["chyle beaird", "dr. chyle"],
      },
      {
        name: "Dr. James Lee",
        role: "physician",
        canPrescribe: true,
        emails: [],
        partnerCodes: [],
        aliases: ["james lee", "dr. james lee"],
      },
    ],
  },
  {
    id: "4everglow",
    label: "4EverGlow",
    aliases: ["4everglow", "4ever glow", "foreverglow", "4 ever glow"],
    clinicians: [
      {
        name: "Dr. Carmen Ramirez",
        role: "medical-director",
        canPrescribe: true,
        emails: ["carmen.ramirez@kianprive.com", "carmenramirezmd@yahoo.com", "millenniumedgemed@gmail.com"],
        partnerCodes: ["CARMENRAM"],
        aliases: ["carmen ramirez", "dr. carmen ramirez"],
      },
      {
        name: "Masha Meshkin, RN",
        role: "nurse",
        canPrescribe: false,
        emails: [],
        partnerCodes: [],
        aliases: ["masha meshkin", "masha"],
      },
    ],
  },
  {
    id: "threefold-strength",
    label: "Threefold Strength",
    aliases: ["threefold", "threefold strength", "three fold strength", "threefoldwellness"],
    clinicians: [
      {
        name: "Dr. Carmen Ramirez",
        role: "medical-director",
        canPrescribe: true,
        emails: ["carmen.ramirez@kianprive.com", "carmenramirezmd@yahoo.com", "millenniumedgemed@gmail.com"],
        partnerCodes: ["CARMENRAM"],
        aliases: ["carmen ramirez", "dr. carmen ramirez", "carmen teresa ramirez"],
      },
      {
        name: "Shane Shuckerow",
        role: "medical-advisor",
        canPrescribe: false,
        emails: [],
        partnerCodes: [],
        aliases: ["shane shuckerow", "shane"],
      },
    ],
  },
];

const ROLE_RANK: Record<EhrClinicianRole, number> = {
  "medical-director": 0,
  physician: 1,
  "medical-advisor": 2,
  administrator: 3,
  nurse: 4,
};

export function normalizeEhrKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function matchEhrLocation(hints: Array<string | null | undefined>) {
  const keys = hints.map((hint) => (hint ? normalizeEhrKey(hint) : "")).filter(Boolean);
  if (!keys.length) return null;
  for (const location of EHR_LOCATIONS) {
    const aliases = [location.id, location.label, ...location.aliases].map(normalizeEhrKey);
    if (keys.some((key) => aliases.some((alias) => key === alias || key.includes(alias) || alias.includes(key)))) {
      return location;
    }
  }
  return null;
}

export function findEhrLocation(hints: Array<string | null | undefined>) {
  return matchEhrLocation(hints) ?? EHR_LOCATIONS[0];
}

export function findClinicianByName(name: string | null | undefined) {
  const key = name ? normalizeEhrKey(name) : "";
  if (!key) return null;
  for (const location of EHR_LOCATIONS) {
    for (const clinician of location.clinicians) {
      const aliases = [clinician.name, ...clinician.aliases].map(normalizeEhrKey);
      if (aliases.some((alias) => key === alias || key.includes(alias) || alias.includes(key))) {
        return { location, clinician };
      }
    }
  }
  return null;
}

export function locationPrescribers(location: EhrLocation) {
  return location.clinicians
    .filter((clinician) => clinician.canPrescribe)
    .sort((a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role]);
}

export function defaultPrescriber(location: EhrLocation) {
  return locationPrescribers(location)[0] ?? null;
}

export function clinicianMatchesPartner(
  clinician: EhrClinician,
  partner: { displayName?: string | null; partnerCode?: string | null; email?: string | null },
) {
  const code = partner.partnerCode?.trim().toUpperCase();
  if (code && clinician.partnerCodes.includes(code)) return true;
  const email = partner.email?.trim().toLowerCase();
  if (email && clinician.emails.some((item) => item.toLowerCase() === email)) return true;
  const name = partner.displayName ? normalizeEhrKey(partner.displayName) : "";
  if (!name) return false;
  return [clinician.name, ...clinician.aliases]
    .map(normalizeEhrKey)
    .some((alias) => name.includes(alias) || alias.includes(name));
}

export function accessForPartner(partner: {
  displayName?: string | null;
  partnerCode?: string | null;
  email?: string | null;
}) {
  const hits = EHR_LOCATIONS.flatMap((location) =>
    location.clinicians
      .filter((clinician) => clinicianMatchesPartner(clinician, partner))
      .map((clinician) => ({ location, clinician })),
  );
  return {
    charted: hits.length > 0,
    canPrescribe: hits.length ? hits.some((hit) => hit.clinician.canPrescribe) : true,
    locationIds: [...new Set(hits.map((hit) => hit.location.id))],
    roleLabel: hits[0]?.clinician.role ?? null,
  };
}
