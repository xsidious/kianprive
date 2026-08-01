import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  INTAKE_STATUS_LABELS,
  patientFacingIntakeStatus,
} from "@/lib/intake/tracking";

const querySchema = z.object({
  email: z.string().email(),
  referenceId: z.string().min(8).max(64),
  token: z.string().min(4).max(64).optional(),
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

/** Public intake status lookup — email + reference ID. */
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
        { error: "Provide a valid email and reference ID from your confirmation email." },
        { status: 400 },
      ),
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const submission = await prisma.therapeuticsIntakeSubmission.findFirst({
    where: {
      id: parsed.data.referenceId.trim(),
      email: { equals: email, mode: "insensitive" },
      ...(parsed.data.token
        ? { publicTrackingToken: parsed.data.token.trim().toUpperCase() }
        : {}),
    },
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
    },
  });

  if (!submission) {
    return withCors(
      NextResponse.json(
        { error: "No intake found for that email and reference ID." },
        { status: 404 },
      ),
    );
  }

  return withCors(
    NextResponse.json({
      ok: true,
      intake: {
        referenceId: submission.id,
        trackingToken: submission.publicTrackingToken,
        fullName: submission.fullName,
        email: submission.email,
        status: submission.status,
        statusLabel: patientFacingIntakeStatus(submission.status),
        statusNote: submission.statusNote,
        submittedAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
        hasAccount: Boolean(submission.userId),
        orders: submission.orders.map((order) => ({
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          total: Number(order.total),
          createdAt: order.createdAt.toISOString(),
        })),
        allStatusLabels: INTAKE_STATUS_LABELS,
      },
    }),
  );
}
