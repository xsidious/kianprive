import { sendTransactionalEmail } from "@/lib/email";
import { APPOINTMENT_AFTERCARE } from "@/lib/booking-aftercare";
import { buildAppointmentAftercareEmail } from "@/lib/email-templates";
import { publicAppBaseUrl } from "@/lib/intake/tracking";

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
