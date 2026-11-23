import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BCRYPT_COST, PASSWORD_HINT, strongPasswordSchema } from "@/lib/auth-security";

const schema = z.object({
  currentPassword: z.string().min(1).max(128).optional(),
  newPassword: strongPasswordSchema,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const passwordIssue = parsed.error.issues.find((issue) => issue.path.includes("newPassword"));
    return NextResponse.json({ error: passwordIssue?.message || PASSWORD_HINT }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (user.passwordHash && !user.mustSetPassword) {
    if (!parsed.data.currentPassword) {
      return NextResponse.json({ error: "Enter your current password." }, { status: 400 });
    }
    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_COST);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      mustSetPassword: false,
    },
  });

  return NextResponse.json({ ok: true });
}
