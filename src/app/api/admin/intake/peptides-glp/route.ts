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
      payload: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ submissions });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { id?: string; status?: string };
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "Submission id and status are required." }, { status: 400 });
  }

  const allowed = new Set([
    "PENDING_REVIEW",
    "UNDER_PHYSICIAN_REVIEW",
    "APPROVED",
    "NEEDS_FOLLOW_UP",
    "DECLINED",
  ]);
  if (!allowed.has(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await prisma.therapeuticsIntakeSubmission.update({
    where: { id: body.id },
    data: { status: body.status as never },
    select: {
      id: true,
      status: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ submission: updated });
}
