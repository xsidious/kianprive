import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, Role, SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

const roles = new Set<string>(Object.values(Role));

export async function GET(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const roleParam = searchParams.get("role")?.trim() ?? "";
  const role = roles.has(roleParam) ? (roleParam as Role) : undefined;

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { profile: { phone: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
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
  let user;
  try {
    user = await prisma.user.create({
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });
    }
    throw error;
  }

  await writeAuditLog({
    userId: guard.userId,
    action: "admin.user.create",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email, role: user.role },
  });

  return NextResponse.json({ user }, { status: 201 });
}
