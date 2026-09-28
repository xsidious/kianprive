import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import { accessForPartner } from "@/lib/ehr/locations";
import { intakeVisibleWhere } from "@/lib/ehr/route-intake";

/** Practitioner intake queue — Wellness Hub + assigned submissions. */
export async function GET() {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  if (access.partner.type !== "PROVIDER") {
    return NextResponse.json({ error: "Provider access required." }, { status: 403 });
  }

  const chart = accessForPartner({
    displayName: access.partner.displayName,
    partnerCode: access.partner.partnerCode,
    email: access.session?.user?.email,
  });

  const submissions = await prisma.therapeuticsIntakeSubmission.findMany({
    where: intakeVisibleWhere(access.partner.id, chart.locationIds),
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      status: true,
      referredBy: true,
      programs: true,
      createdAt: true,
      updatedAt: true,
      clientSignatureDataUrl: true,
      providerSignatureDataUrl: true,
      providerSignedAt: true,
      providerSignedName: true,
      payload: true,
    },
  });

  return NextResponse.json({
    canPrescribe: chart.canPrescribe,
    submissions: submissions.map((s) => ({
      ...s,
      hasClientSignature: Boolean(s.clientSignatureDataUrl),
      hasProviderSignature: Boolean(s.providerSignatureDataUrl),
      // Don't send huge signature blobs in list view
      clientSignatureDataUrl: undefined,
      providerSignatureDataUrl: undefined,
    })),
  });
}
