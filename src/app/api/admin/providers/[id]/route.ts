import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";

const assignmentSchema = z.object({
  serviceSlug: z.string().min(1),
  active: z.boolean().optional(),
  commissionPct: z.number().min(0).max(100).nullable().optional(),
});

const patchSchema = z.object({
  status: z.enum(["INVITED", "ACTIVE", "SUSPENDED"]).optional(),
  displayName: z.string().min(2).optional(),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  defaultServiceCommissionPct: z.number().min(0).max(100).optional(),
  serviceAssignments: z.array(assignmentSchema).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;
  const { id } = await params;

  const provider = await prisma.partnerProfile.findFirst({
    where: { id, type: "PROVIDER" },
    include: {
      user: { select: { id: true, email: true, name: true, role: true } },
      serviceAssignments: true,
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 40,
        select: {
          id: true,
          fullName: true,
          email: true,
          status: true,
          serviceTitles: true,
          scheduledStart: true,
          guestTotal: true,
          memberTotal: true,
          createdAt: true,
        },
      },
      commissionEntries: {
        where: { sourceType: "SERVICE" },
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

  if (!provider) {
    return NextResponse.json({ error: "Provider not found." }, { status: 404 });
  }

  return NextResponse.json({ provider });
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

  const existing = await prisma.partnerProfile.findFirst({ where: { id, type: "PROVIDER" } });
  if (!existing) {
    return NextResponse.json({ error: "Provider not found." }, { status: 404 });
  }

  const { serviceAssignments, ...profileData } = parsed.data;

  const provider = await prisma.$transaction(async (tx) => {
    if (serviceAssignments) {
      await tx.partnerServiceAssignment.deleteMany({ where: { partnerId: id } });
      if (serviceAssignments.length) {
        await tx.partnerServiceAssignment.createMany({
          data: serviceAssignments.map((a) => ({
            partnerId: id,
            serviceSlug: a.serviceSlug,
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
        serviceAssignments: true,
      },
    });
  });

  await writeAuditLog({
    userId: access.userId,
    action: "provider.update",
    entityType: "PartnerProfile",
    entityId: id,
    metadata: parsed.data,
  });

  return NextResponse.json({ provider });
}
