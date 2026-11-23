import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeNotification } from "@/lib/notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const rows = await prisma.userNotification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const unreadCount = await prisma.userNotification.count({
    where: { userId: session.user.id, readAt: null },
  });

  return NextResponse.json({
    notifications: rows.map(serializeNotification),
    unreadCount,
  });
}

const patchSchema = z.object({
  ids: z.array(z.string().min(1)).max(100).optional(),
  all: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const where =
    parsed.data.all || !parsed.data.ids?.length
      ? { userId: session.user.id, readAt: null }
      : { userId: session.user.id, id: { in: parsed.data.ids }, readAt: null };

  const result = await prisma.userNotification.updateMany({
    where,
    data: { readAt: new Date() },
  });

  return NextResponse.json({ marked: result.count });
}
