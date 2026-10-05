import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { ehrPayloadStamp, resolveEhrAssignment, withPhysicianEmails } from "@/lib/ehr/route-intake";
import {
  formatIcooneIntakeEmail,
  formatIcoonePatientConfirmation,
  getIcooneIntakeReportRecipients,
} from "@/lib/intake/icoone-email";
import { icooneIntakeSchema } from "@/lib/intake/icoone-schema";
import { physicianReviewForConditions } from "@/lib/intake/medical-review";
import { generateIntakeTrackingToken } from "@/lib/intake/tracking";

const bodySchema = z.object({
  intake: icooneIntakeSchema,
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Please complete all required fields before submitting." },
      { status: 400 },
    );
  }

  const session = await auth();
  const data = parsed.data.intake;
  const clinicalReview = physicianReviewForConditions(data);
  const trackingToken = generateIntakeTrackingToken();
  const assignment = await resolveEhrAssignment(prisma, { site: "kian", source: "icoone" });

  let submission: { id: string; createdAt: Date; publicTrackingToken: string | null };
  try {
    submission = await prisma.therapeuticsIntakeSubmission.create({
      data: {
        userId: session?.user?.id ?? null,
        fullName: data.patient.fullName,
        email: data.patient.email.trim().toLowerCase(),
        phone: data.patient.phone,
        dateOfBirth: data.patient.dateOfBirth,
        programs: ["Icoone Lymphatic Drainage"],
        referredBy: data.referralName || null,
        publicTrackingToken: trackingToken,
        status: clinicalReview.status,
        statusNote: clinicalReview.statusNote,
        assignedPartnerId: assignment.assignedPartnerId,
        payload: ehrPayloadStamp(assignment, data as unknown as Record<string, unknown>) as Prisma.InputJsonValue,
      },
      select: { id: true, createdAt: true, publicTrackingToken: true },
    });
  } catch (dbError) {
    console.error("[intake/icoone] Database save failed:", dbError);
    return NextResponse.json({ error: "Could not save your intake. Please try again." }, { status: 500 });
  }

  const referenceId = submission.publicTrackingToken || submission.id;
  try {
    const report = formatIcooneIntakeEmail({ data, referenceId });
    const recipients = getIcooneIntakeReportRecipients();
    if (recipients.length) {
      await sendTransactionalEmail({
        to: withPhysicianEmails(recipients, assignment.physicianEmails),
        subject: report.subject,
        text: clinicalReview.statusNote ? `${report.text}\n\n${clinicalReview.statusNote}` : report.text,
        html: report.html,
      });
    }
    const patientCopy = formatIcoonePatientConfirmation({ data, referenceId });
    await sendTransactionalEmail({
      to: data.patient.email,
      subject: patientCopy.subject,
      text: patientCopy.text,
      html: patientCopy.html,
    });
  } catch (emailError) {
    console.error("[intake/icoone] Notification email failed:", emailError);
  }

  return NextResponse.json({
    ok: true,
    referenceId,
    submittedAt: submission.createdAt.toISOString(),
  });
}
