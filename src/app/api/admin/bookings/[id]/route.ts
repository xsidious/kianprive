import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";
import { createServiceCommissionForBooking, markServiceCommissionEligible } from "@/lib/commissions";
import { notifyBookingCompleted } from "@/lib/booking-aftercare-notify";
import { bookingIncludesLabWork } from "@/lib/bookings/lab-services";
import { sendLabPrescriptionEmails } from "@/lib/bookings/lab-prescription-notify";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const body = await req.json();

  if (body.action === "sendLabPrescription") {
    const booking = await prisma.bookingRequest.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    if (!bookingIncludesLabWork(booking.serviceIds)) {
      return NextResponse.json({ error: "This booking is not a lab / blood work order." }, { status: 400 });
    }
    if (!booking.medicalReviewPaidAt) {
      return NextResponse.json(
        { error: "Medical review fee has not been paid for this booking." },
        { status: 402 },
      );
    }

    const result = await sendLabPrescriptionEmails({
      id: booking.id,
      fullName: booking.fullName,
      email: booking.email,
      phone: booking.phone,
      patientDateOfBirth: booking.patientDateOfBirth,
      preferredLocation: booking.preferredLocation,
      scheduledStart: booking.scheduledStart,
      timezone: booking.timezone,
      serviceIds: booking.serviceIds,
      serviceTitles: booking.serviceTitles,
      notes: booking.notes,
    });

    if (!result.sent) {
      return NextResponse.json(
        { error: "LAB_PRESCRIPTION_EMAIL is not configured in environment variables." },
        { status: 400 },
      );
    }

    const updated = await prisma.bookingRequest.update({
      where: { id },
      data: { labPrescriptionSentAt: new Date() },
    });

    await writeAuditLog({
      userId: guard.userId,
      action: "booking.lab_prescription.send",
      entityType: "BookingRequest",
      entityId: id,
    });

    return NextResponse.json({ booking: updated, ok: true });
  }

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
