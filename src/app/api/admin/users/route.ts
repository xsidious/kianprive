import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role, SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const users = await prisma.user.findMany({
    include: { subscription: true, profile: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const body = await req.json();

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(String(body.password), 12);
  const user = await prisma.user.create({
    data: {
      email: String(body.email).toLowerCase(),
      name: body.name ? String(body.name) : null,
      role: (body.role as Role) ?? Role.MEMBER,
      passwordHash,
      profile: body.phone || body.company
        ? {
            create: {
              phone: body.phone ? String(body.phone) : null,
              company: body.company ? String(body.company) : null,
            },
          }
        : undefined,
      subscription: {
        create: {
          tier: (body.subscriptionTier as SubscriptionTier) ?? SubscriptionTier.BASIC,
          status: (body.subscriptionStatus as SubscriptionStatus) ?? SubscriptionStatus.INACTIVE,
        },
      },
    },
    include: { subscription: true, profile: true },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "admin.user.create",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email, role: user.role },
  });

  return NextResponse.json({ user }, { status: 201 });
}
