import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";

const createSchema = z.object({
  title: z.string().min(2),
  category: z.enum(["PEPTIDES", "GLP", "GENERAL", "CLINICAL", "OPERATIONS"]).default("GENERAL"),
  body: z.string().optional(),
  documentUrl: z.string().url().optional().or(z.literal("")),
  version: z.string().optional(),
  requiresAck: z.boolean().optional(),
  publish: z.boolean().optional(),
  grantAllPartners: z.boolean().optional(),
  partnerIds: z.array(z.string()).optional(),
});

export async function GET() {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const guidelines = await prisma.partnerGuideline.findMany({
    include: { grants: true, _count: { select: { acks: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ guidelines });
}

export async function POST(req: Request) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const guideline = await prisma.$transaction(async (tx) => {
    const created = await tx.partnerGuideline.create({
      data: {
        title: parsed.data.title,
        category: parsed.data.category,
        body: parsed.data.body,
        documentUrl: parsed.data.documentUrl || null,
        version: parsed.data.version ?? "1.0",
        requiresAck: parsed.data.requiresAck ?? false,
        publishedAt: parsed.data.publish ? new Date() : null,
      },
    });
    if (parsed.data.grantAllPartners) {
      await tx.partnerGuidelineGrant.create({
        data: { guidelineId: created.id, allPartners: true },
      });
    }
    if (parsed.data.partnerIds?.length) {
      await tx.partnerGuidelineGrant.createMany({
        data: parsed.data.partnerIds.map((partnerId) => ({
          guidelineId: created.id,
          partnerId,
          allPartners: false,
        })),
      });
    }
    return created;
  });

  await writeAuditLog({
    userId: access.userId,
    action: "partner.guideline.create",
    entityType: "PartnerGuideline",
    entityId: guideline.id,
  });

  return NextResponse.json({ guideline }, { status: 201 });
}
