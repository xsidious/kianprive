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
  try {
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
    const durationMinutes = parsed.data.durationMinutes ?? option.durationMinutes;

    let bookedStarts: Date[] = [];
    try {
      const existing = await prisma.bookingRequest.findMany({
        where: {
          scheduledStart: { gte: new Date() },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: { scheduledStart: true },
      });

      bookedStarts = existing
        .map((booking) => booking.scheduledStart)
        .filter((value): value is Date => value instanceof Date);
    } catch (dbError) {
      console.error("[scheduling/slots] Could not load existing bookings:", dbError);
    }

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
  } catch (error) {
    console.error("[scheduling/slots] Failed to generate slots:", error);
    return NextResponse.json(
      { error: "Could not load available times. Please try again in a moment." },
      { status: 500 },
    );
  }
}
