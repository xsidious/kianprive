import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      subscription: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      name: user.name ?? "",
      phone: user.profile?.phone ?? "",
      company: user.profile?.company ?? "",
      email: user.email,
    },
    subscription: user.subscription
      ? {
          tier: user.subscription.tier,
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
        }
      : null,
  });
}

async function updateProfile(req: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { name?: string; phone?: string; company?: string };
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: body.name,
      profile: {
        upsert: {
          create: { phone: body.phone, company: body.company },
          update: { phone: body.phone, company: body.company },
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  return updateProfile(req);
}

export async function PUT(req: Request) {
  return updateProfile(req);
}
