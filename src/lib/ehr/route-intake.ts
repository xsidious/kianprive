import { Prisma, type PrismaClient } from "@prisma/client";
import {
  WELLNESS_TECH_EHR,
  defaultPrescriber,
  findClinicianByName,
  matchEhrLocation,
  locationPrescribers,
  type EhrClinician,
  type EhrLocation,
} from "@/lib/ehr/locations";

type Db = PrismaClient | Prisma.TransactionClient;

export type EhrAssignment = {
  hub: typeof WELLNESS_TECH_EHR;
  locationId: string;
  locationLabel: string;
  assignedProviderName: string;
  assignedRole: string;
  assignedPartnerId: string | null;
  physicianEmails: string[];
};

function pickPrescriber(location: EhrLocation, assignedProvider?: string | null) {
  const named = findClinicianByName(assignedProvider);
  if (named?.clinician.canPrescribe) return named.clinician;
  return defaultPrescriber(location);
}

async function partnerIdForClinician(db: Db, clinician: EhrClinician) {
  const email = clinician.emails.map((item) => item.toLowerCase());
  const partner = await db.partnerProfile.findFirst({
    where: {
      type: "PROVIDER",
      status: "ACTIVE",
      OR: [
        clinician.partnerCodes.length ? { partnerCode: { in: clinician.partnerCodes } } : undefined,
        email.length ? { user: { email: { in: email } } } : undefined,
        { displayName: { contains: clinician.name.replace(/^Dr\.\s*/i, ""), mode: "insensitive" } },
      ].filter(Boolean) as Prisma.PartnerProfileWhereInput[],
    },
    select: { id: true },
  });
  return partner?.id ?? null;
}

export async function resolveEhrAssignment(
  db: Db,
  input: {
    site?: string | null;
    source?: string | null;
    location?: string | null;
    assignedProvider?: string | null;
  },
): Promise<EhrAssignment> {
  const explicit = input.location?.trim() ? matchEhrLocation([input.location]) : null;
  const fromSite = matchEhrLocation([input.site, input.source]);
  const named = findClinicianByName(input.assignedProvider);
  const location = explicit ?? fromSite ?? named?.location ?? matchEhrLocation(["kian"])!;
  const namedHere =
    named && named.location.id === location.id
      ? named.clinician
      : location.clinicians.find((clinician) => clinician.name === named?.clinician.name) ?? null;
  let prescriber =
    namedHere?.canPrescribe ? namedHere : pickPrescriber(location, namedHere ? input.assignedProvider : null);

  // A named physician without a portal login still needs a chart owner.
  // Fall back to the location medical director so the case is reviewable.
  let assignedPartnerId = prescriber ? await partnerIdForClinician(db, prescriber) : null;
  if (!assignedPartnerId) {
    const backup = defaultPrescriber(location);
    if (backup && backup.name !== prescriber?.name) {
      const backupId = await partnerIdForClinician(db, backup);
      if (backupId) {
        assignedPartnerId = backupId;
        if (!prescriber) prescriber = backup;
      }
    }
  }

  const notify = new Set<string>();
  for (const clinician of locationPrescribers(location)) {
    for (const email of clinician.emails) notify.add(email.toLowerCase());
  }
  if (prescriber) {
    for (const email of prescriber.emails) notify.add(email.toLowerCase());
  }

  return {
    hub: WELLNESS_TECH_EHR,
    locationId: location.id,
    locationLabel: location.label,
    assignedProviderName: prescriber?.name ?? "Assigned physician",
    assignedRole: prescriber?.role ?? "physician",
    assignedPartnerId,
    physicianEmails: [...notify],
  };
}

export function ehrPayloadStamp(assignment: EhrAssignment, extra?: Record<string, unknown>) {
  return {
    ...extra,
    ehrHub: assignment.hub,
    ehrLocationId: assignment.locationId,
    ehrLocationLabel: assignment.locationLabel,
    assignedProvider: assignment.assignedProviderName,
    assignedPrescriberRole: assignment.assignedRole,
  };
}

export function withPhysicianEmails(existing: string[], physicianEmails: string[]) {
  return [...new Set([...existing, ...physicianEmails].map((email) => email.trim().toLowerCase()).filter(Boolean))];
}

export function intakeVisibleWhere(partnerId: string, locationIds: string[]): Prisma.TherapeuticsIntakeSubmissionWhereInput {
  const or: Prisma.TherapeuticsIntakeSubmissionWhereInput[] = [{ assignedPartnerId: partnerId }];
  for (const locationId of locationIds) {
    or.push({ payload: { path: ["ehrLocationId"], equals: locationId } });
  }
  if (locationIds.includes("kian")) {
    or.push({
      AND: [{ assignedPartnerId: null }, { payload: { path: ["source"], equals: "wellness-hub" } }],
    });
  }
  return { OR: or };
}

export const PRESCRIBING_STATUSES = ["NEEDS_LABS", "APPROVED"] as const;
