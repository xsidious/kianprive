import { NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { chargeAuthorizeNetCard, isTherapyPaymentTestMode } from "@/lib/authorize-net";
import {
  formatWellnessHubIntakeEmail,
  formatWellnessHubPatientConfirmation,
  getWellnessHubReportRecipients,
  wellnessHubIntakeSchema,
} from "@/lib/intake/wellness-hub-schema";
import { generateIntakeTrackingToken, intakeTrackUrl } from "@/lib/intake/tracking";
import { ehrPayloadStamp, resolveEhrAssignment, withPhysicianEmails } from "@/lib/ehr/route-intake";
import { INTAKE_REVIEW_FEE_LABEL, INTAKE_REVIEW_FEE_USD } from "@/lib/intake/review-fee";

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

  const envelope = z
    .object({
      intake: wellnessHubIntakeSchema,
      opaqueData: z.object({
        dataDescriptor: z.string().min(1),
        dataValue: z.string().min(1),
      }),
      billTo: z
        .object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          zip: z.string().optional(),
        })
        .optional(),
      testCardNumber: z.string().optional(),
    })
    .safeParse(body);

  if (!envelope.success) {
    const intakeOnly = wellnessHubIntakeSchema.safeParse(body);
    return NextResponse.json(
      {
        error: intakeOnly.success
          ? `Pay the $${INTAKE_REVIEW_FEE_USD} provider review deposit before this intake can be sent to the physician.`
          : "Invalid intake payload.",
        fieldErrors: envelope.error.flatten().fieldErrors,
      },
      { status: intakeOnly.success ? 402 : 400 },
    );
  }

  const data = envelope.data.intake;
  const invoiceNumber = `KP-HUB-${Date.now()}`;
  const testMode = isTherapyPaymentTestMode();
  const [firstName, ...lastParts] = data.fullName.trim().split(/\s+/);

  let charge: Awaited<ReturnType<typeof chargeAuthorizeNetCard>>;
  try {
    charge = await chargeAuthorizeNetCard({
      amount: INTAKE_REVIEW_FEE_USD,
      orderNumber: invoiceNumber,
      opaqueData: envelope.data.opaqueData,
      email: data.email,
      billTo: {
        firstName: envelope.data.billTo?.firstName || firstName,
        lastName: envelope.data.billTo?.lastName || lastParts.join(" "),
        zip: envelope.data.billTo?.zip,
      },
      testCardNumber: envelope.data.testCardNumber,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment failed.";
    return NextResponse.json({ error: message }, { status: 402 });
  }
  const trackingToken = generateIntakeTrackingToken();
  const assignment = await resolveEhrAssignment(prisma, {
    site: "wellness-hub",
    source: "wellness-hub",
    assignedProvider: data.assignedProvider,
  });
  const assignedProvider = assignment.assignedProviderName;

  const existingMember = await prisma.user.findFirst({
    where: {
      email: { equals: data.email.trim().toLowerCase(), mode: "insensitive" },
      role: { in: [Role.MEMBER, Role.GUEST] },
    },
    select: { id: true },
  });

  let submission: { id: string; createdAt: Date; publicTrackingToken: string | null };
  try {
    submission = await prisma.$transaction(async (tx) => {
      const created = await tx.therapeuticsIntakeSubmission.create({
        data: {
          fullName: data.fullName,
          email: data.email.trim().toLowerCase(),
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          programs: ["Provider Connect / Wellness Hub", "Compound Therapy"],
          referredBy: data.referredBy || null,
          clientSignatureDataUrl: data.clientSignatureDataUrl,
          assignedPartnerId: assignment.assignedPartnerId,
          userId: existingMember?.id ?? null,
          publicTrackingToken: trackingToken,
          status: "PENDING_REVIEW",
          payload: ehrPayloadStamp(assignment, {
            source: "wellness-hub",
            site: "privetherapeutics.solutions",
            ...data,
            assignedProvider,
            reviewFee: {
              amount: INTAKE_REVIEW_FEE_USD,
              label: INTAKE_REVIEW_FEE_LABEL,
              transId: charge.transId,
              paidAt: new Date().toISOString(),
              testMode: testMode || Boolean(charge.testMode),
            },
          }),
        },
        select: { id: true, createdAt: true, publicTrackingToken: true },
      });

      const order = await tx.order.create({
        data: {
          orderNumber: invoiceNumber,
          userId: existingMember?.id ?? undefined,
          partnerId: assignment.assignedPartnerId ?? undefined,
          intakeSubmissionId: created.id,
          email: data.email.trim().toLowerCase(),
          phone: data.phone,
          status: "PAID",
          paymentStatus: "PAID",
          fulfillmentStatus: "FULFILLED",
          subtotal: INTAKE_REVIEW_FEE_USD,
          total: INTAKE_REVIEW_FEE_USD,
          notes: `${INTAKE_REVIEW_FEE_LABEL} — Wellness Hub provider review deposit`,
          authorizeNetTransId: charge.transId,
        },
      });

      await tx.paymentRecord.create({
        data: {
          orderId: order.id,
          provider: testMode || charge.testMode ? "authorize.net.test" : "authorize.net",
          status: "PAID",
          amount: new Prisma.Decimal(INTAKE_REVIEW_FEE_USD.toFixed(2)),
          currency: "USD",
          metadata: {
            kind: "intake_review_fee",
            source: "wellness-hub",
            transId: charge.transId,
            authCode: charge.authCode,
            testMode: testMode || Boolean(charge.testMode),
          },
        },
      });

      return created;
    });
  } catch (dbError) {
    console.error("[intake/wellness-hub] Database save failed after payment:", dbError, charge.transId);
    return NextResponse.json(
      {
        error:
          "Payment was received, but we could not save your intake. Please contact concierge with this payment ID: " +
          charge.transId,
      },
      { status: 500 },
    );
  }

  const referenceCode = submission.publicTrackingToken || submission.id;
  const trackUrl = intakeTrackUrl({
    referenceCode,
    email: data.email,
  });

  try {
    const report = formatWellnessHubIntakeEmail({ ...data, assignedProvider }, referenceCode);
    const recipients = getWellnessHubReportRecipients();
    const staffTo = withPhysicianEmails(
      recipients.length > 0 ? recipients : [process.env.RESEND_TO_EMAIL || "consultations@kianprive.com"],
      assignment.physicianEmails,
    );

    await sendTransactionalEmail({
      to: staffTo,
      subject: report.subject,
      text: `${report.text}\n\nProvider review deposit: $${INTAKE_REVIEW_FEE_USD.toFixed(2)} paid (AuthNet ${charge.transId})\nInternal submission id: ${submission.id}`,
      html: report.html,
      replyTo: data.email,
    });

    const patientCopy = formatWellnessHubPatientConfirmation(
      { ...data, assignedProvider },
      referenceCode,
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
    referenceId: referenceCode,
    submissionId: submission.id,
    trackingToken: referenceCode,
    trackUrl,
    hasAccount: Boolean(existingMember),
    submittedAt: submission.createdAt.toISOString(),
  });
}
