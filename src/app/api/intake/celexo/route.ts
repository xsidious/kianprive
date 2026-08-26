import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import {
  formatCelexoIntakeEmail,
  formatCelexoPatientConfirmation,
  getCelexoIntakeReportRecipients,
} from "@/lib/intake/celexo-email";
import { celexoIntakeSchema } from "@/lib/intake/celexo-schema";
import { generateIntakeTrackingToken } from "@/lib/intake/tracking";

const bodySchema = z.object({
  intake: celexoIntakeSchema,
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
      {
        error: "Please complete all required fields before submitting.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const session = await auth();
  const data = parsed.data.intake;
  const trackingToken = generateIntakeTrackingToken();

  let submission: { id: string; createdAt: Date; publicTrackingToken: string | null };
  try {
    submission = await prisma.therapeuticsIntakeSubmission.create({
      data: {
        userId: session?.user?.id ?? null,
        fullName: data.patient.fullName,
        email: data.patient.email.trim().toLowerCase(),
        phone: data.patient.phone,
        dateOfBirth: data.patient.dateOfBirth,
        programs: ["Korean Exosome Therapy", data.selection.protocol, data.selection.deliveryMethod],
        clientSignatureDataUrl: data.consent.signatureDataUrl,
        publicTrackingToken: trackingToken,
        status: "PENDING_REVIEW",
        payload: data as unknown as Prisma.InputJsonValue,
      },
      select: { id: true, createdAt: true, publicTrackingToken: true },
    });
  } catch (dbError) {
    console.error("[intake/celexo] Database save failed:", dbError);
    return NextResponse.json({ error: "Could not save your intake. Please try again." }, { status: 500 });
  }

  const referenceId = submission.publicTrackingToken || submission.id;

  try {
    const report = formatCelexoIntakeEmail({
      data,
      referenceId,
      submissionId: submission.id,
    });
    const recipients = getCelexoIntakeReportRecipients();
    if (recipients.length) {
      await sendTransactionalEmail({
        to: recipients,
        subject: report.subject,
        text: report.text,
        html: report.html,
      });
    }

    const patientCopy = formatCelexoPatientConfirmation({ data, referenceId });
    await sendTransactionalEmail({
      to: data.patient.email,
      subject: patientCopy.subject,
      text: patientCopy.text,
      html: patientCopy.html,
    });
  } catch (emailError) {
    console.error("[intake/celexo] Notification email failed:", emailError);
  }

  return NextResponse.json({
    ok: true,
    referenceId,
    submittedAt: submission.createdAt.toISOString(),
  });
}
