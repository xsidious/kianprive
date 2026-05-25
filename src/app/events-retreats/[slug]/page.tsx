import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getRetreatEventsFromStore, getRetreatEventFromStoreBySlug } from "@/lib/events-store";

export async function generateStaticParams() {
  const events = await getRetreatEventsFromStore();
  return events.map((event) => ({ slug: event.slug }));
}

export default async function EventDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ intent?: string }>;
}) {
  const { slug } = await params;
  const { intent } = await searchParams;
  const event = await getRetreatEventFromStoreBySlug(slug);

  if (!event) notFound();

  const isCorporate = slug === "corporate-health-wellness-day";

  return (
    <div>
      <SectionWrapper className="pt-14 sm:pt-16 md:pt-18">
        <div className="grid gap-8 rounded-3xl border border-[#b78d4b2d] bg-white p-5 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] sm:p-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">EVENT DETAILS</p>
            <h1 className="mt-3 text-3xl text-[#1f1a15] sm:text-4xl md:text-5xl">{event.title}</h1>
            {event.host ? <p className="mt-2 text-sm text-[#8f6f3e]">Presented by {event.host}</p> : null}
            <p className="mt-4 leading-relaxed text-[#5f5344]">{event.description}</p>
            <div className="mt-5 space-y-2 text-sm text-[#6f6251]">
              <p>
                <span className="font-medium text-[#3b3024]">When:</span> {event.when}
              </p>
              <p>
                <span className="font-medium text-[#3b3024]">Location:</span> {event.location}
              </p>
              {event.ticketPrice ? (
                <p>
                  <span className="font-medium text-[#3b3024]">Ticket price:</span> {event.ticketPrice}
                </p>
              ) : null}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {event.ticketUrl ? (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white"
                >
                  Get Tickets on Luma
                </a>
              ) : null}
              <Link href="/events-retreats" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">
                Back to Events
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative h-[280px] overflow-hidden rounded-2xl border border-[#b78d4b2d] sm:h-[340px]">
              <Image src={event.image} alt={event.title} fill className="object-cover" priority />
            </div>
            {event.flyerImage ? (
              <div className="relative h-[220px] overflow-hidden rounded-2xl border border-[#b78d4b2d] bg-[#f8faf6] sm:h-[280px]">
                <Image src={event.flyerImage} alt={`${event.title} event flyer`} fill className="object-contain p-3" />
              </div>
            ) : null}
          </div>
        </div>
      </SectionWrapper>

      {event.highlights?.length ? (
        <SectionWrapper>
          <h2 className="text-2xl text-[#1f1a15] sm:text-3xl">
            {isCorporate ? "What to Expect" : "Event Highlights"}
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {event.highlights.map((item) => (
              <article key={item} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4 text-[#5f5344]">
                {item}
              </article>
            ))}
          </div>
          {isCorporate ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-[#1f7a7a33] bg-[#eef8f8] p-4 text-center">
                <p className="text-sm font-medium text-[#1b6568]">Move Your Body</p>
                <p className="mt-2 text-xs text-[#28585a]">Feel stronger, perform better.</p>
              </article>
              <article className="rounded-2xl border border-[#1f7a7a33] bg-[#eef8f8] p-4 text-center">
                <p className="text-sm font-medium text-[#1b6568]">Clear Your Mind</p>
                <p className="mt-2 text-xs text-[#28585a]">Reduce stress, increase focus.</p>
              </article>
              <article className="rounded-2xl border border-[#1f7a7a33] bg-[#eef8f8] p-4 text-center">
                <p className="text-sm font-medium text-[#1b6568]">Connect With Others</p>
                <p className="mt-2 text-xs text-[#28585a]">Build relationships, boost culture.</p>
              </article>
            </div>
          ) : null}
        </SectionWrapper>
      ) : null}

      {event.ticketUrl ? (
        <SectionWrapper>
          <div className="rounded-3xl border border-[#b78d4b4f] bg-gradient-to-b from-[#fff8ed] to-[#f1e7d7] p-8 text-center shadow-[0_18px_40px_-30px_rgba(66,45,14,0.45)]">
            <h2 className="text-2xl text-[#1f1a15] sm:text-3xl">Register Today</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[#5f5344]">
              Join us for a healthier, happier workplace—together. Secure your ticket through our official event page on Luma.
            </p>
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-full bg-[#b78d4b] px-6 py-3 text-sm text-white"
            >
              Get Tickets{event.ticketPrice ? ` · ${event.ticketPrice}` : ""}
            </a>
          </div>
        </SectionWrapper>
      ) : null}

      <SectionWrapper>
        <div className="rounded-3xl border border-[#b78d4b2d] bg-white p-5 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] sm:p-8">
          <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">{intent === "rsvp" ? "RSVP" : "REQUEST INVITATION"}</p>
          <h2 className="mt-2 text-2xl text-[#1f1a15] sm:text-3xl">
            {event.ticketUrl ? "Questions About This Event?" : "Submit Your Details"}
          </h2>
          <p className="mt-2 text-[#6f6251]">
            {event.ticketUrl
              ? "For group bookings or KIAN Privé partnership inquiries, send us a note and our team will follow up."
              : "Complete this form and our team will send your invitation details, schedule updates, and next steps."}
          </p>
          <form className="mt-6 grid gap-4 md:grid-cols-2">
            <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="First name" />
            <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Last name" />
            <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Email" type="email" />
            <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Phone" />
            <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" type="date" />
            <textarea
              className="min-h-[120px] rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 md:col-span-2"
              placeholder="Tell us your goals, number of guests, and preferred scheduling details."
            />
            <button type="button" className="rounded-full bg-[#b78d4b] px-6 py-3 text-white md:col-span-2">
              {event.ticketUrl ? "Send Inquiry" : "Send Invitation Request"}
            </button>
          </form>
        </div>
      </SectionWrapper>
    </div>
  );
}
