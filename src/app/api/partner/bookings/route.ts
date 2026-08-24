import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";
import { createServiceCommissionForBooking, markServiceCommissionEligible } from "@/lib/commissions";
import { notifyBookingCompleted } from "@/lib/booking-aftercare-notify";

export async function GET(req: Request) {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const bookings = await prisma.bookingRequest.findMany({
    where: {
      partnerId: access.partner.id,
      status: status ? (status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED") : undefined,
    },
    orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  return NextResponse.json({ bookings, partner: access.partner });
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"]).optional(),
  preferredLocation: z.string().optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  partnerNotes: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: Request) {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const existing = await prisma.bookingRequest.findFirst({
    where: { id: parsed.data.id, partnerId: access.partner.id },
  });
  if (!existing) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const booking = await prisma.bookingRequest.update({
    where: { id: existing.id },
    data: {
      status: parsed.data.status,
      preferredLocation: parsed.data.preferredLocation,
      scheduledStart: parsed.data.scheduledStart ? new Date(parsed.data.scheduledStart) : undefined,
      scheduledEnd: parsed.data.scheduledEnd ? new Date(parsed.data.scheduledEnd) : undefined,
      partnerNotes: parsed.data.partnerNotes,
      notes: parsed.data.notes,
    },
  });

  if (parsed.data.scheduledStart && Number.isNaN(booking.scheduledStart?.getTime() ?? NaN)) {
    return NextResponse.json({ error: "Invalid start time" }, { status: 400 });
  }

  if (parsed.data.status === "CONFIRMED" || parsed.data.status === "COMPLETED") {
    await createServiceCommissionForBooking(booking.id);
  }
  if (parsed.data.status === "COMPLETED") {
    await markServiceCommissionEligible(booking.id);
  }

  if (existing.status !== "COMPLETED" && booking.status === "COMPLETED") {
    void notifyBookingCompleted({
      email: booking.email,
      fullName: booking.fullName,
      serviceTitles: booking.serviceTitles,
    });
  }

  await writeAuditLog({
    userId: access.userId,
    action: "partner.booking.update",
    entityType: "BookingRequest",
    entityId: booking.id,
    metadata: { status: booking.status },
  });

  return NextResponse.json({ booking });
}
