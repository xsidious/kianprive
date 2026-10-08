import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const access = await requirePartnerProfile(["partner", "practitioner", "ambassador"]);
  if (!access.ok) return access.response;

  const partner = await prisma.partnerProfile.findUnique({
    where: { id: access.partner.id },
    include: {
      serviceAssignments: { where: { active: true } },
      productAssignments: {
        where: { active: true },
        include: { product: true },
      },
    },
  });

  return NextResponse.json({
    partner,
    hasSavedSignature: Boolean(partner?.signatureDataUrl),
    referralBookingUrl: `/book-online?partner=${partner?.partnerCode}`,
    referralShopUrl: `/shop?partner=${partner?.partnerCode}`,
  });
}

export async function PATCH(req: Request) {
  const access = await requirePartnerProfile(["partner", "practitioner", "ambassador"]);
  if (!access.ok) return access.response;
  const body = (await req.json()) as {
    phone?: string;
    bio?: string;
    payoutMethod?: string;
    payoutDetails?: Record<string, unknown>;
    signatureDataUrl?: string | null;
    clearSignature?: boolean;
  };

  const signatureUpdate: Prisma.PartnerProfileUpdateInput = {};
  if (body.clearSignature) {
    signatureUpdate.signatureDataUrl = null;
    signatureUpdate.signatureUpdatedAt = null;
  } else if (typeof body.signatureDataUrl === "string") {
    const trimmed = body.signatureDataUrl.trim();
    if (trimmed.length < 40 || trimmed.length > 900_000 || !trimmed.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid signature image." }, { status: 400 });
    }
    signatureUpdate.signatureDataUrl = trimmed;
    signatureUpdate.signatureUpdatedAt = new Date();
  }

  const partner = await prisma.partnerProfile.update({
    where: { id: access.partner.id },
    data: {
      phone: body.phone,
      bio: body.bio,
      payoutMethod: body.payoutMethod,
      payoutDetails: body.payoutDetails
        ? (body.payoutDetails as Prisma.InputJsonValue)
        : undefined,
      ...signatureUpdate,
      onboardingComplete:
        Boolean(body.payoutMethod || access.partner.payoutMethod) &&
        Boolean(body.phone || access.partner.phone),
    },
  });

  return NextResponse.json({
    partner,
    hasSavedSignature: Boolean(partner.signatureDataUrl),
  });
}
