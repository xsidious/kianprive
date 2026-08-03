import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const { id } = await params;

  const existing = await prisma.therapeuticsIntakeSubmission.findUnique({
    where: { id },
    select: { id: true, fullName: true, email: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Intake submission not found." }, { status: 404 });
  }

  await prisma.therapeuticsIntakeSubmission.delete({ where: { id } });

  await writeAuditLog({
    userId: access.userId,
    action: "intake.delete",
    entityType: "TherapeuticsIntakeSubmission",
    entityId: id,
    metadata: { fullName: existing.fullName, email: existing.email },
  });

  return NextResponse.json({ ok: true });
}
