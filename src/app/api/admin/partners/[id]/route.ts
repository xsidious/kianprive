import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  displayName: z.string().min(2).optional(),
  legalName: z.string().nullable().optional(),
  type: z.enum(["CLINICAL", "BRAND", "BOTH"]).optional(),
  specialty: z.string().nullable().optional(),
  specialtyTags: z.array(z.string()).optional(),
  bio: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  taxId: z.string().nullable().optional(),
  payoutMethod: z.string().nullable().optional(),
  payoutDetails: z.record(z.string(), z.unknown()).nullable().optional(),
  status: z.enum(["INVITED", "ACTIVE", "SUSPENDED"]).optional(),
  defaultServiceCommissionPct: z.number().min(0).max(100).optional(),
  defaultProductCommissionPct: z.number().min(0).max(100).optional(),
  onboardingComplete: z.boolean().optional(),
  serviceAssignments: z
    .array(
      z.object({
        serviceSlug: z.string().min(1),
        active: z.boolean().default(true),
        commissionPct: z.number().min(0).max(100).nullable().optional(),
      }),
    )
    .optional(),
  productAssignments: z
    .array(
      z.object({
        productId: z.string().min(1),
        active: z.boolean().default(true),
        commissionPct: z.number().min(0).max(100).nullable().optional(),
        partnerSku: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export async function GET(_req: Request, { params }: Params) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const { id } = await params;

  const partner = await prisma.partnerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true } },
      serviceAssignments: true,
      productAssignments: { include: { product: true } },
      payouts: { orderBy: { createdAt: "desc" }, take: 20 },
      guidelineGrants: { include: { guideline: true } },
    },
  });
  if (!partner) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ partner });
}

export async function PATCH(req: Request, { params }: Params) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await prisma.partnerProfile.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { serviceAssignments, productAssignments, ...profileData } = parsed.data;

  const partner = await prisma.$transaction(async (tx) => {
    if (serviceAssignments) {
      await tx.partnerServiceAssignment.deleteMany({ where: { partnerId: id } });
      if (serviceAssignments.length) {
        await tx.partnerServiceAssignment.createMany({
          data: serviceAssignments.map((a) => ({
            partnerId: id,
            serviceSlug: a.serviceSlug,
            active: a.active,
            commissionPct: a.commissionPct ?? null,
          })),
        });
      }
    }
    if (productAssignments) {
      await tx.partnerProductAssignment.deleteMany({ where: { partnerId: id } });
      if (productAssignments.length) {
        await tx.partnerProductAssignment.createMany({
          data: productAssignments.map((a) => ({
            partnerId: id,
            productId: a.productId,
            active: a.active,
            commissionPct: a.commissionPct ?? null,
            partnerSku: a.partnerSku ?? undefined,
          })),
        });
      }
    }
    return tx.partnerProfile.update({
      where: { id },
      data: {
        ...profileData,
        payoutDetails:
          profileData.payoutDetails === null || profileData.payoutDetails === undefined
            ? undefined
            : (profileData.payoutDetails as Prisma.InputJsonValue),

      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        serviceAssignments: true,
        productAssignments: true,
      },
    });
  });

  await writeAuditLog({
    userId: access.userId,
    action: "partner.update",
    entityType: "PartnerProfile",
    entityId: id,
    metadata: parsed.data as Record<string, unknown>,
  });

  return NextResponse.json({ partner });
}

export async function DELETE(_req: Request, { params }: Params) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const { id } = await params;
  const partner = await prisma.partnerProfile.findUnique({ where: { id } });
  if (!partner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.user.delete({ where: { id: partner.userId } });
  await writeAuditLog({
    userId: access.userId,
    action: "partner.delete",
    entityType: "PartnerProfile",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
