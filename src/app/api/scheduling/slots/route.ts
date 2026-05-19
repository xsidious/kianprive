import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getBookingOptionById } from "@/lib/services/booking-options";
import { DEFAULT_TIMEZONE } from "@/lib/scheduling/config";
import { generateAvailableSlots } from "@/lib/scheduling/slots";

const querySchema = z.object({
  serviceId: z.string().min(1),
  timezone: z.string().optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    serviceId: searchParams.get("serviceId"),
    timezone: searchParams.get("timezone") ?? undefined,
    durationMinutes: searchParams.get("durationMinutes") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "serviceId is required." }, { status: 400 });
  }

  const option = getBookingOptionById(parsed.data.serviceId);
  if (!option) {
    return NextResponse.json({ error: "Unknown service." }, { status: 400 });
  }

  const timezone = parsed.data.timezone ?? DEFAULT_TIMEZONE;

  const existing = await prisma.bookingRequest.findMany({
    where: {
      scheduledStart: { gte: new Date() },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { scheduledStart: true },
  });

  const bookedStarts = existing
    .map((booking) => booking.scheduledStart)
    .filter((value): value is Date => value instanceof Date);

  const durationMinutes = parsed.data.durationMinutes ?? option.durationMinutes;

  const slots = generateAvailableSlots({
    fromDate: new Date(),
    durationMinutes,
    timezone,
    bookedStarts,
  });

  return NextResponse.json({
    serviceId: option.id,
    timezone,
    durationMinutes,
    slots,
  });
}
