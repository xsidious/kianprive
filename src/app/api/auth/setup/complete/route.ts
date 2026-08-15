import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashSetupToken } from "@/lib/auth/setup-token";

const schema = z.object({
  token: z.string().min(16),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(120),
  phone: z.string().max(32).optional(),
  dateOfBirth: z.string().max(40).optional(),
  medicalConditions: z.string().max(4000).optional(),
  allergies: z.string().max(2000).optional(),
  medications: z.string().max(2000).optional(),
  emergencyContact: z.string().max(120).optional(),
  emergencyPhone: z.string().max(32).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your details. Password must be at least 8 characters." },
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

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const profileData = {
    phone: parsed.data.phone?.trim() || user.profile?.phone || null,
    dateOfBirth: parsed.data.dateOfBirth?.trim() || null,
    medicalConditions: parsed.data.medicalConditions?.trim() || null,
    allergies: parsed.data.allergies?.trim() || null,
    medications: parsed.data.medications?.trim() || null,
    emergencyContact: parsed.data.emergencyContact?.trim() || null,
    emergencyPhone: parsed.data.emergencyPhone?.trim() || null,
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
