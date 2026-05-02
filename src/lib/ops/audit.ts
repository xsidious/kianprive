import { prisma } from "@/lib/prisma";

type AuditPayload = {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function writeAuditLog(payload: AuditPayload) {
  return prisma.auditLog.create({
    data: {
      userId: payload.userId ?? undefined,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId ?? undefined,
      metadata: payload.metadata ?? {},
      ipAddress: payload.ipAddress ?? undefined,
      userAgent: payload.userAgent ?? undefined,
    },
  });
}
