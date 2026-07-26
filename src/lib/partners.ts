import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function generatePartnerCode(displayName: string) {
  const base = displayName
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || "PARTNER"}${suffix}`;
}

/** Resolve partner for a booking from service assignments; prefer unique match. */
export async function resolvePartnerIdForServices(serviceIds: string[], preferredName?: string | null) {
  if (!serviceIds.length) return null;

  const assignments = await prisma.partnerServiceAssignment.findMany({
    where: {
      active: true,
      serviceSlug: { in: serviceIds },
      partner: { status: "ACTIVE" },
    },
    include: { partner: true },
  });

  if (!assignments.length) return null;

  const uniquePartnerIds = [...new Set(assignments.map((a) => a.partnerId))];
  if (uniquePartnerIds.length === 1) return uniquePartnerIds[0] ?? null;

  if (preferredName) {
    const normalized = preferredName.toLowerCase();
    const match = assignments.find(
      (a) =>
        a.partner.displayName.toLowerCase().includes(normalized) ||
        (a.partner.legalName ?? "").toLowerCase().includes(normalized),
    );
    if (match) return match.partnerId;
  }

  return null;
}

export async function writeAuditLog(input: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? undefined,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? undefined,
        metadata: input.metadata
          ? (input.metadata as Prisma.InputJsonValue)
          : undefined,
      },
    });
  } catch (error) {
    console.error("[audit]", error);
  }
}
