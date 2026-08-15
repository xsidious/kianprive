import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashSetupToken } from "@/lib/auth/setup-token";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return NextResponse.json({ error: "Missing setup token." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { setupTokenHash: hashSetupToken(token) },
    include: { profile: true },
  });

  if (!user?.setupTokenExpires || user.setupTokenExpires < new Date()) {
    return NextResponse.json({ error: "This setup link is invalid or expired." }, { status: 404 });
  }

  return NextResponse.json({
    email: user.email,
    name: user.name ?? "",
    phone: user.profile?.phone ?? "",
    dateOfBirth: user.profile?.dateOfBirth ?? "",
    medicalConditions: user.profile?.medicalConditions ?? "",
    allergies: user.profile?.allergies ?? "",
    medications: user.profile?.medications ?? "",
    emergencyContact: user.profile?.emergencyContact ?? "",
    emergencyPhone: user.profile?.emergencyPhone ?? "",
    importedNotes: user.profile?.importedNotes ?? "",
  });
}
