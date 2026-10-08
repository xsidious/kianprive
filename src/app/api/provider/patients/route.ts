import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";

/** Practitioners see patients from intakes and bookings assigned to them — not the full member directory. */
export async function GET() {
  const access = await requirePartnerProfile("practitioner");
  if (!access.ok) return access.response;
  if (access.partner.type !== "PROVIDER") {
    return NextResponse.json({ error: "Provider access required." }, { status: 403 });
  }

  const partnerId = access.partner.id;

  const [intakes, bookings] = await Promise.all([
    prisma.therapeuticsIntakeSubmission.findMany({
      where: { assignedPartnerId: partnerId },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        status: true,
        createdAt: true,
        userId: true,
      },
    }),
    prisma.bookingRequest.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        patientDateOfBirth: true,
        status: true,
        createdAt: true,
        serviceTitles: true,
        userId: true,
      },
    }),
  ]);

  const byEmail = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      phone: string;
      dateOfBirth: string;
      status: string;
      source: "intake" | "booking" | "both";
      intakeId: string | null;
      bookingId: string | null;
      lastActivityAt: string;
      serviceTitles: string[];
      medicalConditions: string;
      allergies: string;
      medications: string;
      city: string;
      state: string;
      preferredContact: string;
    }
  >();

  for (const intake of intakes) {
    const email = intake.email.trim().toLowerCase();
    if (!email) continue;
    byEmail.set(email, {
      id: intake.userId || intake.id,
      name: intake.fullName,
      email: intake.email,
      phone: intake.phone,
      dateOfBirth: intake.dateOfBirth,
      status: intake.status,
      source: "intake",
      intakeId: intake.id,
      bookingId: null,
      lastActivityAt: intake.createdAt.toISOString(),
      serviceTitles: [],
      medicalConditions: "",
      allergies: "",
      medications: "",
      city: "",
      state: "",
      preferredContact: "",
    });
  }

  for (const booking of bookings) {
    const email = booking.email.trim().toLowerCase();
    if (!email) continue;
    const existing = byEmail.get(email);
    if (existing) {
      existing.source = existing.source === "intake" ? "both" : existing.source;
      existing.bookingId = booking.id;
      existing.serviceTitles = booking.serviceTitles;
      if (new Date(booking.createdAt) > new Date(existing.lastActivityAt)) {
        existing.lastActivityAt = booking.createdAt.toISOString();
        existing.status = booking.status;
      }
      if (!existing.phone && booking.phone) existing.phone = booking.phone;
      if (!existing.dateOfBirth && booking.patientDateOfBirth) {
        existing.dateOfBirth = booking.patientDateOfBirth;
      }
    } else {
      byEmail.set(email, {
        id: booking.userId || booking.id,
        name: booking.fullName,
        email: booking.email,
        phone: booking.phone,
        dateOfBirth: booking.patientDateOfBirth || "",
        status: booking.status,
        source: "booking",
        intakeId: null,
        bookingId: booking.id,
        lastActivityAt: booking.createdAt.toISOString(),
        serviceTitles: booking.serviceTitles,
        medicalConditions: "",
        allergies: "",
        medications: "",
        city: "",
        state: "",
        preferredContact: "",
      });
    }
  }

  const emails = [...byEmail.keys()];
  if (emails.length) {
    const users = await prisma.user.findMany({
      where: { email: { in: emails, mode: "insensitive" } },
      select: {
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
    });
    for (const user of users) {
      const row = byEmail.get(user.email.toLowerCase());
      if (!row || !user.profile) continue;
      if (!row.phone && user.profile.phone) row.phone = user.profile.phone;
      if (!row.dateOfBirth && user.profile.dateOfBirth) row.dateOfBirth = user.profile.dateOfBirth;
      row.city = user.profile.city ?? "";
      row.state = user.profile.state ?? "";
      row.medicalConditions = user.profile.medicalConditions ?? "";
      row.allergies = user.profile.allergies ?? "";
      row.medications = user.profile.medications ?? "";
      row.preferredContact = user.profile.preferredContact ?? "";
    }
  }

  const patients = [...byEmail.values()].sort(
    (a, b) => +new Date(b.lastActivityAt) - +new Date(a.lastActivityAt),
  );

  return NextResponse.json({ patients });
}
