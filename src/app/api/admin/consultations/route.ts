import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { CONSULTATION_SERVICE_SLUGS, bookingHasConsultation, bookingHasTelemedicine } from "@/lib/consultations";
import { prisma } from "@/lib/prisma";

/** Admin: all practitioner consultations & telemedicine bookings with provider attribution. */
export async function GET(req: Request) {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get("providerId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const kind = searchParams.get("kind") ?? "all"; // all | telemedicine | consultation

  const bookings = await prisma.bookingRequest.findMany({
    where: {
      ...(providerId ? { partnerId: providerId } : {}),
      ...(status ? { status: status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" } : {}),
      OR: [
        { serviceIds: { hasSome: [...CONSULTATION_SERVICE_SLUGS] } },
        { partner: { type: "PROVIDER" } },
      ],
    },
    include: {
      partner: {
        select: {
          id: true,
          displayName: true,
          partnerCode: true,
          type: true,
          specialty: true,
          user: { select: { email: true } },
        },
      },
    },
    orderBy: [{ scheduledStart: "desc" }, { createdAt: "desc" }],
    take: 500,
  });

  const filtered = bookings.filter((b) => {
    if (kind === "telemedicine") return bookingHasTelemedicine(b.serviceIds);
    if (kind === "consultation") return bookingHasConsultation(b.serviceIds);
    return true;
  });

  const providers = await prisma.partnerProfile.findMany({
    where: { type: "PROVIDER" },
    select: { id: true, displayName: true, partnerCode: true, status: true },
    orderBy: { displayName: "asc" },
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const stats = {
    total: filtered.length,
    pending: filtered.filter((b) => b.status === "PENDING").length,
    confirmed: filtered.filter((b) => b.status === "CONFIRMED").length,
    completed: filtered.filter((b) => b.status === "COMPLETED").length,
    telemedicine: filtered.filter((b) => bookingHasTelemedicine(b.serviceIds)).length,
    unassigned: filtered.filter((b) => !b.partnerId).length,
    completedMtd: filtered.filter(
      (b) => b.status === "COMPLETED" && b.updatedAt >= monthStart,
    ).length,
  };

  return NextResponse.json({ bookings: filtered, providers, stats });
}
