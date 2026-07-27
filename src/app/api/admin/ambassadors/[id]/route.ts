import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";

const patchSchema = z.object({
  status: z.enum(["INVITED", "ACTIVE", "SUSPENDED"]).optional(),
  displayName: z.string().min(2).optional(),
  phone: z.string().optional(),
  defaultProductCommissionPct: z.number().min(0).max(100).optional(),
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

  const ambassador = await prisma.partnerProfile.update({
    where: { id },
    data: parsed.data,
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
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
