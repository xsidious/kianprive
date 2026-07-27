import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import {
  formatWellnessHubIntakeEmail,
  formatWellnessHubPatientConfirmation,
  getWellnessHubReportRecipients,
  wellnessHubIntakeSchema,
} from "@/lib/intake/wellness-hub-schema";

function authorizeWellnessHub(req: Request) {
  const expected = process.env.WELLNESS_HUB_INTAKE_SECRET?.trim();
  if (!expected) return false;

  const headerSecret =
    req.headers.get("x-wellness-hub-secret")?.trim() ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

  return Boolean(headerSecret && headerSecret === expected);
}

/**
 * Receives Provider Connect intake submissions from Wellness Hub
 * (privetherapeutics.solutions) — stores in Clinical Intake and emails staff.
 *
 * Auth: `x-wellness-hub-secret` or `Authorization: Bearer <WELLNESS_HUB_INTAKE_SECRET>`
 */
export async function POST(req: Request) {
  if (!authorizeWellnessHub(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = wellnessHubIntakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid intake payload.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  let submission: { id: string; createdAt: Date };
  try {
    submission = await prisma.therapeuticsIntakeSubmission.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        programs: ["Provider Connect / Wellness Hub", "Compound Therapy"],
        payload: {
          source: "wellness-hub",
          site: "privetherapeutics.solutions",
          ...data,
        },
      },
      select: { id: true, createdAt: true },
    });
  } catch (dbError) {
    console.error("[intake/wellness-hub] Database save failed:", dbError);
    return NextResponse.json({ error: "Could not save intake submission." }, { status: 500 });
  }

  const referenceId = submission.id;

  try {
    const report = formatWellnessHubIntakeEmail(data, referenceId);
    const recipients = getWellnessHubReportRecipients();
    const staffTo =
      recipients.length > 0
        ? recipients
        : [process.env.RESEND_TO_EMAIL || "consultations@kianprive.com"];

    await sendTransactionalEmail({
      to: staffTo,
      subject: report.subject,
      text: report.text,
      html: report.html,
      replyTo: data.email,
    });

    const patientCopy = formatWellnessHubPatientConfirmation(data, referenceId);
    await sendTransactionalEmail({
      to: data.email,
      subject: patientCopy.subject,
      text: patientCopy.text,
      html: patientCopy.html,
    });
  } catch (emailError) {
    console.error("[intake/wellness-hub] Notification email failed:", emailError);
  }

  return NextResponse.json({
    ok: true,
    referenceId,
    submittedAt: submission.createdAt.toISOString(),
  });
}
