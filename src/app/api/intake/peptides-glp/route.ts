import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { chargeAuthorizeNetCard, isTherapyPaymentTestMode } from "@/lib/authorize-net";
import {
  formatPeptideIntakeEmail,
  formatPeptideIntakePatientConfirmation,
  getPeptideIntakeReportRecipients,
} from "@/lib/intake/peptides-glp-email";
import { peptidesGlpIntakeSchema } from "@/lib/intake/peptides-glp-schema";
import { INTAKE_REVIEW_FEE_LABEL, INTAKE_REVIEW_FEE_USD } from "@/lib/intake/review-fee";
import { generateIntakeTrackingToken } from "@/lib/intake/tracking";

const bodySchema = z.object({
  intake: peptidesGlpIntakeSchema,
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
        error: "Please complete the intake and pay the $55 physician review fee before submitting.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const session = await auth();
  const data = parsed.data.intake;
  const invoiceNumber = `KP-INTAKE-${Date.now()}`;
  const testMode = isTherapyPaymentTestMode();

  let charge: Awaited<ReturnType<typeof chargeAuthorizeNetCard>>;
  try {
    charge = await chargeAuthorizeNetCard({
      amount: INTAKE_REVIEW_FEE_USD,
      orderNumber: invoiceNumber,
      opaqueData: parsed.data.opaqueData,
      email: data.patient.email,
      billTo: parsed.data.billTo,
      testCardNumber: parsed.data.testCardNumber,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment failed.";
    return NextResponse.json({ error: message }, { status: 402 });
  }

  const trackingToken = generateIntakeTrackingToken();

  let submission: { id: string; createdAt: Date; publicTrackingToken: string | null };
  try {
    submission = await prisma.$transaction(async (tx) => {
      const created = await tx.therapeuticsIntakeSubmission.create({
        data: {
          userId: session?.user?.id ?? null,
          fullName: data.patient.fullName,
          email: data.patient.email,
          phone: data.patient.phone,
          dateOfBirth: data.patient.dateOfBirth,
          programs: data.programs,
          publicTrackingToken: trackingToken,
          status: "PENDING_REVIEW",
          payload: {
            ...data,
            reviewFee: {
              amount: INTAKE_REVIEW_FEE_USD,
              transId: charge.transId,
              paidAt: new Date().toISOString(),
              testMode: testMode || Boolean(charge.testMode),
            },
          },
        },
        select: { id: true, createdAt: true, publicTrackingToken: true },
      });

      const order = await tx.order.create({
        data: {
          orderNumber: invoiceNumber,
          userId: session?.user?.id ?? undefined,
          intakeSubmissionId: created.id,
          email: data.patient.email,
          phone: data.patient.phone,
          status: "PAID",
          paymentStatus: "PAID",
          fulfillmentStatus: "FULFILLED",
          subtotal: INTAKE_REVIEW_FEE_USD,
          total: INTAKE_REVIEW_FEE_USD,
          notes: INTAKE_REVIEW_FEE_LABEL,
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
            transId: charge.transId,
            authCode: charge.authCode,
            testMode: testMode || Boolean(charge.testMode),
          },
        },
      });

      return created;
    });
  } catch (dbError) {
    console.error("[intake/peptides-glp] Database save failed after payment:", dbError, charge.transId);
    return NextResponse.json(
      {
        error:
          "Payment was received, but we could not save your intake. Please contact concierge with this payment ID: " +
          charge.transId,
      },
      { status: 500 },
    );
  }

  const referenceId = submission.publicTrackingToken || submission.id;

  try {
    const report = formatPeptideIntakeEmail(data, referenceId);
    const recipients = getPeptideIntakeReportRecipients();
    if (recipients.length) {
      await sendTransactionalEmail({
        to: recipients,
        subject: report.subject,
        text: `${report.text}\n\nReview fee paid: $${INTAKE_REVIEW_FEE_USD.toFixed(2)} (AuthNet ${charge.transId})`,
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
    amountPaid: INTAKE_REVIEW_FEE_USD,
    testMode: testMode || Boolean(charge.testMode),
  });
}
