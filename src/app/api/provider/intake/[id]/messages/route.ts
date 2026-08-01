import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/rbac";
import { createIntakeMessage, listIntakeMessages } from "@/lib/intake/messages";

type Params = { params: Promise<{ id: string }> };

const postSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  notifyPatient: z.boolean().optional().default(true),
  authorName: z.string().trim().max(120).optional(),
});

async function authorizeProviderAccess(id: string) {
  const session = await auth();
  const isAdmin = Boolean(session?.user?.id && canAccessAdmin(session.user.role));

  let partnerId: string | null = null;
  let partnerName: string | null = null;
  if (!isAdmin) {
    const access = await requirePartnerProfile();
    if (!access.ok) return { error: access.response as NextResponse };
    if (access.partner.type !== "PROVIDER") {
      return { error: NextResponse.json({ error: "Provider access required." }, { status: 403 }) };
    }
    partnerId = access.partner.id;
    partnerName = access.partner.displayName || null;
  }

  const submission = await prisma.therapeuticsIntakeSubmission.findFirst({
    where: isAdmin
      ? { id }
      : {
          id,
          OR: [
            { assignedPartnerId: partnerId! },
            {
              AND: [
                { assignedPartnerId: null },
                { payload: { path: ["source"], equals: "wellness-hub" } },
              ],
            },
          ],
        },
    select: { id: true, assignedPartnerId: true },
  });

  if (!submission) {
    return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) };
  }

  if (!isAdmin && !submission.assignedPartnerId && partnerId) {
    await prisma.therapeuticsIntakeSubmission.update({
      where: { id },
      data: { assignedPartnerId: partnerId },
    });
  }

  return {
    submission,
    sessionUserId: session?.user?.id ?? null,
    partnerName,
    isAdmin,
  };
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const access = await authorizeProviderAccess(id);
  if ("error" in access && access.error) return access.error;

  const messages = await listIntakeMessages(id);
  return NextResponse.json({ ok: true, messages });
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const access = await authorizeProviderAccess(id);
  if ("error" in access && access.error) return access.error;

  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a message for the patient." }, { status: 400 });
  }

  const message = await createIntakeMessage({
    intakeSubmissionId: id,
    authorRole: "PROVIDER",
    body: parsed.data.body,
    authorUserId: access.sessionUserId,
    authorName: parsed.data.authorName || access.partnerName || "Clinical team",
    syncStatusNote: true,
    notifyPatient: parsed.data.notifyPatient,
  });

  return NextResponse.json({ ok: true, message });
}
