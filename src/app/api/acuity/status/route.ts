import { NextResponse } from "next/server";
import { acuityRequest } from "@/lib/acuity/client";
import { getAcuityCredentials, getAcuitySchedulerBaseUrl, isAcuitySchedulingEnabled } from "@/lib/acuity/config";
import { getAcuityAppointmentTypeId } from "@/lib/acuity/map";
import { getBookingOptionIds } from "@/lib/services/booking-options";

/** Health check for Acuity credentials and service mappings (admin/debug). */
export async function GET() {
  const credentials = getAcuityCredentials();
  if (!credentials) {
    return NextResponse.json({
      configured: false,
      schedulingEnabled: false,
      schedulerBaseUrl: getAcuitySchedulerBaseUrl(),
      mappings: {},
    });
  }

  try {
    await acuityRequest<unknown[]>("/appointment-types", {
      searchParams: { includeInactive: 0 },
    });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        schedulingEnabled: false,
        error: error instanceof Error ? error.message : "Acuity authentication failed.",
      },
      { status: 502 },
    );
  }

  const mappings = Object.fromEntries(
    getBookingOptionIds().map((slug) => [slug, getAcuityAppointmentTypeId(slug)]),
  );

  return NextResponse.json({
    configured: true,
    schedulingEnabled: isAcuitySchedulingEnabled(),
    schedulerBaseUrl: getAcuitySchedulerBaseUrl(),
    mappings,
  });
}
