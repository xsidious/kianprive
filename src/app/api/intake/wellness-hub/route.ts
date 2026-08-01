import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import {
  CARMEN_PROVIDER_CODE,
  formatWellnessHubIntakeEmail,
  formatWellnessHubPatientConfirmation,
  getWellnessHubReportRecipients,
  wellnessHubIntakeSchema,
} from "@/lib/intake/wellness-hub-schema";
import { generateIntakeTrackingToken, intakeTrackUrl } from "@/lib/intake/tracking";
import { Role } from "@prisma/client";

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
 * (privetherapeutics.solutions) — stores in Clinical Intake and emails staff + Carmen.
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
  const assignedProvider = data.assignedProvider?.trim() || "Dr. Carmen Ramirez";
  const trackingToken = generateIntakeTrackingToken();

  const carmen = await prisma.partnerProfile.findFirst({
    where: {
      OR: [
        { partnerCode: CARMEN_PROVIDER_CODE },
        { displayName: { contains: "Carmen Ramirez", mode: "insensitive" } },
        { user: { email: "carmen.ramirez@kianprive.com" } },
      ],
      type: "PROVIDER",
    },
    select: { id: true },
  });

  const existingMember = await prisma.user.findFirst({
    where: {
      email: { equals: data.email.trim().toLowerCase(), mode: "insensitive" },
      role: { in: [Role.MEMBER, Role.GUEST] },
    },
    select: { id: true },
  });

  let submission: { id: string; createdAt: Date; publicTrackingToken: string | null };
  try {
    submission = await prisma.therapeuticsIntakeSubmission.create({
      data: {
        fullName: data.fullName,
        email: data.email.trim().toLowerCase(),
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        programs: ["Provider Connect / Wellness Hub", "Compound Therapy"],
        referredBy: data.referredBy || null,
        clientSignatureDataUrl: data.clientSignatureDataUrl,
        assignedPartnerId: carmen?.id ?? null,
        userId: existingMember?.id ?? null,
        publicTrackingToken: trackingToken,
        status: "PENDING_REVIEW",
        payload: {
          source: "wellness-hub",
          site: "privetherapeutics.solutions",
          ...data,
          assignedProvider,
        },
      },
      select: { id: true, createdAt: true, publicTrackingToken: true },
    });
  } catch (dbError) {
    console.error("[intake/wellness-hub] Database save failed:", dbError);
    return NextResponse.json({ error: "Could not save intake submission." }, { status: 500 });
  }

  const referenceId = submission.id;
  const trackUrl = intakeTrackUrl(referenceId, submission.publicTrackingToken);

  try {
    const report = formatWellnessHubIntakeEmail({ ...data, assignedProvider }, referenceId);
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

    const patientCopy = formatWellnessHubPatientConfirmation(
      { ...data, assignedProvider },
      referenceId,
      trackUrl,
    );
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
    trackingToken: submission.publicTrackingToken,
    trackUrl,
    hasAccount: Boolean(existingMember),
    submittedAt: submission.createdAt.toISOString(),
  });
}
