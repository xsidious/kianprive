import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";

export async function GET() {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;

  const guidelines = await prisma.partnerGuideline.findMany({
    where: {
      publishedAt: { not: null },
      OR: [
        { grants: { some: { allPartners: true } } },
        { grants: { some: { partnerId: access.partner.id } } },
      ],
    },
    include: {
      acks: { where: { partnerId: access.partner.id } },
    },
    orderBy: { publishedAt: "desc" },
  });

  return NextResponse.json({ guidelines });
}

export async function POST(req: Request) {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  const body = (await req.json()) as { guidelineId?: string };
  if (!body.guidelineId) return NextResponse.json({ error: "guidelineId required" }, { status: 400 });

  const ack = await prisma.partnerGuidelineAck.upsert({
    where: {
      guidelineId_partnerId: {
        guidelineId: body.guidelineId,
        partnerId: access.partner.id,
      },
    },
    create: {
      guidelineId: body.guidelineId,
      partnerId: access.partner.id,
    },
    update: { acknowledgedAt: new Date() },
  });

  await writeAuditLog({
    userId: access.userId,
    action: "partner.guideline.ack",
    entityType: "PartnerGuideline",
    entityId: body.guidelineId,
  });

  return NextResponse.json({ ack });
}
