import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { generateIntakeTrackingToken, intakeTrackUrl } from "@/lib/intake/tracking";
import {
  authorizePartnerIntake,
  formatPartnerIntakeStaffEmail,
  partnerIntakeEnvelopeSchema,
  partnerProgramLabels,
  resolvePartnerContact,
  SITE_LABELS,
} from "@/lib/intake/partner-intake-schema";
import { ehrPayloadStamp, resolveEhrAssignment, withPhysicianEmails } from "@/lib/ehr/route-intake";
import { physicianReviewForConditions } from "@/lib/intake/medical-review";

/**
 * Receives booking / peptide / partner-application / pro-pricing submissions
 * from Facial Design Studio and 4everglow partner Next.js sites.
 *
 * Auth: `x-partner-intake-secret` or `Authorization: Bearer …`
 * Secrets: PARTNER_INTAKE_SECRET and/or FACIAL_DESIGN_INTAKE_SECRET / FOREVERGLOW_INTAKE_SECRET
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = partnerIntakeEnvelopeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid partner intake payload.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  if (!authorizePartnerIntake(req, data.site)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const contact = resolvePartnerContact(data);
  if (!contact.email || !contact.email.includes("@")) {
    return NextResponse.json({ error: "patientEmail or payload.email is required." }, { status: 400 });
  }

  const clinicalReview = physicianReviewForConditions(data.payload);
  const trackingToken = generateIntakeTrackingToken();
  const programs = partnerProgramLabels(data.site, data.type, data.payload);

  const existingMember = await prisma.user.findFirst({
    where: {
      email: { equals: contact.email, mode: "insensitive" },
      role: { in: [Role.MEMBER, Role.GUEST] },
    },
    select: { id: true },
  });

  const payloadProvider =
    typeof data.payload.assignedProvider === "string"
      ? data.payload.assignedProvider
      : typeof data.payload.provider === "string"
        ? data.payload.provider
        : null;
  const payloadLocation = typeof data.payload.location === "string" ? data.payload.location : null;
  const assignment = await resolveEhrAssignment(prisma, {
    site: data.site,
    source: data.site,
    location: payloadLocation,
    assignedProvider: payloadProvider,
  });

  let submission: { id: string; createdAt: Date; publicTrackingToken: string | null };
  try {
    submission = await prisma.therapeuticsIntakeSubmission.create({
      data: {
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        dateOfBirth: contact.dateOfBirth,
        programs,
        referredBy: data.referralCode?.trim() || null,
        assignedPartnerId: assignment.assignedPartnerId,
        userId: existingMember?.id ?? null,
        publicTrackingToken: trackingToken,
        status: clinicalReview.status,
        statusNote: clinicalReview.statusNote,
        payload: ehrPayloadStamp(assignment, {
          source: data.site,
          site: data.site,
          siteLabel: SITE_LABELS[data.site],
          type: data.type,
          externalRef: data.externalRef ?? null,
          referralCode: data.referralCode ?? null,
          ...data.payload,
        }),
      },
      select: { id: true, createdAt: true, publicTrackingToken: true },
    });
  } catch (dbError) {
    console.error("[intake/partner] Database save failed:", dbError);
    return NextResponse.json({ error: "Could not save partner submission." }, { status: 500 });
  }

  const referenceCode = submission.publicTrackingToken || submission.id;
  const trackUrl = intakeTrackUrl({ referenceCode, email: contact.email });

  try {
    const report = formatPartnerIntakeStaffEmail({
      site: data.site,
      type: data.type,
      referenceCode,
      contact,
      referralCode: data.referralCode,
      externalRef: data.externalRef,
      payload: data.payload,
    });
    const staffTo = [
      process.env.PARTNER_INTAKE_REPORT_EMAIL,
      process.env.RESEND_TO_EMAIL,
      "consultations@kianprive.com",
    ]
      .filter(Boolean)
      .flatMap((value) => String(value).split(",").map((part) => part.trim()).filter(Boolean));

    await sendTransactionalEmail({
      to: withPhysicianEmails(staffTo, assignment.physicianEmails),
      subject: report.subject,
      text: `${report.text}\n\nInternal submission id: ${submission.id}\nTrack: ${trackUrl}`,
      html: report.html,
      replyTo: contact.email,
    });
  } catch (emailError) {
    console.error("[intake/partner] Notification email failed:", emailError);
  }

  return NextResponse.json({
    ok: true,
    referenceId: referenceCode,
    submissionId: submission.id,
    trackingToken: referenceCode,
    trackUrl,
    hasAccount: Boolean(existingMember),
    submittedAt: submission.createdAt.toISOString(),
  });
}
