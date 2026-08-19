import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/rbac";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.therapeuticsIntakeSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      programs: true,
      status: true,
      statusNote: true,
      publicTrackingToken: true,
      payload: true,
      referredBy: true,
      clientSignatureDataUrl: true,
      providerSignatureDataUrl: true,
      providerSignedAt: true,
      providerSignedName: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          authorRole: true,
          authorName: true,
          body: true,
          createdAt: true,
        },
      },
      therapyProposals: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          order: { select: { paymentStatus: true } },
          _count: { select: { items: true } },
        },
      },
    },
  });

  return NextResponse.json({
    submissions: submissions.map(({ messages, _count, therapyProposals, ...row }) => ({
      ...row,
      messageCount: _count.messages,
      latestMessage: messages[0]
        ? {
            id: messages[0].id,
            authorRole: messages[0].authorRole,
            authorLabel:
              messages[0].authorRole === "PATIENT"
                ? messages[0].authorName || "Patient"
                : messages[0].authorName || "Clinical team",
            body: messages[0].body,
            createdAt: messages[0].createdAt.toISOString(),
          }
        : null,
      therapy: therapyProposals[0]
        ? {
            status: therapyProposals[0].status,
            paymentStatus: therapyProposals[0].order?.paymentStatus ?? null,
            itemCount: therapyProposals[0]._count.items,
          }
        : null,
    })),
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { id?: string; status?: string; statusNote?: string };
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "Submission id and status are required." }, { status: 400 });
  }

  const allowed = new Set([
    "PENDING_REVIEW",
    "UNDER_PHYSICIAN_REVIEW",
    "NEEDS_LABS",
    "APPROVED",
    "NEEDS_FOLLOW_UP",
    "DECLINED",
  ]);
  if (!allowed.has(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await prisma.therapeuticsIntakeSubmission.update({
    where: { id: body.id },
    data: {
      status: body.status as never,
      statusNote: typeof body.statusNote === "string" ? body.statusNote : undefined,
    },
    select: {
      id: true,
      status: true,
      statusNote: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ submission: updated });
}
