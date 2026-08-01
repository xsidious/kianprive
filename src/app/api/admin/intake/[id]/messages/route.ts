import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/rbac";
import { createIntakeMessage, listIntakeMessages } from "@/lib/intake/messages";

type Params = { params: Promise<{ id: string }> };

const postSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  notifyPatient: z.boolean().optional().default(true),
});

async function requireAdminSubmission(id: string) {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const submission = await prisma.therapeuticsIntakeSubmission.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!submission) {
    return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) };
  }

  return {
    session,
    submission,
  };
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const access = await requireAdminSubmission(id);
  if ("error" in access && access.error) return access.error;

  const messages = await listIntakeMessages(id);
  return NextResponse.json({ ok: true, messages });
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const access = await requireAdminSubmission(id);
  if ("error" in access && access.error) return access.error;

  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a message for the patient." }, { status: 400 });
  }

  const message = await createIntakeMessage({
    intakeSubmissionId: id,
    authorRole: "PROVIDER",
    body: parsed.data.body,
    authorUserId: access.session.user.id,
    authorName: access.session.user.name?.trim() || "KIAN Privé Admin",
    syncStatusNote: true,
    notifyPatient: parsed.data.notifyPatient,
  });

  return NextResponse.json({ ok: true, message });
}
