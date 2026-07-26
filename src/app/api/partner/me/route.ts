import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const access = await requirePartnerProfile();
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
    referralBookingUrl: `/book-online?partner=${partner?.partnerCode}`,
    referralShopUrl: `/shop?partner=${partner?.partnerCode}`,
  });
}

export async function PATCH(req: Request) {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  const body = (await req.json()) as {
    phone?: string;
    bio?: string;
    payoutMethod?: string;
    payoutDetails?: Record<string, unknown>;
  };

  const partner = await prisma.partnerProfile.update({
    where: { id: access.partner.id },
    data: {
      phone: body.phone,
      bio: body.bio,
      payoutMethod: body.payoutMethod,
      payoutDetails: body.payoutDetails
        ? (body.payoutDetails as Prisma.InputJsonValue)
        : undefined,
      onboardingComplete:
        Boolean(body.payoutMethod || access.partner.payoutMethod) &&
        Boolean(body.phone || access.partner.phone),
    },
  });

  return NextResponse.json({ partner });
}
