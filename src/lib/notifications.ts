import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "THERAPY_READY"
  | "PAYMENT_RECEIVED"
  | "INTAKE_MESSAGE"
  | "PATIENT_REPLY"
  | "ORDER_UPDATE"
  | "GENERIC";

export async function createUserNotification(input: {
  userId: string;
  type: NotificationType | string;
  title: string;
  body: string;
  href?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  if (!input.userId) return null;
  return prisma.userNotification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title.trim().slice(0, 160),
      body: input.body.trim().slice(0, 500),
      href: input.href?.trim() || null,
      metadata: input.metadata ?? undefined,
    },
  });
}

export async function notifyUserByEmail(
  email: string | null | undefined,
  input: Omit<Parameters<typeof createUserNotification>[0], "userId">,
) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return null;
  const user = await prisma.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
    select: { id: true },
  });
  if (!user) return null;
  return createUserNotification({ ...input, userId: user.id });
}

export async function notifyUsersByIds(
  userIds: Array<string | null | undefined>,
  input: Omit<Parameters<typeof createUserNotification>[0], "userId">,
) {
  const unique = [...new Set(userIds.filter((id): id is string => Boolean(id)))];
  await Promise.all(unique.map((userId) => createUserNotification({ ...input, userId })));
}

/** Staff inboxes: assigned provider user + admins/ops. */
export async function notifyClinicalStaff(input: {
  intakeSubmissionId?: string | null;
  partnerId?: string | null;
  type: NotificationType | string;
  title: string;
  body: string;
  href?: string | null;
}) {
  const userIds: string[] = [];

  if (input.partnerId) {
    const partner = await prisma.partnerProfile.findUnique({
      where: { id: input.partnerId },
      select: { userId: true },
    });
    if (partner?.userId) userIds.push(partner.userId);
  } else if (input.intakeSubmissionId) {
    const intake = await prisma.therapeuticsIntakeSubmission.findUnique({
      where: { id: input.intakeSubmissionId },
      select: { assignedPartnerId: true, assignedPartner: { select: { userId: true } } },
    });
    if (intake?.assignedPartner?.userId) userIds.push(intake.assignedPartner.userId);
  }

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "OPERATIONS"] } },
    select: { id: true },
    take: 40,
  });
  for (const admin of admins) userIds.push(admin.id);

  await notifyUsersByIds(userIds, {
    type: input.type,
    title: input.title,
    body: input.body,
    href: input.href,
  });
}

export function serializeNotification(row: {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    unread: !row.readAt,
  };
}
