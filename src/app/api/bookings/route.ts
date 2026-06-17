import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/rbac";
import { getBookingOptionById, getBookingOptionIds } from "@/lib/services/booking-options";
import { DEFAULT_TIMEZONE } from "@/lib/scheduling/config";
import { createAcuityAppointment } from "@/lib/acuity/appointments";
import { AcuityApiError } from "@/lib/acuity/client";
import { isAcuitySchedulingEnabled } from "@/lib/acuity/config";
import { resolveBookingDatetime } from "@/lib/acuity/datetime";
import { computeSlotEnd, isSlotAvailable, parseSlotId } from "@/lib/scheduling/slots";
import { sendTransactionalEmail } from "@/lib/email";

const createBookingSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  preferredLocation: z.string().min(1),
  notes: z.string().optional(),
  serviceIds: z.array(z.string().min(1)).min(1),
  scheduledSlotId: z.string().min(1),
  timezone: z.string().optional(),
  memberPricingActive: z.boolean().optional(),
});

const PARTNER_BOOKING_IDS = new Set(["beauty-hair-nails", "mindtap"]);

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking request." }, { status: 400 });
  }

  const allowedIds = new Set(getBookingOptionIds());
  const invalidService = parsed.data.serviceIds.find((id) => !allowedIds.has(id));
  if (invalidService) {
    return NextResponse.json({ error: "One or more selected services are invalid." }, { status: 400 });
  }

  const resolved = resolveBookingDatetime(parsed.data.scheduledSlotId);
  const scheduledStart = resolved?.start ?? parseSlotId(parsed.data.scheduledSlotId);
  const acuityDatetime = resolved?.acuityDatetime ?? parsed.data.scheduledSlotId;
  if (!scheduledStart) {
    return NextResponse.json({ error: "Selected time slot is invalid." }, { status: 400 });
  }

  const primaryService = getBookingOptionById(parsed.data.serviceIds[0]);
  if (!primaryService) {
    return NextResponse.json({ error: "Primary service not found." }, { status: 400 });
  }

  const timezone = parsed.data.timezone ?? DEFAULT_TIMEZONE;

  const useAcuity = isAcuitySchedulingEnabled();

  let bookedStarts: Date[] = [];
  if (!useAcuity) {
    try {
      const existingBookings = await prisma.bookingRequest.findMany({
        where: {
          scheduledStart: { gte: new Date() },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: { scheduledStart: true },
      });
      bookedStarts = existingBookings
        .map((booking) => booking.scheduledStart)
        .filter((value): value is Date => value instanceof Date);
    } catch (dbError) {
      console.error("[bookings] Could not load existing bookings:", dbError);
    }
  }

  if (
    !useAcuity &&
    !isSlotAvailable(
      parsed.data.scheduledSlotId,
      bookedStarts,
      primaryService.durationMinutes,
      timezone,
    )
  ) {
    return NextResponse.json({ error: "That time slot is no longer available. Please choose another." }, { status: 409 });
  }

  let acuityAppointmentId: number | null = null;
  if (useAcuity) {
    const nameParts = parsed.data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? parsed.data.fullName;
    const lastName = nameParts.slice(1).join(" ") || firstName;
    try {
      const acuityAppointment = await createAcuityAppointment({
        serviceSlug: primaryService.slug,
        datetime: acuityDatetime,
        firstName,
        lastName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        notes: [
          parsed.data.notes,
          `Booked via kianprive.com/book-online`,
          `Services: ${parsed.data.serviceIds.join(", ")}`,
          `Location: ${parsed.data.preferredLocation}`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      acuityAppointmentId = acuityAppointment.id;
    } catch (error) {
      console.error("[bookings] Acuity appointment create failed:", error);
      const message =
        error instanceof AcuityApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not confirm appointment with scheduling system.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const scheduledEnd = computeSlotEnd(scheduledStart, primaryService.durationMinutes);

  const serviceTitles = parsed.data.serviceIds.map((id) => getBookingOptionById(id)?.title ?? id);
  let guestTotal = 0;
  let memberTotal = 0;
  for (const id of parsed.data.serviceIds) {
    const option = getBookingOptionById(id);
    if (!option) continue;
    guestTotal += option.guestPrice;
    memberTotal += option.memberPrice;
  }

  let booking: {
    id: string;
    status: string;
    scheduledStart: Date | null;
    scheduledEnd: Date | null;
  } | null = null;

  try {
    booking = await prisma.bookingRequest.create({
      data: {
        userId: session?.user?.id || null,
        fullName: parsed.data.fullName,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        preferredDate: scheduledStart,
        preferredLocation: parsed.data.preferredLocation,
        scheduledStart,
        scheduledEnd,
        timezone,
        notes: [
          parsed.data.notes,
          acuityAppointmentId ? `Acuity appointment #${acuityAppointmentId}` : null,
        ]
          .filter(Boolean)
          .join("\n\n") || null,
        serviceIds: parsed.data.serviceIds,
        serviceTitles,
        guestTotal,
        memberTotal,
        status: "CONFIRMED",
      },
      select: {
        id: true,
        status: true,
        scheduledStart: true,
        scheduledEnd: true,
      },
    });
  } catch (dbError) {
    console.error("[bookings] Could not save booking request to database:", dbError);
    if (!acuityAppointmentId) {
      return NextResponse.json(
        { error: "Could not save booking. Please contact concierge to confirm your appointment." },
        { status: 500 },
      );
    }
  }

  try {
    const reportInbox = process.env.BOOKING_REPORT_EMAIL;
    if (reportInbox) {
      const bookingType = parsed.data.serviceIds.some((id) => PARTNER_BOOKING_IDS.has(id)) ? "PARTNER" : "DIRECT";
      const recipients = reportInbox
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      await Promise.all(
        recipients.map((to) =>
          sendTransactionalEmail({
            to,
            subject: `[${bookingType}] New booking request - ${parsed.data.fullName}`,
            text: [
              `Booking type: ${bookingType}`,
              `Name: ${parsed.data.fullName}`,
              `Email: ${parsed.data.email}`,
              `Phone: ${parsed.data.phone}`,
              `Services: ${serviceTitles.join(", ")}`,
              `Location: ${parsed.data.preferredLocation}`,
              `Time: ${scheduledStart.toISOString()}`,
              `Timezone: ${timezone}`,
              `Acuity appointment: ${acuityAppointmentId ?? "Not created"}`,
              `Booking id: ${booking?.id ?? "Not saved"}`,
            ].join("\n"),
          }),
        ),
      );
    }
  } catch (emailError) {
    console.error("[bookings] Could not send booking report email:", emailError);
  }

  return NextResponse.json({
    ok: true,
    booking,
    acuityAppointmentId,
    schedulingSource: useAcuity ? "acuity" : "internal",
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      preferredDate: true,
      scheduledStart: true,
      scheduledEnd: true,
      preferredLocation: true,
      serviceTitles: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json({ bookings });
}
