import { NextResponse } from "next/server";
import type { PartnerProfile } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function normalizePatientEmail(raw: string) {
  return decodeURIComponent(raw || "").trim().toLowerCase();
}

/** True when this provider has an assigned intake or booking for the patient email. */
export async function providerCanAccessPatient(partnerId: string, patientEmail: string) {
  const email = normalizePatientEmail(patientEmail);
  if (!email) return false;

  const [intake, booking] = await Promise.all([
    prisma.therapeuticsIntakeSubmission.findFirst({
      where: { assignedPartnerId: partnerId, email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    }),
    prisma.bookingRequest.findFirst({
      where: { partnerId, email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    }),
  ]);

  return Boolean(intake || booking);
}

export async function requireProviderPatientAccess(partner: PartnerProfile, patientKey: string) {
  if (partner.type !== "PROVIDER") {
    return {
      ok: false as const,
      email: "",
      response: NextResponse.json({ error: "Provider access required." }, { status: 403 }),
    };
  }

  const email = normalizePatientEmail(patientKey);
  if (!email || !email.includes("@")) {
    return {
      ok: false as const,
      email: "",
      response: NextResponse.json({ error: "Invalid patient key." }, { status: 400 }),
    };
  }

  const allowed = await providerCanAccessPatient(partner.id, email);
  if (!allowed) {
    return {
      ok: false as const,
      email,
      response: NextResponse.json({ error: "Patient is not on your panel." }, { status: 403 }),
    };
  }

  return { ok: true as const, email };
}

export async function resolvePatientUserId(email: string) {
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  return user?.id ?? null;
}
