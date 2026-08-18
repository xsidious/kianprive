import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { emailVendorPurchaseOrder } from "@/lib/commerce/vendor-payables";
import { writeAuditLog } from "@/lib/ops/audit";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  action: z.enum(["send", "pay", "cancel"]),
  paidReference: z.string().max(120).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
  amount: z.number().min(0).optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vendor bill update." }, { status: 400 });
  }

  if (parsed.data.action === "send") {
    const payable = await emailVendorPurchaseOrder(id);
    await writeAuditLog({
      userId: guard.userId,
      action: "vendor.payable.send",
      entityType: "VendorPayable",
      entityId: id,
    });
    return NextResponse.json({ payable: { ...payable, amount: Number(payable.amount) } });
  }

  if (parsed.data.action === "cancel") {
    const payable = await prisma.vendorPayable.update({
      where: { id },
      data: { status: "CANCELED", notes: parsed.data.notes ?? undefined },
    });
    return NextResponse.json({ payable: { ...payable, amount: Number(payable.amount) } });
  }

  const payable = await prisma.vendorPayable.update({
    where: { id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paidReference: parsed.data.paidReference?.trim() || null,
      notes: parsed.data.notes ?? undefined,
      amount: parsed.data.amount != null ? parsed.data.amount : undefined,
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "vendor.payable.pay",
    entityType: "VendorPayable",
    entityId: id,
    metadata: { paidReference: payable.paidReference, amount: Number(payable.amount) },
  });

  return NextResponse.json({ payable: { ...payable, amount: Number(payable.amount) } });
}
