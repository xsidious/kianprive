import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const body = await req.json();

  const booking = await prisma.bookingRequest.update({
    where: { id },
    data: {
      status: body.status as BookingStatus | undefined,
      notes: body.notes !== undefined ? String(body.notes) : undefined,
      preferredLocation: body.preferredLocation !== undefined ? String(body.preferredLocation) : undefined,
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "booking.update",
    entityType: "BookingRequest",
    entityId: booking.id,
    metadata: { status: booking.status, email: booking.email },
  });

  return NextResponse.json({ booking });
}

export async function DELETE(_: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;

  await prisma.bookingRequest.delete({ where: { id } });
  await writeAuditLog({
    userId: guard.userId,
    action: "booking.delete",
    entityType: "BookingRequest",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
