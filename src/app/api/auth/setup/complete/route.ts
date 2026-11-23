import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashSetupToken } from "@/lib/auth/setup-token";
import { memberProfileWriteData, type MemberProfileDraft } from "@/lib/account/member-profile";
import { BCRYPT_COST, PASSWORD_HINT, strongPasswordSchema } from "@/lib/auth-security";

const schema = z.object({
  token: z.string().min(16),
  password: strongPasswordSchema,
  name: z.string().min(2).max(120),
  phone: z.string().max(40).optional(),
  dateOfBirth: z.string().max(40).optional(),
  sexAtBirth: z.string().max(40).optional(),
  addressLine1: z.string().max(200).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(40).optional(),
  postalCode: z.string().max(20).optional(),
  preferredContact: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  primaryCarePhysician: z.string().max(160).optional(),
  medicalConditions: z.string().max(4000).optional(),
  allergies: z.string().max(2000).optional(),
  medications: z.string().max(2000).optional(),
  supplements: z.string().max(2000).optional(),
  pregnancyStatus: z.string().max(40).optional(),
  emergencyContact: z.string().max(120).optional(),
  emergencyRelationship: z.string().max(80).optional(),
  emergencyPhone: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const passwordIssue = parsed.error.issues.find((issue) => issue.path.includes("password"));
    return NextResponse.json(
      { error: passwordIssue?.message || `Please check your details. ${PASSWORD_HINT}` },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { setupTokenHash: hashSetupToken(parsed.data.token) },
    include: { profile: true },
  });

  if (!user?.setupTokenExpires || user.setupTokenExpires < new Date()) {
    return NextResponse.json({ error: "This setup link is invalid or expired. Start again." }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_COST);
  const profileData = {
    ...memberProfileWriteData(parsed.data as Partial<MemberProfileDraft>),
    phone: parsed.data.phone?.trim() || user.profile?.phone || null,
  };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name.trim(),
      passwordHash,
      mustSetPassword: false,
      memberOnboardingComplete: true,
      setupTokenHash: null,
      setupTokenExpires: null,
      role: user.role === Role.GUEST ? Role.MEMBER : user.role,
      profile: {
        upsert: {
          create: profileData,
          update: profileData,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, email: user.email });
}
