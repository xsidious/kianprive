import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/ops/audit";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  contactName: z.string().max(120).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().max(40).optional().nullable(),
  paymentMethod: z.string().max(40).optional().nullable(),
  payoutDetails: z.record(z.string(), z.unknown()).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
  productIds: z.array(z.string()).optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vendor update." }, { status: 400 });
  }

  const vendor = await prisma.$transaction(async (tx) => {
    const updated = await tx.vendor.update({
      where: { id },
      data: {
        name: parsed.data.name?.trim(),
        contactName: parsed.data.contactName === undefined ? undefined : parsed.data.contactName?.trim() || null,
        email: parsed.data.email === undefined ? undefined : parsed.data.email?.trim() || null,
        phone: parsed.data.phone === undefined ? undefined : parsed.data.phone?.trim() || null,
        paymentMethod:
          parsed.data.paymentMethod === undefined ? undefined : parsed.data.paymentMethod?.trim() || null,
        payoutDetails:
          parsed.data.payoutDetails === undefined
            ? undefined
            : ((parsed.data.payoutDetails ?? Prisma.DbNull) as Prisma.InputJsonValue | typeof Prisma.DbNull),
        notes: parsed.data.notes === undefined ? undefined : parsed.data.notes?.trim() || null,
      },
    });

    if (parsed.data.productIds) {
      await tx.product.updateMany({ where: { vendorId: id }, data: { vendorId: null } });
      if (parsed.data.productIds.length) {
        await tx.product.updateMany({
          where: { id: { in: parsed.data.productIds } },
          data: { vendorId: id },
        });
      }
    }

    return updated;
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "vendor.update",
    entityType: "Vendor",
    entityId: id,
  });

  return NextResponse.json({ vendor });
}

export async function DELETE(_: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const open = await prisma.vendorPayable.count({ where: { vendorId: id, status: { in: ["OPEN", "SENT"] } } });
  if (open) {
    return NextResponse.json({ error: "Pay or cancel open vendor bills before deleting this vendor." }, { status: 400 });
  }
  await prisma.product.updateMany({ where: { vendorId: id }, data: { vendorId: null } });
  await prisma.vendor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
