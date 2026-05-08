import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role, SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name ? String(body.name) : null;
  if (body.email !== undefined) updateData.email = String(body.email).toLowerCase();
  if (body.role !== undefined) updateData.role = body.role as Role;
  if (body.password) updateData.passwordHash = await bcrypt.hash(String(body.password), 12);

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    include: { subscription: true, profile: true },
  });

  if (body.subscriptionTier || body.subscriptionStatus) {
    await prisma.subscription.upsert({
      where: { userId: id },
      create: {
        userId: id,
        tier: (body.subscriptionTier as SubscriptionTier) ?? SubscriptionTier.BASIC,
        status: (body.subscriptionStatus as SubscriptionStatus) ?? SubscriptionStatus.INACTIVE,
      },
      update: {
        tier: body.subscriptionTier as SubscriptionTier | undefined,
        status: body.subscriptionStatus as SubscriptionStatus | undefined,
      },
    });
  }

  await writeAuditLog({
    userId: guard.userId,
    action: "admin.user.update",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email, role: user.role },
  });

  return NextResponse.json({ user });
}

export async function DELETE(_: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;

  if (id === guard.userId) {
    return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.user.delete({ where: { id } });
  await writeAuditLog({
    userId: guard.userId,
    action: "admin.user.delete",
    entityType: "User",
    entityId: id,
    metadata: { email: existing.email },
  });

  return NextResponse.json({ ok: true });
}
