import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";
import { createServiceCommissionForBooking, markServiceCommissionEligible } from "@/lib/commissions";
import { notifyBookingCompleted } from "@/lib/booking-aftercare-notify";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const body = await req.json();

  const previous = await prisma.bookingRequest.findUnique({
    where: { id },
    select: { status: true, email: true, fullName: true, serviceTitles: true },
  });

  const booking = await prisma.bookingRequest.update({
    where: { id },
    data: {
      status: body.status as BookingStatus | undefined,
      notes: body.notes !== undefined ? String(body.notes) : undefined,
      preferredLocation: body.preferredLocation !== undefined ? String(body.preferredLocation) : undefined,
      partnerId: body.partnerId !== undefined ? (body.partnerId as string | null) : undefined,
      partnerNotes: body.partnerNotes !== undefined ? String(body.partnerNotes) : undefined,
    },
  });

  if (booking.partnerId && (booking.status === "CONFIRMED" || booking.status === "COMPLETED")) {
    await createServiceCommissionForBooking(booking.id);
  }
  if (booking.status === "COMPLETED") {
    await markServiceCommissionEligible(booking.id);
  }

  if (previous && previous.status !== "COMPLETED" && booking.status === "COMPLETED") {
    void notifyBookingCompleted({
      email: booking.email,
      fullName: booking.fullName,
      serviceTitles: booking.serviceTitles,
    });
  }

  await writeAuditLog({
    userId: guard.userId,
    action: "booking.update",
    entityType: "BookingRequest",
    entityId: booking.id,
    metadata: { status: booking.status, email: booking.email, partnerId: booking.partnerId },
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
