import { sendTransactionalEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function notifyPartnerNewBooking(bookingId: string) {
  try {
    const booking = await prisma.bookingRequest.findUnique({
      where: { id: bookingId },
      include: {
        partner: { include: { user: { select: { email: true, name: true } } } },
      },
    });
    if (!booking?.partner?.user.email) return;

    await sendTransactionalEmail({
      to: booking.partner.user.email,
      subject: `New booking pending — ${booking.fullName}`,
      text: [
        `Hi ${booking.partner.displayName},`,
        "",
        "You have a new booking assigned in the Partner Portal.",
        `Client: ${booking.fullName}`,
        `Email: ${booking.email}`,
        `Phone: ${booking.phone}`,
        `Services: ${booking.serviceTitles.join(", ")}`,
        `When: ${booking.scheduledStart?.toISOString() ?? "TBD"}`,
        `Location: ${booking.preferredLocation ?? "TBD"}`,
        `Status: ${booking.status}`,
        "",
        "Review and approve: https://kianprive.com/partner/bookings",
      ].join("\n"),
    });
  } catch (error) {
    console.error("[partner-notify] booking", error);
  }
}

export async function notifyPartnerPayoutPaid(payoutId: string) {
  try {
    const payout = await prisma.partnerPayout.findUnique({
      where: { id: payoutId },
      include: {
        partner: { include: { user: { select: { email: true } } } },
      },
    });
    if (!payout?.partner?.user.email) return;

    await sendTransactionalEmail({
      to: payout.partner.user.email,
      subject: `Payout marked paid — $${Number(payout.totalAmount).toFixed(2)}`,
      text: [
        `Hi ${payout.partner.displayName},`,
        "",
        "A payout period has been marked as PAID.",
        `Amount: $${Number(payout.totalAmount).toFixed(2)}`,
        `Period: ${payout.periodStart.toISOString().slice(0, 10)} – ${payout.periodEnd.toISOString().slice(0, 10)}`,
        "",
        "Download your statement from the Partner Portal → Payouts.",
      ].join("\n"),
    });
  } catch (error) {
    console.error("[partner-notify] payout", error);
  }
}
