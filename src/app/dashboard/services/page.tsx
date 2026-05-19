import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CircleHelp, MapPin, MessageCircleMore, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, conciergeEmail } from "@/lib/contact";

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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="inline-flex items-center gap-2 text-4xl text-[#1f1a15]"><Sparkles size={30} /> My Booked Services</h1>
          <p className="mt-2 text-[#6f6251]">Track all submitted bookings and chat with our concierge team about any request.</p>
        </div>
        <Link href="/book-online" className="rounded-full bg-[#b78d4b] px-5 py-2.5 text-sm text-white">
          Book New Service
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-[#b78d4b2d] bg-white p-8">
          <p className="text-lg text-[#2b2218]">No service bookings yet.</p>
          <p className="mt-2 text-sm text-[#6f6251]">Once you submit a booking, it will appear here with status updates and support actions.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-3xl border border-[#b78d4b2d] bg-white p-6 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">BOOKING #{booking.id.slice(0, 8).toUpperCase()}</p>
                  <h2 className="mt-2 text-2xl text-[#1f1a15]">{booking.serviceTitles.join(", ")}</h2>
                </div>
                <span className="rounded-full border border-[#b78d4b55] bg-[#fff8eb] px-3 py-1 text-xs tracking-[0.08em] text-[#8f6f3e]">
                  {booking.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-[#5f5344] md:grid-cols-3">
                <div className="rounded-xl border border-[#b78d4b24] bg-[#fffaf2] p-3">
                  <p className="inline-flex items-center gap-1 text-xs tracking-[0.1em] text-[#8f6f3e]"><CalendarDays size={13} /> SCHEDULED</p>
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
                <div className="rounded-xl border border-[#b78d4b24] bg-[#fffaf2] p-3">
                  <p className="inline-flex items-center gap-1 text-xs tracking-[0.1em] text-[#8f6f3e]"><MapPin size={13} /> LOCATION</p>
                  <p className="mt-1">{booking.preferredLocation}</p>
                </div>
                <div className="rounded-xl border border-[#b78d4b24] bg-[#fffaf2] p-3">
                  <p className="text-xs tracking-[0.1em] text-[#8f6f3e]">TOTAL (MEMBER)</p>
                  <p className="mt-1">${Number(booking.memberTotal).toFixed(2)}</p>
                </div>
              </div>

              {booking.notes ? <p className="mt-4 text-sm text-[#6f6251]">{booking.notes}</p> : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <a href={buildChatMailto(booking)} className="rounded-full bg-[#b78d4b] px-4 py-2 text-sm text-white">
                  Email Concierge
                </a>
                <a href={buildBookingWhatsAppMessage(booking)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#25d36680] bg-[#ecfff3] px-4 py-2 text-sm text-[#1f7e45]">
                  <MessageCircleMore size={15} />
                  WhatsApp Chat
                </a>
                <Link href="/contact" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">
                  Open Contact Page
                </Link>
                <Link href="/dashboard/profile" className="inline-flex items-center gap-2 rounded-full border border-[#b78d4b60] bg-[#fffaf2] px-4 py-2 text-sm text-[#3b3024]">
                  <CircleHelp size={15} />
                  Update Profile
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
