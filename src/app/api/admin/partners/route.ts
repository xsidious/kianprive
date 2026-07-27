import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { generatePartnerCode, writeAuditLog } from "@/lib/partners";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
  legalName: z.string().optional(),
  type: z.enum(["CLINICAL", "BRAND", "BOTH", "AMBASSADOR"]).default("CLINICAL"),
  specialty: z.string().optional(),
  specialtyTags: z.array(z.string()).optional(),
  phone: z.string().optional(),
  defaultServiceCommissionPct: z.number().min(0).max(100).optional(),
  defaultProductCommissionPct: z.number().min(0).max(100).optional(),
  status: z.enum(["INVITED", "ACTIVE", "SUSPENDED"]).optional(),
});

export async function GET() {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;

  const partners = await prisma.partnerProfile.findMany({
    include: {
      user: { select: { id: true, email: true, name: true, role: true } },
      serviceAssignments: true,
      productAssignments: true,
      _count: { select: { bookings: true, commissionEntries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ partners });
}

export async function POST(req: Request) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid partner payload.", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  let partnerCode = generatePartnerCode(parsed.data.displayName);
  while (await prisma.partnerProfile.findUnique({ where: { partnerCode } })) {
    partnerCode = generatePartnerCode(parsed.data.displayName);
  }

  const partner = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        role: parsed.data.type === "AMBASSADOR" ? "AMBASSADOR" : "PARTNER",
      },
    });
    return tx.partnerProfile.create({
      data: {
        userId: user.id,
        displayName: parsed.data.displayName,
        legalName: parsed.data.legalName,
        type: parsed.data.type,
        specialty: parsed.data.specialty,
        specialtyTags: parsed.data.specialtyTags ?? [],
        phone: parsed.data.phone,
        partnerCode,
        status: parsed.data.status ?? "INVITED",
        defaultServiceCommissionPct: parsed.data.defaultServiceCommissionPct ?? 20,
        defaultProductCommissionPct: parsed.data.defaultProductCommissionPct ?? 10,
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  });

  await writeAuditLog({
    userId: access.userId,
    action: "partner.create",
    entityType: "PartnerProfile",
    entityId: partner.id,
    metadata: { email: partner.user.email, partnerCode: partner.partnerCode },
  });

  return NextResponse.json({ partner }, { status: 201 });
}
