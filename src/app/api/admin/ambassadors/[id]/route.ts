import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";

const productAssignmentSchema = z.object({
  productId: z.string().min(1),
  active: z.boolean().optional(),
  commissionPct: z.number().min(0).max(100).nullable().optional(),
});

const patchSchema = z.object({
  status: z.enum(["INVITED", "ACTIVE", "SUSPENDED"]).optional(),
  displayName: z.string().min(2).optional(),
  phone: z.string().optional(),
  defaultProductCommissionPct: z.number().min(0).max(100).optional(),
  productAssignments: z.array(productAssignmentSchema).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const { id } = await params;

  const ambassador = await prisma.partnerProfile.findFirst({
    where: { id, type: "AMBASSADOR" },
    include: {
      user: { select: { id: true, email: true, name: true, role: true } },
      productAssignments: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 40,
        select: {
          id: true,
          orderNumber: true,
          email: true,
          total: true,
          paymentStatus: true,
          status: true,
          createdAt: true,
        },
      },
      commissionEntries: {
        orderBy: { earnedAt: "desc" },
        take: 40,
        select: {
          id: true,
          description: true,
          grossAmount: true,
          commissionPct: true,
          commissionAmount: true,
          status: true,
          earnedAt: true,
        },
      },
    },
  });

  if (!ambassador) {
    return NextResponse.json({ error: "Ambassador not found." }, { status: 404 });
  }

  return NextResponse.json({ ambassador });
}

export async function PATCH(req: Request, { params }: Params) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const { id } = await params;

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const existing = await prisma.partnerProfile.findFirst({ where: { id, type: "AMBASSADOR" } });
  if (!existing) {
    return NextResponse.json({ error: "Ambassador not found." }, { status: 404 });
  }

  const { productAssignments, ...profileData } = parsed.data;

  const ambassador = await prisma.$transaction(async (tx) => {
    if (productAssignments) {
      await tx.partnerProductAssignment.deleteMany({ where: { partnerId: id } });
      if (productAssignments.length) {
        await tx.partnerProductAssignment.createMany({
          data: productAssignments.map((a) => ({
            partnerId: id,
            productId: a.productId,
            active: a.active ?? true,
            commissionPct: a.commissionPct ?? null,
          })),
        });
      }
    }

    return tx.partnerProfile.update({
      where: { id },
      data: profileData,
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        productAssignments: true,
      },
    });
  });

  await writeAuditLog({
    userId: access.userId,
    action: "ambassador.update",
    entityType: "PartnerProfile",
    entityId: id,
    metadata: parsed.data,
  });

  return NextResponse.json({ ambassador });
}

export async function DELETE(_req: Request, { params }: Params) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const { id } = await params;

  const existing = await prisma.partnerProfile.findFirst({
    where: { id, type: "AMBASSADOR" },
    select: { id: true, userId: true, displayName: true, partnerCode: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Ambassador not found." }, { status: 404 });
  }

  await prisma.user.delete({ where: { id: existing.userId } });

  await writeAuditLog({
    userId: access.userId,
    action: "ambassador.delete",
    entityType: "PartnerProfile",
    entityId: id,
    metadata: { displayName: existing.displayName, partnerCode: existing.partnerCode },
  });

  return NextResponse.json({ ok: true });
}
