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

  return (
    <div>
      <SectionWrapper className="pt-14 sm:pt-16 md:pt-18">
        <div className="grid gap-8 rounded-3xl border border-[#b78d4b2d] bg-white p-5 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] sm:p-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">EVENT DETAILS</p>
            <h1 className="mt-3 text-3xl text-[#1f1a15] sm:text-4xl">{event.title}</h1>
            <p className="mt-4 text-[#5f5344]">{event.description}</p>
            <div className="mt-5 space-y-2 text-sm text-[#6f6251]">
              <p>When: {event.when}</p>
              <p>Location: {event.location}</p>
            </div>
            <Link href="/events-retreats" className="mt-6 inline-flex rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">
              Back to Events
            </Link>
          </div>
          <div className="relative h-[300px] overflow-hidden rounded-2xl border border-[#b78d4b2d] sm:h-[380px]">
            <Image src={event.image} alt={event.title} fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="rounded-3xl border border-[#b78d4b2d] bg-white p-5 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] sm:p-8">
          <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">{intent === "rsvp" ? "RSVP" : "REQUEST INVITATION"}</p>
          <h2 className="mt-2 text-2xl text-[#1f1a15] sm:text-3xl">Submit Your Details</h2>
          <p className="mt-2 text-[#6f6251]">
            Complete this form and our team will send your invitation details, schedule updates, and next steps.
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
              Send Invitation Request
            </button>
          </form>
        </div>
      </SectionWrapper>
    </div>
  );
}
