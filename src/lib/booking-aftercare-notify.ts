import { sendTransactionalEmail } from "@/lib/email";
import { APPOINTMENT_AFTERCARE } from "@/lib/booking-aftercare";
import { buildAppointmentAftercareEmail, buildBookingConfirmationEmail } from "@/lib/email-templates";
import { bookingIncludesAftercare } from "@/lib/bookings/aftercare-services";
import { publicAppBaseUrl } from "@/lib/intake/tracking";

export async function notifyBookingConfirmed(booking: {
  email: string;
  fullName?: string | null;
  serviceIds: string[];
  serviceTitles: string[];
  scheduledStart: Date | null;
  preferredDate: Date;
  timezone?: string | null;
  preferredLocation: string;
}) {
  if (!booking.email?.trim()) return;

  const tz = booking.timezone ?? "America/New_York";
  const when = booking.scheduledStart ?? booking.preferredDate;
  const scheduledLabel = when.toLocaleString("en-US", {
    timeZone: tz,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  try {
    const content = buildBookingConfirmationEmail({
      fullName: booking.fullName,
      serviceTitles: booking.serviceTitles,
      scheduledLabel,
      location: booking.preferredLocation,
      includeAftercare: bookingIncludesAftercare(booking.serviceIds),
      dashboardUrl: `${publicAppBaseUrl()}/dashboard/services`,
    });
    await sendTransactionalEmail({
      to: booking.email,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });
  } catch (err) {
    console.error("[booking] confirmation email failed:", err);
  }
}

export async function notifyBookingCompleted(booking: {
  email: string;
  fullName?: string | null;
  serviceTitles: string[];
}) {
  if (!booking.email?.trim()) return;

  try {
    const content = buildAppointmentAftercareEmail({
      fullName: booking.fullName,
      serviceTitles: booking.serviceTitles,
      dashboardUrl: `${publicAppBaseUrl()}/dashboard/services`,
    });
    await sendTransactionalEmail({
      to: booking.email,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });
  } catch (err) {
    console.error("[booking] aftercare email failed:", err);
  }
}

export { APPOINTMENT_AFTERCARE };
