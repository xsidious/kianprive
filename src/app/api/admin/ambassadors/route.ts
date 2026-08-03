import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAdminAccess } from "@/lib/admin-guard";
import { ambassadorReferralLinks } from "@/lib/ambassador";
import { prisma } from "@/lib/prisma";
import { generatePartnerCode, writeAuditLog } from "@/lib/partners";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
  phone: z.string().optional(),
  defaultProductCommissionPct: z.number().min(0).max(100).optional(),
  status: z.enum(["INVITED", "ACTIVE", "SUSPENDED"]).optional(),
});

export async function GET() {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;

  let ambassadors;
  try {
    ambassadors = await prisma.partnerProfile.findMany({
      where: { type: "AMBASSADOR" },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        _count: { select: { orders: true, commissionEntries: true } },
        productAssignments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[admin/ambassadors] Enum migration required:", error);
    return NextResponse.json(
      {
        error:
          "Database is missing the AMBASSADOR enum. Run this in Neon SQL Editor: ALTER TYPE \"Role\" ADD VALUE IF NOT EXISTS 'AMBASSADOR'; ALTER TYPE \"PartnerType\" ADD VALUE IF NOT EXISTS 'AMBASSADOR';",
        ambassadors: [],
      },
      { status: 503 },
    );
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const withStats = await Promise.all(
    ambassadors.map(async (ambassador) => {
      const [paidSales, mtdSales, eligible] = await Promise.all([
        prisma.order.aggregate({
          where: { partnerId: ambassador.id, paymentStatus: "PAID" },
          _sum: { total: true },
          _count: true,
        }),
        prisma.order.aggregate({
          where: { partnerId: ambassador.id, paymentStatus: "PAID", createdAt: { gte: monthStart } },
          _sum: { total: true },
          _count: true,
        }),
        prisma.commissionLedgerEntry.aggregate({
          where: { partnerId: ambassador.id, status: "ELIGIBLE" },
          _sum: { commissionAmount: true },
        }),
      ]);

      const links = ambassadorReferralLinks(ambassador.partnerCode);
      return {
        ...ambassador,
        links,
        stats: {
          paidOrders: paidSales._count,
          paidSalesTotal: Number(paidSales._sum.total ?? 0),
          mtdOrders: mtdSales._count,
          mtdSalesTotal: Number(mtdSales._sum.total ?? 0),
          eligibleCommission: Number(eligible._sum.commissionAmount ?? 0),
        },
      };
    }),
  );

  return NextResponse.json({ ambassadors: withStats });
}

export async function POST(req: Request) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ambassador payload.", details: parsed.error.flatten() }, { status: 400 });
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

  const ambassador = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        role: "AMBASSADOR",
      },
    });
    return tx.partnerProfile.create({
      data: {
        userId: user.id,
        displayName: parsed.data.displayName,
        type: "AMBASSADOR",
        phone: parsed.data.phone,
        partnerCode,
        status: parsed.data.status ?? "ACTIVE",
        defaultServiceCommissionPct: 0,
        defaultProductCommissionPct: parsed.data.defaultProductCommissionPct ?? 10,
        onboardingComplete: true,
      },
      include: { user: { select: { id: true, email: true, name: true, role: true } } },
    });
  });

  await writeAuditLog({
    userId: access.userId,
    action: "ambassador.create",
    entityType: "PartnerProfile",
    entityId: ambassador.id,
    metadata: { email: ambassador.user.email, partnerCode: ambassador.partnerCode },
  });

  return NextResponse.json(
    {
      ambassador: {
        ...ambassador,
        links: ambassadorReferralLinks(ambassador.partnerCode),
      },
    },
    { status: 201 },
  );
}
