import { NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { createSetupToken, phonesMatch, SETUP_TOKEN_TTL_MS } from "@/lib/auth/setup-token";

const schema = z.object({
  email: z.string().email(),
  phone: z.string().min(4).max(32).optional(),
  sendLink: z.boolean().optional(),
});

const STAFF = new Set<Role>([
  Role.ADMIN,
  Role.OPERATIONS,
  Role.EDITOR,
  Role.PARTNER,
  Role.AMBASSADOR,
  Role.PROVIDER,
]);

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
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "We could not find that email on file. Check the spelling or contact concierge." },
      { status: 404 },
    );
  }

  if (STAFF.has(user.role)) {
    return NextResponse.json(
      { error: "This email belongs to a staff or partner account. Use the staff sign-in instead." },
      { status: 409 },
    );
  }

  if (user.passwordHash && !user.mustSetPassword) {
    return NextResponse.json(
      {
        error: "This account already has a password. Sign in, or use forgot password if you need to reset it.",
        login: true,
      },
      { status: 409 },
    );
  }

  const phoneOnFile = user.profile?.phone ?? null;
  const wantsLink = Boolean(parsed.data.sendLink);
  const phoneOk = parsed.data.phone ? phonesMatch(phoneOnFile, parsed.data.phone) : false;

  if (!wantsLink && phoneOnFile && !phoneOk) {
    return NextResponse.json(
      {
        error: "Enter the phone number we have on file (or the last 4 digits) to verify this is your account.",
        needsPhone: true,
        canEmailLink: true,
      },
      { status: 401 },
    );
  }

  if (!wantsLink && !phoneOnFile && !phoneOk) {
    return NextResponse.json(
      {
        error: "We do not have a phone number on file for this email. We can send a secure setup link instead.",
        needsPhone: false,
        canEmailLink: true,
      },
      { status: 401 },
    );
  }

  const { token, hash } = createSetupToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      setupTokenHash: hash,
      setupTokenExpires: new Date(Date.now() + SETUP_TOKEN_TTL_MS),
    },
  });

  const setupUrl = `${appBaseUrl()}/welcome?token=${token}`;

  if (wantsLink || !phoneOk) {
    await sendTransactionalEmail({
      to: user.email,
      subject: "Set up your KIAN Privé account",
      text: `Hi ${user.name || "there"},\n\nUse this link to create your password and finish your member profile:\n${setupUrl}\n\nThis link expires in 24 hours.\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>Hi ${user.name || "there"},</p><p>Use this link to create your password and finish your member profile:</p><p><a href="${setupUrl}">${setupUrl}</a></p><p>This link expires in 24 hours.</p>`,
    });
    return NextResponse.json({
      ok: true,
      emailed: true,
      message: "If that email is on file, a setup link is on its way. Check your inbox.",
    });
  }

  return NextResponse.json({
    ok: true,
    token,
    email: user.email,
    name: user.name ?? "",
    phone: user.profile?.phone ?? "",
    importedNotes: user.profile?.importedNotes ?? "",
  });
}
