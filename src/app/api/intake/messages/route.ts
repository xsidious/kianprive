import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { intakeReferenceWhere } from "@/lib/intake/tracking";
import { createIntakeMessage, listIntakeMessages } from "@/lib/intake/messages";

const lookupSchema = z.object({
  email: z.string().email(),
  referenceId: z.string().min(6).max(64),
});

const postSchema = lookupSchema.extend({
  body: z.string().trim().min(1).max(4000),
});

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

async function findSubmission(email: string, referenceId: string) {
  return prisma.therapeuticsIntakeSubmission.findFirst({
    where: intakeReferenceWhere(email.trim().toLowerCase(), referenceId),
    select: {
      id: true,
      fullName: true,
      email: true,
      userId: true,
    },
  });
}

/** Public: list messages for an intake (email + request code). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = lookupSchema.safeParse({
    email: url.searchParams.get("email"),
    referenceId: url.searchParams.get("referenceId") || url.searchParams.get("ref"),
  });
  if (!parsed.success) {
    return withCors(
      NextResponse.json({ error: "Provide email and request code." }, { status: 400 }),
    );
  }

  const submission = await findSubmission(parsed.data.email, parsed.data.referenceId);
  if (!submission) {
    return withCors(NextResponse.json({ error: "Intake not found." }, { status: 404 }));
  }

  const messages = await listIntakeMessages(submission.id);
  return withCors(NextResponse.json({ ok: true, messages }));
}

/** Public: patient reply on an intake (email + request code). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return withCors(NextResponse.json({ error: "Invalid request body." }, { status: 400 }));
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return withCors(
      NextResponse.json({ error: "Provide email, request code, and a reply message." }, { status: 400 }),
    );
  }

  const submission = await findSubmission(parsed.data.email, parsed.data.referenceId);
  if (!submission) {
    return withCors(NextResponse.json({ error: "Intake not found." }, { status: 404 }));
  }

  const message = await createIntakeMessage({
    intakeSubmissionId: submission.id,
    authorRole: "PATIENT",
    body: parsed.data.body,
    authorUserId: submission.userId,
    authorName: submission.fullName,
    syncStatusNote: false,
    notifyPatient: false,
  });

  return withCors(NextResponse.json({ ok: true, message }));
}
