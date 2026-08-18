import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  INTAKE_STATUS_LABELS,
  intakeReferenceWhere,
  patientFacingIntakeStatus,
} from "@/lib/intake/tracking";
import { listIntakeMessages } from "@/lib/intake/messages";
import { formatChargeDate, intervalLabel } from "@/lib/commerce/therapy-billing";

const querySchema = z.object({
  email: z.string().email(),
  referenceId: z.string().min(6).max(64),
});

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

/** Public intake status lookup — email + request code (KP-XXXX-XXXX). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return withCors(NextResponse.json({ error: "Invalid request body." }, { status: 400 }));
  }

  const parsed = querySchema.safeParse(body);
  if (!parsed.success) {
    return withCors(
      NextResponse.json(
        { error: "Provide a valid email and request code from your confirmation email." },
        { status: 400 },
      ),
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const submission = await prisma.therapeuticsIntakeSubmission.findFirst({
    where: intakeReferenceWhere(email, parsed.data.referenceId),
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      statusNote: true,
      publicTrackingToken: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      therapyProposals: {
        where: { status: { in: ["SENT", "ACCEPTED", "PAID"] } },
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          items: {
            select: {
              quantity: true,
              titleSnapshot: true,
              product: { select: { title: true } },
            },
          },
          order: {
            select: {
              orderNumber: true,
              total: true,
              paymentStatus: true,
            },
          },
          providerPartner: { select: { displayName: true } },
          subscription: {
            select: {
              status: true,
              interval: true,
              intervalDays: true,
              nextChargeAt: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    return withCors(
      NextResponse.json(
        { error: "No intake found for that email and request code." },
        { status: 404 },
      ),
    );
  }

  const referenceCode = submission.publicTrackingToken || submission.id;
  const messages = await listIntakeMessages(submission.id);
  const proposal = submission.therapyProposals[0];

  return withCors(
    NextResponse.json({
      ok: true,
      intake: {
        referenceId: referenceCode,
        trackingToken: referenceCode,
        fullName: submission.fullName,
        email: submission.email,
        status: submission.status,
        statusLabel: patientFacingIntakeStatus(submission.status),
        statusNote: submission.statusNote,
        submittedAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
        hasAccount: Boolean(submission.userId),
        messages,
        orders: submission.orders.map((order) => ({
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt.toISOString(),
        })),
        therapy: proposal
          ? {
              status: proposal.status,
              providerName: proposal.providerPartner.displayName,
              notes: proposal.notes,
              items: proposal.items.map((item) => ({
                title: item.titleSnapshot || item.product.title,
                quantity: item.quantity,
              })),
              billing:
                proposal.subscription && proposal.subscription.interval !== "ONE_TIME"
                  ? {
                      status: proposal.subscription.status,
                      label: intervalLabel(
                        proposal.subscription.interval,
                        proposal.subscription.intervalDays,
                      ),
                      nextChargeLabel: formatChargeDate(proposal.subscription.nextChargeAt),
                    }
                  : proposal.billingInterval !== "ONE_TIME"
                    ? {
                        status: "PENDING",
                        label: intervalLabel(proposal.billingInterval, proposal.intervalDays ?? 0),
                        nextChargeLabel: null,
                      }
                    : null,
              order: proposal.order
                ? {
                    orderNumber: proposal.order.orderNumber,
                    paymentStatus: proposal.order.paymentStatus,
                  }
                : null,
            }
          : null,
        allStatusLabels: INTAKE_STATUS_LABELS,
      },
    }),
  );
}
