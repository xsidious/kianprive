import { prisma } from "@/lib/prisma";
import { getBookingOptionById } from "@/lib/services/booking-options";
import { DEFAULT_TIMEZONE } from "@/lib/scheduling/config";
import { createAcuityAppointment } from "@/lib/acuity/appointments";
import { AcuityApiError } from "@/lib/acuity/client";
import { isAcuitySchedulingEnabled } from "@/lib/acuity/config";
import { resolveBookingDatetime } from "@/lib/acuity/datetime";
import { computeSlotEnd, isSlotAvailable, parseSlotId } from "@/lib/scheduling/slots";
import { createServiceCommissionForBooking } from "@/lib/commissions";
import { writeAuditLog } from "@/lib/partners";
import { bookingIncludesLabWork } from "@/lib/bookings/lab-services";

export type ProviderBookingInput = {
  partnerId: string;
  authorUserId: string;
  fullName: string;
  email: string;
  phone: string;
  preferredLocation: string;
  serviceIds: string[];
  scheduledSlotId: string;
  timezone?: string;
  notes?: string;
  partnerNotes?: string;
  patientDateOfBirth?: string;
};

export async function createProviderBooking(input: ProviderBookingInput) {
  const email = input.email.trim().toLowerCase();
  const primaryService = getBookingOptionById(input.serviceIds[0]);
  if (!primaryService) {
    return { ok: false as const, status: 400, error: "Primary service not found." };
  }

  if (bookingIncludesLabWork(input.serviceIds)) {
    return {
      ok: false as const,
      status: 400,
      error: "Lab services still require patient payment and consent via the public booking flow.",
    };
  }

  const resolved = resolveBookingDatetime(input.scheduledSlotId);
  const scheduledStart = resolved?.start ?? parseSlotId(input.scheduledSlotId);
  const acuityDatetime = resolved?.acuityDatetime ?? input.scheduledSlotId;
  if (!scheduledStart) {
    return { ok: false as const, status: 400, error: "Selected time slot is invalid." };
  }

  const timezone = input.timezone ?? DEFAULT_TIMEZONE;
  const useAcuity = isAcuitySchedulingEnabled();

  if (!useAcuity) {
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
        input.scheduledSlotId,
        bookedStarts,
        primaryService.durationMinutes,
        timezone,
      )
    ) {
      return {
        ok: false as const,
        status: 409,
        error: "That time slot is no longer available. Please choose another.",
      };
    }
  }

  let acuityAppointmentId: number | null = null;
  if (useAcuity) {
    const nameParts = input.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? input.fullName;
    const lastName = nameParts.slice(1).join(" ") || firstName;
    try {
      const acuityAppointment = await createAcuityAppointment({
        serviceSlug: primaryService.slug,
        datetime: acuityDatetime,
        firstName,
        lastName,
        email,
        phone: input.phone,
        notes: [
          input.notes,
          `Booked by provider via /provider`,
          `Services: ${input.serviceIds.join(", ")}`,
          `Location: ${input.preferredLocation}`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      acuityAppointmentId = acuityAppointment.id;
    } catch (error) {
      const message =
        error instanceof AcuityApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not confirm appointment with scheduling system.";
      return { ok: false as const, status: 502, error: message };
    }
  }

  const scheduledEnd = computeSlotEnd(scheduledStart, primaryService.durationMinutes);
  const serviceTitles = input.serviceIds.map((id) => getBookingOptionById(id)?.title ?? id);
  let guestTotal = 0;
  let memberTotal = 0;
  for (const id of input.serviceIds) {
    const option = getBookingOptionById(id);
    if (!option) continue;
    guestTotal += option.guestPrice;
    memberTotal += option.memberPrice;
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });

  const booking = await prisma.bookingRequest.create({
    data: {
      userId: existingUser?.id || null,
      partnerId: input.partnerId,
      fullName: input.fullName.trim(),
      email,
      phone: input.phone.trim(),
      preferredDate: scheduledStart,
      preferredLocation: input.preferredLocation.trim() || "Clinic",
      scheduledStart,
      scheduledEnd,
      timezone,
      notes: [
        input.notes?.trim() || null,
        acuityAppointmentId ? `Acuity appointment #${acuityAppointmentId}` : null,
        "Booked by provider (provider portal).",
      ]
        .filter(Boolean)
        .join("\n\n") || null,
      partnerNotes: input.partnerNotes?.trim() || null,
      source: "provider_portal",
      patientDateOfBirth: input.patientDateOfBirth?.trim() || null,
      serviceIds: input.serviceIds,
      serviceTitles,
      guestTotal,
      memberTotal,
      status: "CONFIRMED",
    },
  });

  await createServiceCommissionForBooking(booking.id);
  const { notifyPartnerNewBooking } = await import("@/lib/partner-notify");
  await notifyPartnerNewBooking(booking.id);

  await writeAuditLog({
    userId: input.authorUserId,
    action: "provider.booking.create",
    entityType: "BookingRequest",
    entityId: booking.id,
    metadata: {
      partnerId: input.partnerId,
      email,
      serviceIds: input.serviceIds,
      source: "provider_portal",
    },
  });

  return {
    ok: true as const,
    booking: {
      id: booking.id,
      status: booking.status,
      scheduledStart: booking.scheduledStart,
      scheduledEnd: booking.scheduledEnd,
      serviceTitles: booking.serviceTitles,
    },
  };
}
