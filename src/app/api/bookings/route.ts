import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/rbac";
import { getBookingOptionById, getBookingOptionIds } from "@/lib/services/booking-options";
import { DEFAULT_TIMEZONE } from "@/lib/scheduling/config";
import { computeSlotEnd, isSlotAvailable, parseSlotId } from "@/lib/scheduling/slots";

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

  const scheduledStart = parseSlotId(parsed.data.scheduledSlotId);
  if (!scheduledStart) {
    return NextResponse.json({ error: "Selected time slot is invalid." }, { status: 400 });
  }

  const primaryService = getBookingOptionById(parsed.data.serviceIds[0]);
  if (!primaryService) {
    return NextResponse.json({ error: "Primary service not found." }, { status: 400 });
  }

  const timezone = parsed.data.timezone ?? DEFAULT_TIMEZONE;

  const existingBookings = await prisma.bookingRequest.findMany({
    where: {
      scheduledStart: { gte: new Date() },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { scheduledStart: true },
  });

  const bookedStarts = existingBookings
    .map((booking) => booking.scheduledStart)
    .filter((value): value is Date => value instanceof Date);

  if (
    !isSlotAvailable(
      parsed.data.scheduledSlotId,
      bookedStarts,
      primaryService.durationMinutes,
      timezone,
    )
  ) {
    return NextResponse.json({ error: "That time slot is no longer available. Please choose another." }, { status: 409 });
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

  const booking = await prisma.bookingRequest.create({
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
      notes: parsed.data.notes || null,
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

  return NextResponse.json({ ok: true, booking });
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
