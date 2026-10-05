import { NextResponse } from "next/server";
import { PartnerType } from "@prisma/client";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/ops/audit";
import { attachNetworkProfile, networkKindFromType } from "@/lib/network-profile";

type Params = { params: Promise<{ id: string }> };

const createSchema = z.object({
  type: z.enum(["CLINICAL", "BRAND", "BOTH", "AMBASSADOR", "PROVIDER"]),
  displayName: z.string().min(2),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  legalName: z.string().optional(),
  status: z.enum(["INVITED", "ACTIVE", "SUSPENDED"]).optional(),
  defaultServiceCommissionPct: z.number().min(0).max(100).optional(),
  defaultProductCommissionPct: z.number().min(0).max(100).optional(),
});

export async function POST(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the name and rates before adding this role." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const attached = await attachNetworkProfile({
    userId: user.id,
    type: parsed.data.type as PartnerType,
    displayName: parsed.data.displayName,
    phone: parsed.data.phone,
    specialty: parsed.data.specialty,
    legalName: parsed.data.legalName,
    status: parsed.data.status ?? "ACTIVE",
    defaultServiceCommissionPct: parsed.data.defaultServiceCommissionPct,
    defaultProductCommissionPct: parsed.data.defaultProductCommissionPct,
  });

  if (!attached.created) {
    const label = networkKindFromType(parsed.data.type as PartnerType);
    return NextResponse.json({ error: `This person already has a ${label} role.` }, { status: 409 });
  }

  await writeAuditLog({
    userId: guard.userId,
    action: "admin.user.network.attach",
    entityType: "PartnerProfile",
    entityId: attached.profile.id,
    metadata: { email: user.email, type: parsed.data.type },
  });

  return NextResponse.json({ profile: attached.profile }, { status: 201 });
}

export async function DELETE(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const profileId = new URL(req.url).searchParams.get("profileId");
  if (!profileId) return NextResponse.json({ error: "Missing profile." }, { status: 400 });

  const profile = await prisma.partnerProfile.findFirst({
    where: { id: profileId, userId: id },
    select: { id: true, type: true, displayName: true, partnerCode: true },
  });
  if (!profile) return NextResponse.json({ error: "That role was not found on this user." }, { status: 404 });

  await prisma.partnerProfile.delete({ where: { id: profile.id } });
  await writeAuditLog({
    userId: guard.userId,
    action: "admin.user.network.remove",
    entityType: "PartnerProfile",
    entityId: profile.id,
    metadata: { type: profile.type, partnerCode: profile.partnerCode },
  });

  return NextResponse.json({ ok: true });
}
