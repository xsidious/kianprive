import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";

/** Practitioners can read member and patient contact records for care and outreach. */
export async function GET() {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  if (access.partner.type !== "PROVIDER") {
    return NextResponse.json({ error: "Provider access required." }, { status: 403 });
  }

  const members = await prisma.user.findMany({
    where: { role: "MEMBER" },
    orderBy: { name: "asc" },
    take: 500,
    select: {
      id: true,
      name: true,
      email: true,
      profile: {
        select: {
          phone: true,
          dateOfBirth: true,
          city: true,
          state: true,
          medicalConditions: true,
          allergies: true,
          medications: true,
          preferredContact: true,
        },
      },
    },
  });

  return NextResponse.json({
    patients: members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.profile?.phone ?? "",
      dateOfBirth: member.profile?.dateOfBirth ?? "",
      city: member.profile?.city ?? "",
      state: member.profile?.state ?? "",
      preferredContact: member.profile?.preferredContact ?? "",
      medicalConditions: member.profile?.medicalConditions ?? "",
      allergies: member.profile?.allergies ?? "",
      medications: member.profile?.medications ?? "",
    })),
  });
}
