import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import { getBookingOptionIds } from "@/lib/services/booking-options";
import { createProviderBooking } from "@/lib/provider/create-provider-booking";
import { providerCanAccessPatient } from "@/lib/provider/patient-access";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  preferredLocation: z.string().min(1).default("Clinic"),
  serviceIds: z.array(z.string().min(1)).min(1),
  scheduledSlotId: z.string().min(1),
  timezone: z.string().optional(),
  notes: z.string().max(5000).optional(),
  partnerNotes: z.string().max(5000).optional(),
  patientDateOfBirth: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const access = await requirePartnerProfile("practitioner");
  if (!access.ok) return access.response;
  if (access.partner.type !== "PROVIDER") {
    return NextResponse.json({ error: "Provider access required." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking request." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const onPanel = await providerCanAccessPatient(access.partner.id, email);
  // Allow booking for new patients not yet on panel (provider-initiated first visit).
  // Still require at least a valid email; new patients join the panel via this booking.

  const assignments = await prisma.partnerServiceAssignment.findMany({
    where: { partnerId: access.partner.id, active: true },
    select: { serviceSlug: true },
  });
  const assigned = new Set(assignments.map((row) => row.serviceSlug));
  const catalog = new Set(getBookingOptionIds());

  for (const id of parsed.data.serviceIds) {
    if (!catalog.has(id)) {
      return NextResponse.json({ error: `Unknown service: ${id}` }, { status: 400 });
    }
    if (assigned.size > 0 && !assigned.has(id)) {
      return NextResponse.json(
        { error: `Service "${id}" is not assigned to your provider profile.` },
        { status: 403 },
      );
    }
  }

  const result = await createProviderBooking({
    partnerId: access.partner.id,
    authorUserId: access.userId!,
    fullName: parsed.data.fullName,
    email,
    phone: parsed.data.phone,
    preferredLocation: parsed.data.preferredLocation,
    serviceIds: parsed.data.serviceIds,
    scheduledSlotId: parsed.data.scheduledSlotId,
    timezone: parsed.data.timezone,
    notes: parsed.data.notes,
    partnerNotes: parsed.data.partnerNotes,
    patientDateOfBirth: parsed.data.patientDateOfBirth,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    booking: result.booking,
    panelJoined: !onPanel,
  });
}
