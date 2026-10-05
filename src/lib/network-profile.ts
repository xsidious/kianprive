import { PartnerStatus, PartnerType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generatePartnerCode } from "@/lib/partners";

export type NetworkKind = "partner" | "ambassador" | "practitioner";

export const partnerAccountTypes: PartnerType[] = ["CLINICAL", "BRAND", "BOTH"];

export function networkKindFromType(type: PartnerType): NetworkKind {
  if (type === "AMBASSADOR") return "ambassador";
  if (type === "PROVIDER") return "practitioner";
  return "partner";
}

export function typesForKind(kind: NetworkKind): PartnerType[] {
  if (kind === "ambassador") return ["AMBASSADOR"];
  if (kind === "practitioner") return ["PROVIDER"];
  return partnerAccountTypes;
}

export function profileWhere(userId: string, kind: NetworkKind): Prisma.PartnerProfileWhereInput {
  const types = typesForKind(kind);
  return { userId, type: types.length === 1 ? types[0] : { in: types } };
}

export async function findNetworkProfile(userId: string, kind: NetworkKind) {
  return prisma.partnerProfile.findFirst({ where: profileWhere(userId, kind) });
}

export async function attachNetworkProfile(input: {
  userId: string;
  type: PartnerType;
  displayName: string;
  phone?: string | null;
  specialty?: string | null;
  legalName?: string | null;
  status?: PartnerStatus;
  defaultServiceCommissionPct?: number;
  defaultProductCommissionPct?: number;
}) {
  const kind = networkKindFromType(input.type);
  const existing = await prisma.partnerProfile.findFirst({ where: profileWhere(input.userId, kind) });
  if (existing) {
    return { created: false as const, profile: existing };
  }

  let partnerCode = generatePartnerCode(input.displayName);
  while (await prisma.partnerProfile.findUnique({ where: { partnerCode } })) {
    partnerCode = generatePartnerCode(input.displayName);
  }

  const profile = await prisma.partnerProfile.create({
    data: {
      userId: input.userId,
      displayName: input.displayName,
      legalName: input.legalName || null,
      type: input.type,
      specialty: input.specialty || null,
      phone: input.phone || null,
      partnerCode,
      status: input.status ?? "ACTIVE",
      defaultServiceCommissionPct: input.defaultServiceCommissionPct ?? (kind === "practitioner" ? 20 : 0),
      defaultProductCommissionPct: input.defaultProductCommissionPct ?? (kind === "partner" ? 10 : kind === "ambassador" ? 10 : 10),
      onboardingComplete: true,
    },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
  });

  return { created: true as const, profile };
}
