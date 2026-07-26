import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CircleHelp, MapPin, MessageCircleMore, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, conciergeEmail } from "@/lib/contact";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

function buildChatMailto(booking: {
  id: string;
  serviceTitles: string[];
  preferredDate: Date;
  preferredLocation: string;
}) {
  const subject = `Service booking support request (${booking.id.slice(0, 8)})`;
  const body = [
    "Hi KIAN Privé team,",
    "",
    "I need help with my booked service.",
    `Booking reference: ${booking.id}`,
    `Services: ${booking.serviceTitles.join(", ")}`,
    `Requested date: ${booking.preferredDate.toISOString().slice(0, 10)}`,
    `Location: ${booking.preferredLocation}`,
    "",
    "My question:",
  ].join("\n");
  return `mailto:${conciergeEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildBookingWhatsAppMessage(booking: {
  id: string;
  serviceTitles: string[];
  preferredDate: Date;
  preferredLocation: string;
}) {
  return buildWhatsAppUrl(
    `Hi KIAN Privé team, I have a question about my booking ${booking.id}. Services: ${booking.serviceTitles.join(", ")}. Requested date: ${booking.preferredDate.toISOString().slice(0, 10)}. Location: ${booking.preferredLocation}.`,
  );
}

export default async function DashboardServicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const bookings = await prisma.bookingRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <EditorialEyebrow>
              <span className="inline-flex items-center gap-2">
                <Sparkles size={14} /> MY SERVICES
              </span>
            </EditorialEyebrow>
            <h1 className="mt-4 font-serif text-4xl text-[#1f1a15]">My Booked Services</h1>
            <p className="mt-2 text-[#6f6251]">
              Track all submitted bookings and chat with our concierge team about any request.
            </p>
          </div>
          <Link href="/book-online" className={editorialCtaPrimary}>
            BOOK NEW SERVICE
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className={`mt-8 ${editorialPanel} p-8`}>
            <p className="text-lg text-[#2b2218]">No service bookings yet.</p>
            <p className="mt-2 text-sm text-[#6f6251]">
              Once you submit a booking, it will appear here with status updates and support actions.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {bookings.map((booking) => (
              <article key={booking.id} className={`${editorialPanel} p-6`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">
                      BOOKING #{booking.id.slice(0, 8).toUpperCase()}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl text-[#1f1a15]">{booking.serviceTitles.join(", ")}</h2>
                  </div>
                  <span className="rounded-sm border border-[#b78d4b55] bg-[#fff8eb] px-3 py-1 text-xs tracking-[0.08em] text-[#8f6f3e]">
                    {booking.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-[#5f5344] md:grid-cols-3">
                  <div className={`${editorialPanel} p-3`}>
                    <p className="inline-flex items-center gap-1 text-xs tracking-[0.1em] text-[#8f6f3e]">
                      <CalendarDays size={13} /> SCHEDULED
                    </p>
                    <p className="mt-1">
                      {booking.scheduledStart
                        ? booking.scheduledStart.toLocaleString("en-US", {
                            timeZone: booking.timezone ?? "America/New_York",
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : booking.preferredDate.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  <div className={`${editorialPanel} p-3`}>
                    <p className="inline-flex items-center gap-1 text-xs tracking-[0.1em] text-[#8f6f3e]">
                      <MapPin size={13} /> LOCATION
                    </p>
                    <p className="mt-1">{booking.preferredLocation}</p>
                  </div>
                  <div className={`${editorialPanel} p-3`}>
                    <p className="text-xs tracking-[0.1em] text-[#8f6f3e]">TOTAL (MEMBER)</p>
                    <p className="mt-1">${Number(booking.memberTotal).toFixed(2)}</p>
                  </div>
                </div>

                {booking.notes ? <p className="mt-4 text-sm text-[#6f6251]">{booking.notes}</p> : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={buildChatMailto(booking)} className={editorialCtaPrimary}>
                    EMAIL CONCIERGE
                  </a>
                  <a
                    href={buildBookingWhatsAppMessage(booking)}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 ${editorialCtaSecondary}`}
                  >
                    <MessageCircleMore size={15} />
                    WHATSAPP CHAT
                  </a>
                  <Link href="/contact" className={editorialCtaSecondary}>
                    OPEN CONTACT PAGE
                  </Link>
                  <Link href="/dashboard/profile" className={`inline-flex items-center gap-2 ${editorialCtaSecondary}`}>
                    <CircleHelp size={15} />
                    UPDATE PROFILE
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </EditorialSection>
    </div>
  );
}
