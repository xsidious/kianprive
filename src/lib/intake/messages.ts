import type { IntakeMessage, IntakeMessageAuthor, IntakeSubmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { buildIntakeUpdateEmail, buildSimpleEmail } from "@/lib/email-templates";
import {
  intakeTrackUrl,
  patientFacingIntakeStatus,
} from "@/lib/intake/tracking";
import { getWellnessHubReportRecipients } from "@/lib/intake/wellness-hub-schema";

export type PublicIntakeMessage = {
  id: string;
  authorRole: IntakeMessageAuthor;
  authorLabel: string;
  body: string;
  createdAt: string;
};

export function serializeIntakeMessage(row: IntakeMessage): PublicIntakeMessage {
  const authorLabel =
    row.authorRole === "PROVIDER"
      ? row.authorName?.trim() || "Clinical team"
      : row.authorRole === "PATIENT"
        ? row.authorName?.trim() || "You"
        : "System";

  return {
    id: row.id,
    authorRole: row.authorRole,
    authorLabel,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listIntakeMessages(intakeSubmissionId: string) {
  const rows = await prisma.intakeMessage.findMany({
    where: { intakeSubmissionId },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return rows.map(serializeIntakeMessage);
}

export async function createIntakeMessage(opts: {
  intakeSubmissionId: string;
  authorRole: IntakeMessageAuthor;
  body: string;
  authorUserId?: string | null;
  authorName?: string | null;
  /** Mirror latest clinical ask onto statusNote for older UIs */
  syncStatusNote?: boolean;
  notifyPatient?: boolean;
  /** Direct pay link included in patient email when therapy is invoiced */
  paymentUrl?: string | null;
}) {
  const body = opts.body.trim();
  if (!body) throw new Error("Message body is required.");

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.intakeMessage.create({
      data: {
        intakeSubmissionId: opts.intakeSubmissionId,
        authorRole: opts.authorRole,
        authorUserId: opts.authorUserId ?? null,
        authorName: opts.authorName?.trim() || null,
        body,
      },
    });

    if (opts.syncStatusNote && opts.authorRole === "PROVIDER") {
      await tx.therapeuticsIntakeSubmission.update({
        where: { id: opts.intakeSubmissionId },
        data: { statusNote: body },
      });
    } else {
      await tx.therapeuticsIntakeSubmission.update({
        where: { id: opts.intakeSubmissionId },
        data: { updatedAt: new Date() },
      });
    }

    return created;
  });

  const submission = await prisma.therapeuticsIntakeSubmission.findUnique({
    where: { id: opts.intakeSubmissionId },
    select: {
      email: true,
      fullName: true,
      status: true,
      publicTrackingToken: true,
      id: true,
    },
  });

  // Return the message immediately; notify in the background so the UI can update right away.
  void notifyIntakeMessageParties({
    submission,
    body,
    authorRole: opts.authorRole,
    notifyPatient: Boolean(opts.notifyPatient),
    paymentUrl: opts.paymentUrl,
  });

  return serializeIntakeMessage(message);
}

async function notifyIntakeMessageParties(opts: {
  submission: {
    id: string;
    email: string;
    fullName: string;
    status: IntakeSubmissionStatus;
    publicTrackingToken: string | null;
  } | null;
  body: string;
  authorRole: IntakeMessageAuthor;
  notifyPatient: boolean;
  paymentUrl?: string | null;
}) {
  const submission = opts.submission;
  if (!submission) return;

  const referenceCode = submission.publicTrackingToken || submission.id;
  const track = intakeTrackUrl({ referenceCode, email: submission.email });

  if (opts.notifyPatient && opts.authorRole === "PROVIDER" && submission.email) {
    try {
      const content = buildIntakeUpdateEmail({
        fullName: submission.fullName,
        body: opts.body,
        statusLabel: patientFacingIntakeStatus(submission.status),
        referenceCode,
        trackUrl: track,
        paymentUrl: opts.paymentUrl,
      });
      await sendTransactionalEmail({
        to: submission.email,
        subject: `KIAN Privé — ${content.subject}`,
        text: content.text,
        html: content.html,
      });
    } catch (err) {
      console.error("[intake/messages] patient notify failed:", err);
    }
  }

  if (opts.authorRole === "PATIENT") {
    const staffTo = getWellnessHubReportRecipients();
    if (!staffTo.length) return;
    try {
      await sendTransactionalEmail({
        to: staffTo,
        subject: `[Intake reply] ${submission.fullName} (${referenceCode})`,
        text: [
          `Patient reply on intake ${referenceCode}`,
          `Patient: ${submission.fullName} <${submission.email}>`,
          "",
          opts.body,
          "",
          `Open in portal: ${process.env.NEXTAUTH_URL || "https://www.kianprive.com"}/provider/intake/${submission.id}`,
        ].join("\n"),
        html: buildSimpleEmail({
          title: "Patient intake reply",
          preheader: `${submission.fullName} replied on ${referenceCode}`,
          paragraphs: [
            `Patient reply on intake ${referenceCode}.`,
            `${submission.fullName} <${submission.email}>`,
            opts.body,
          ],
          button: {
            href: `${process.env.NEXTAUTH_URL || "https://www.kianprive.com"}/provider/intake/${submission.id}`,
            label: "Open in portal",
          },
        }),
        replyTo: submission.email,
      });
    } catch (err) {
      console.error("[intake/messages] staff notify failed:", err);
    }
  }
}
