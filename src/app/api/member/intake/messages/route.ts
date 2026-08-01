import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeIntakeReference } from "@/lib/intake/tracking";
import { createIntakeMessage, listIntakeMessages } from "@/lib/intake/messages";

const lookupSchema = z.object({
  referenceId: z.string().min(6).max(64),
});

const postSchema = lookupSchema.extend({
  body: z.string().trim().min(1).max(4000),
});

async function ownedSubmission(userId: string, email: string | null | undefined, referenceId: string) {
  const ref = normalizeIntakeReference(referenceId);
  const rawId = referenceId.trim();
  return prisma.therapeuticsIntakeSubmission.findFirst({
    where: {
      AND: [
        {
          OR: [
            { userId },
            ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
          ],
        },
        {
          OR: [{ publicTrackingToken: ref }, { id: rawId }],
        },
      ],
    },
    select: { id: true, fullName: true, userId: true, email: true },
  });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const parsed = lookupSchema.safeParse({
    referenceId: url.searchParams.get("referenceId") || url.searchParams.get("ref"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a request code." }, { status: 400 });
  }

  const submission = await ownedSubmission(
    session.user.id,
    session.user.email,
    parsed.data.referenceId,
  );
  if (!submission) {
    return NextResponse.json({ error: "Intake not found." }, { status: 404 });
  }

  const messages = await listIntakeMessages(submission.id);
  return NextResponse.json({ ok: true, messages });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide request code and reply message." }, { status: 400 });
  }

  const submission = await ownedSubmission(
    session.user.id,
    session.user.email,
    parsed.data.referenceId,
  );
  if (!submission) {
    return NextResponse.json({ error: "Intake not found." }, { status: 404 });
  }

  if (!submission.userId) {
    await prisma.therapeuticsIntakeSubmission.update({
      where: { id: submission.id },
      data: { userId: session.user.id },
    });
  }

  const message = await createIntakeMessage({
    intakeSubmissionId: submission.id,
    authorRole: "PATIENT",
    body: parsed.data.body,
    authorUserId: session.user.id,
    authorName: session.user.name || submission.fullName,
    syncStatusNote: false,
    notifyPatient: false,
  });

  return NextResponse.json({ ok: true, message });
}
