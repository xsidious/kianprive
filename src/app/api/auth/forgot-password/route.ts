import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { buildPasswordResetEmail } from "@/lib/email-templates";
import { createSetupToken, SETUP_TOKEN_TTL_MS } from "@/lib/auth/setup-token";

const schema = z.object({
  email: z.string().email(),
});

function appBaseUrl() {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://kianprive.com"
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user?.passwordHash || user?.mustSetPassword) {
    const { token, hash } = createSetupToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        setupTokenHash: hash,
        setupTokenExpires: new Date(Date.now() + SETUP_TOKEN_TTL_MS),
      },
    });
    const setupUrl = `${appBaseUrl()}/welcome?token=${token}`;
    const content = buildPasswordResetEmail({ setupUrl });
    await sendTransactionalEmail({
      to: user.email,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });
  }

  return NextResponse.json({
    ok: true,
    message: "If that email is on file, a reset link is on its way.",
  });
}
