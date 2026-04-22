import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { name?: string; phone?: string; company?: string };
  await prisma.user.update({
    where: { id: session.user.id },
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
