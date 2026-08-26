import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAdminAccess } from "@/lib/admin-guard";
import { providerBookingLinks } from "@/lib/provider";
import { prisma } from "@/lib/prisma";
import { generatePartnerCode, writeAuditLog } from "@/lib/partners";
import { getBookingOptionIds } from "@/lib/services/booking-options";

const assignmentSchema = z.object({
  serviceSlug: z.string().min(1),
  active: z.boolean().optional(),
  commissionPct: z.number().min(0).max(100).nullable().optional(),
});

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  defaultServiceCommissionPct: z.number().min(0).max(100).optional(),
  defaultProductCommissionPct: z.number().min(0).max(100).optional(),
  status: z.enum(["INVITED", "ACTIVE", "SUSPENDED"]).optional(),
  serviceAssignments: z.array(assignmentSchema).optional(),
});

export async function GET() {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;

  let providers;
  try {
    providers = await prisma.partnerProfile.findMany({
      where: { type: "PROVIDER" },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        serviceAssignments: true,
        productAssignments: true,
        _count: { select: { bookings: true, commissionEntries: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[admin/providers] Enum migration required:", error);
    return NextResponse.json(
      {
        error:
          'Database is missing the PROVIDER enum. Run in Neon SQL Editor: ALTER TYPE "Role" ADD VALUE IF NOT EXISTS \'PROVIDER\'; ALTER TYPE "PartnerType" ADD VALUE IF NOT EXISTS \'PROVIDER\';',
        providers: [],
        serviceOptions: getBookingOptionIds(),
      },
      { status: 503 },
    );
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const withStats = await Promise.all(
    providers.map(async (provider) => {
      const [visitsMtd, completedVisits, eligible] = await Promise.all([
        prisma.bookingRequest.count({
          where: { partnerId: provider.id, createdAt: { gte: monthStart } },
        }),
        prisma.bookingRequest.count({
          where: { partnerId: provider.id, status: "COMPLETED" },
        }),
        prisma.commissionLedgerEntry.aggregate({
          where: { partnerId: provider.id, sourceType: "SERVICE", status: "ELIGIBLE" },
          _sum: { commissionAmount: true },
        }),
      ]);

      return {
        ...provider,
        links: providerBookingLinks(provider.partnerCode),
        stats: {
          visitsMtd,
          completedVisits,
          totalBookings: provider._count.bookings,
          eligibleCommission: Number(eligible._sum.commissionAmount ?? 0),
        },
      };
    }),
  );

  return NextResponse.json({
    providers: withStats,
    serviceOptions: getBookingOptionIds(),
  });
}

export async function POST(req: Request) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Check all fields: name, email, password (min 8 characters), and display name are required.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) {
    return NextResponse.json(
      { error: `Email already in use (${existing.email}). Use a different login email or update the existing user.` },
      { status: 409 },
    );
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    let partnerCode = generatePartnerCode(parsed.data.displayName);
    while (await prisma.partnerProfile.findUnique({ where: { partnerCode } })) {
      partnerCode = generatePartnerCode(parsed.data.displayName);
    }

    const provider = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        role: "PROVIDER",
      },
    });
    const profile = await tx.partnerProfile.create({
      data: {
        userId: user.id,
        displayName: parsed.data.displayName,
        type: "PROVIDER",
        specialty: parsed.data.specialty,
        phone: parsed.data.phone,
        partnerCode,
        status: parsed.data.status ?? "ACTIVE",
        defaultServiceCommissionPct: parsed.data.defaultServiceCommissionPct ?? 20,
        defaultProductCommissionPct: parsed.data.defaultProductCommissionPct ?? 10,
        onboardingComplete: true,
      },
    });

    const assignments = parsed.data.serviceAssignments ?? [];
    if (assignments.length) {
      await tx.partnerServiceAssignment.createMany({
        data: assignments.map((a) => ({
          partnerId: profile.id,
          serviceSlug: a.serviceSlug,
          active: a.active ?? true,
          commissionPct: a.commissionPct ?? null,
        })),
      });
    }

    return tx.partnerProfile.findUniqueOrThrow({
      where: { id: profile.id },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        serviceAssignments: true,
      },
    });
    });

    await writeAuditLog({
      userId: access.userId,
      action: "provider.create",
      entityType: "PartnerProfile",
      entityId: provider.id,
      metadata: { email: provider.user.email, partnerCode: provider.partnerCode },
    });

    return NextResponse.json(
      {
        provider: {
          ...provider,
          links: providerBookingLinks(provider.partnerCode),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[admin/providers] create failed:", error);
    const message = error instanceof Error ? error.message : "Could not create practitioner.";
    if (/invalid input value for enum/i.test(message)) {
      return NextResponse.json(
        {
          error:
            'Database is missing the PROVIDER role. In Neon SQL Editor run: ALTER TYPE "Role" ADD VALUE IF NOT EXISTS \'PROVIDER\'; ALTER TYPE "PartnerType" ADD VALUE IF NOT EXISTS \'PROVIDER\';',
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
