import type { IntakeMessage, IntakeMessageAuthor } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
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

  if (submission) {
    const referenceCode = submission.publicTrackingToken || submission.id;
    const track = intakeTrackUrl({ referenceCode, email: submission.email });
    const safeBody = body
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    if (opts.notifyPatient && opts.authorRole === "PROVIDER" && submission.email) {
      try {
        await sendTransactionalEmail({
          to: submission.email,
          subject: `KIAN Privé — Update on your intake (${referenceCode})`,
          text: [
            `Hi ${submission.fullName},`,
            "",
            "Your clinical team sent a message about your intake request:",
            "",
            body,
            "",
            `Status: ${patientFacingIntakeStatus(submission.status)}`,
            `Request code: ${referenceCode}`,
            `Reply here: ${track}`,
            "",
            "— KIAN Privé Concierge",
          ].join("\n"),
          html: `<p>Hi ${submission.fullName},</p><p>Your clinical team sent a message about your intake request:</p><blockquote style="border-left:3px solid #c4a574;padding-left:12px;margin:16px 0;color:#1f1a15">${safeBody}</blockquote><p>Status: ${patientFacingIntakeStatus(submission.status)}<br/>Request code: <strong>${referenceCode}</strong></p><p><a href="${track}">View and reply</a></p><p>— KIAN Privé Concierge</p>`,
        });
      } catch (err) {
        console.error("[intake/messages] patient notify failed:", err);
      }
    }

    if (opts.authorRole === "PATIENT") {
      const staffTo = getWellnessHubReportRecipients();
      if (staffTo.length) {
        try {
          await sendTransactionalEmail({
            to: staffTo,
            subject: `[Intake reply] ${submission.fullName} (${referenceCode})`,
            text: [
              `Patient reply on intake ${referenceCode}`,
              `Patient: ${submission.fullName} <${submission.email}>`,
              "",
              body,
              "",
              `Open in portal: ${process.env.NEXTAUTH_URL || "https://www.kianprive.com"}/provider/intake/${submission.id}`,
            ].join("\n"),
            html: `<p>Patient reply on intake <strong>${referenceCode}</strong></p><p>${submission.fullName} &lt;${submission.email}&gt;</p><blockquote style="border-left:3px solid #c4a574;padding-left:12px">${safeBody}</blockquote><p><a href="${process.env.NEXTAUTH_URL || "https://www.kianprive.com"}/provider/intake/${submission.id}">Open in provider portal</a></p>`,
            replyTo: submission.email,
          });
        } catch (err) {
          console.error("[intake/messages] staff notify failed:", err);
        }
      }
    }
  }

  return serializeIntakeMessage(message);
}
