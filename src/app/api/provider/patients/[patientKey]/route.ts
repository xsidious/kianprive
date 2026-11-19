import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import {
  normalizePatientEmail,
  requireProviderPatientAccess,
} from "@/lib/provider/patient-access";
import { writeAuditLog } from "@/lib/partners";
import { splitBookingNotes } from "@/lib/admin/booking-display";

type Params = { params: Promise<{ patientKey: string }> };

export async function GET(_req: Request, { params }: Params) {
  const access = await requirePartnerProfile("practitioner");
  if (!access.ok) return access.response;

  const { patientKey } = await params;
  const gate = await requireProviderPatientAccess(access.partner, patientKey);
  if (!gate.ok) return gate.response;

  const email = gate.email;

  const [intakes, bookings, user, notesCount, filesCount] = await Promise.all([
    prisma.therapeuticsIntakeSubmission.findMany({
      where: {
        assignedPartnerId: access.partner.id,
        email: { equals: email, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        fullName: true,
        phone: true,
        dateOfBirth: true,
        status: true,
        programs: true,
        createdAt: true,
        clientSignatureDataUrl: true,
        providerSignatureDataUrl: true,
        userId: true,
      },
    }),
    prisma.bookingRequest.findMany({
      where: {
        partnerId: access.partner.id,
        email: { equals: email, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        fullName: true,
        phone: true,
        patientDateOfBirth: true,
        status: true,
        serviceTitles: true,
        scheduledStart: true,
        scheduledEnd: true,
        preferredLocation: true,
        notes: true,
        partnerNotes: true,
        source: true,
        createdAt: true,
        userId: true,
      },
    }),
    prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: {
        id: true,
        name: true,
        email: true,
        profile: {
          select: {
            phone: true,
            dateOfBirth: true,
            city: true,
            state: true,
            medicalConditions: true,
            allergies: true,
            medications: true,
            preferredContact: true,
          },
        },
      },
    }),
    prisma.patientChartNote.count({
      where: { patientEmail: email, archivedAt: null },
    }),
    prisma.patientFile.count({
      where: { patientEmail: email, archivedAt: null },
    }),
  ]);

  const latestName =
    intakes[0]?.fullName || bookings[0]?.fullName || user?.name || email;
  const phone =
    user?.profile?.phone || intakes[0]?.phone || bookings[0]?.phone || "";
  const dateOfBirth =
    user?.profile?.dateOfBirth ||
    intakes[0]?.dateOfBirth ||
    bookings[0]?.patientDateOfBirth ||
    "";

  const legacySignatures: Array<{
    id: string;
    label: string;
    url: string;
    source: "intake" | "booking";
    createdAt: string;
  }> = [];

  for (const intake of intakes) {
    if (intake.clientSignatureDataUrl?.startsWith("data:image")) {
      legacySignatures.push({
        id: `intake-client-${intake.id}`,
        label: "Client signature (intake)",
        url: intake.clientSignatureDataUrl,
        source: "intake",
        createdAt: intake.createdAt.toISOString(),
      });
    }
    if (intake.providerSignatureDataUrl?.startsWith("data:image")) {
      legacySignatures.push({
        id: `intake-provider-${intake.id}`,
        label: "Provider signature (intake)",
        url: intake.providerSignatureDataUrl,
        source: "intake",
        createdAt: intake.createdAt.toISOString(),
      });
    }
  }

  for (const booking of bookings) {
    const { signatures } = splitBookingNotes(booking.notes);
    for (const [idx, sig] of signatures.entries()) {
      legacySignatures.push({
        id: `booking-sig-${booking.id}-${idx}`,
        label: `${sig.label} (booking)`,
        url: sig.src,
        source: "booking",
        createdAt: booking.createdAt.toISOString(),
      });
    }
  }

  await writeAuditLog({
    userId: access.userId,
    action: "provider.patient.chart.read",
    entityType: "PatientChart",
    entityId: email,
    metadata: { partnerId: access.partner.id },
  });

  return NextResponse.json({
    patient: {
      email,
      userId: user?.id || intakes[0]?.userId || bookings[0]?.userId || null,
      name: latestName,
      phone,
      dateOfBirth,
      city: user?.profile?.city ?? "",
      state: user?.profile?.state ?? "",
      medicalConditions: user?.profile?.medicalConditions ?? "",
      allergies: user?.profile?.allergies ?? "",
      medications: user?.profile?.medications ?? "",
      preferredContact: user?.profile?.preferredContact ?? "",
      notesCount,
      filesCount,
    },
    intakes: intakes.map((row) => ({
      id: row.id,
      status: row.status,
      programs: row.programs,
      createdAt: row.createdAt.toISOString(),
    })),
    bookings: bookings.map((row) => ({
      id: row.id,
      status: row.status,
      serviceTitles: row.serviceTitles,
      scheduledStart: row.scheduledStart?.toISOString() ?? null,
      preferredLocation: row.preferredLocation,
      source: row.source,
      partnerNotes: row.partnerNotes,
      clientNotesPreview: splitBookingNotes(row.notes).text.slice(0, 280),
      createdAt: row.createdAt.toISOString(),
    })),
    legacySignatures,
  });
}

export function patientKeyFromEmail(email: string) {
  return encodeURIComponent(normalizePatientEmail(email));
}
