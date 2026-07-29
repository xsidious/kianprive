import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";

/** Practitioner intake queue — Wellness Hub + assigned submissions. */
export async function GET() {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  if (access.partner.type !== "PROVIDER") {
    return NextResponse.json({ error: "Provider access required." }, { status: 403 });
  }

  const submissions = await prisma.therapeuticsIntakeSubmission.findMany({
    where: {
      OR: [
        { assignedPartnerId: access.partner.id },
        {
          AND: [
            { assignedPartnerId: null },
            { payload: { path: ["source"], equals: "wellness-hub" } },
          ],
        },
      ],
    },
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
