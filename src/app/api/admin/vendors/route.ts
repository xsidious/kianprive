import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/ops/audit";

const vendorSchema = z.object({
  name: z.string().min(2).max(160),
  contactName: z.string().max(120).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().max(40).optional().nullable(),
  paymentMethod: z.string().max(40).optional().nullable(),
  payoutDetails: z.record(z.string(), z.unknown()).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const vendors = await prisma.vendor.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true, payables: true } },
      payables: {
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          order: { select: { orderNumber: true, email: true, paymentStatus: true } },
        },
      },
    },
  });

  const openPayables = await prisma.vendorPayable.findMany({
    where: { status: { in: ["OPEN", "SENT"] } },
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true, email: true, paymentMethod: true } },
      order: { select: { id: true, orderNumber: true, email: true } },
    },
  });

  return NextResponse.json({
    vendors: vendors.map((vendor) => ({
      ...vendor,
      payables: vendor.payables.map((payable) => ({
        ...payable,
        amount: Number(payable.amount),
      })),
    })),
    openPayables: openPayables.map((payable) => ({
      ...payable,
      amount: Number(payable.amount),
    })),
  });
}

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const parsed = vendorSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vendor details." }, { status: 400 });
  }

  const vendor = await prisma.vendor.create({
    data: {
      name: parsed.data.name.trim(),
      contactName: parsed.data.contactName?.trim() || null,
      email: parsed.data.email?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      paymentMethod: parsed.data.paymentMethod?.trim() || null,
      payoutDetails: (parsed.data.payoutDetails ?? undefined) as Prisma.InputJsonValue | undefined,
      notes: parsed.data.notes?.trim() || null,
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "vendor.create",
    entityType: "Vendor",
    entityId: vendor.id,
    metadata: { name: vendor.name },
  });

  return NextResponse.json({ vendor }, { status: 201 });
}
