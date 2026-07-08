import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import {
  formatPeptideIntakeEmail,
  formatPeptideIntakePatientConfirmation,
  getPeptideIntakeReportRecipients,
} from "@/lib/intake/peptides-glp-email";
import { peptidesGlpIntakeSchema } from "@/lib/intake/peptides-glp-schema";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = peptidesGlpIntakeSchema.safeParse(body);
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
  const data = parsed.data;

  let submission:
    | {
        id: string;
        createdAt: Date;
      }
    | null = null;

  try {
    submission = await prisma.therapeuticsIntakeSubmission.create({
      data: {
        userId: session?.user?.id ?? null,
        fullName: data.patient.fullName,
        email: data.patient.email,
        phone: data.patient.phone,
        dateOfBirth: data.patient.dateOfBirth,
        programs: data.programs,
        payload: data,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
  } catch (dbError) {
    console.error("[intake/peptides-glp] Database save failed:", dbError);
    return NextResponse.json(
      { error: "We could not securely save your intake. Please contact concierge for assistance." },
      { status: 500 },
    );
  }

  const referenceId = submission.id;

  try {
    const report = formatPeptideIntakeEmail(data, referenceId);
    const recipients = getPeptideIntakeReportRecipients();
    if (recipients.length) {
      await sendTransactionalEmail({
        to: recipients,
        subject: report.subject,
        text: report.text,
        html: report.html,
      });
    }

    const patientCopy = formatPeptideIntakePatientConfirmation(data, referenceId);
    await sendTransactionalEmail({
      to: data.patient.email,
      subject: patientCopy.subject,
      text: patientCopy.text,
      html: patientCopy.html,
    });
  } catch (emailError) {
    console.error("[intake/peptides-glp] Notification email failed:", emailError);
  }

  return NextResponse.json({
    ok: true,
    referenceId,
    submittedAt: submission.createdAt.toISOString(),
  });
}
