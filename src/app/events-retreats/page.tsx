"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CinematicHero } from "@/components/ui/CinematicHero";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialInput,
  editorialPanel,
} from "@/components/ui/editorial-primitives";
import { getFeaturedRetreatEvent, retreatEvents, type RetreatEvent } from "@/lib/events";

export default function EventsRetreatsPage() {
  const [openModal, setOpenModal] = useState<null | "invite" | "consultation" | "rsvp">(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [events, setEvents] = useState<RetreatEvent[]>(retreatEvents);
  const featuredEvent = events.find((event) => event.featured) ?? getFeaturedRetreatEvent();

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch("/api/retreats");
        if (!response.ok) return;
        const payload = (await response.json()) as { events?: RetreatEvent[] };
        if (Array.isArray(payload.events) && payload.events.length > 0) {
          setEvents(payload.events);
        }
      } catch {
        // Keep fallback data available.
      }
    }
    void loadEvents();
  }, []);

  return (
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="EVENTS & RETREATS"
        lineOne="Escape to natural"
        lineTwo="wellness retreats."
        lineThree="Find your sanctuary."
        description="We guide you through personalized, global journeys of relaxation, rejuvenation, and learning. Uncover nature's secrets to longevity as you indulge in nourishing treatments and find blissful balance."
        primaryCta={{ label: "View Events", href: "#events" }}
        secondaryCta={{ label: "Book Online", href: "/book-online" }}
        imageSrc="/images/stock/hero-luxury-clinic.jpg"
        imageAlt="Luxury retreat event"
      />

      <EditorialSection>
        <EditorialEyebrow>STAY CONNECTED</EditorialEyebrow>
        <p className="mt-4 max-w-3xl text-[#6f6251]">
          Immerse yourself in the ultimate natural wellness experience — let nature be your sanctuary.
        </p>
        <div className={`mt-6 ${editorialPanel} border-[#1f7a7a4f] bg-[#eef8f8] p-4`}>
          <p className="text-xs tracking-[0.18em] text-[#1b6568]">NEXT EVENT</p>
          <p className="mt-2 text-sm text-[#28585a]">
            <strong>Corporate Health &amp; Wellness Day</strong> is coming soon. Retreats begin in September.
          </p>
        </div>

        <div className={`mt-6 ${editorialPanel} p-5`}>
          <p className="text-sm text-[#8f6f3e]">Join our list to opt-in for event launches &amp; promotions!</p>
          <form
            className="mt-3 flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              setSubscribed(true);
            }}
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., name@example.com"
              className={`min-w-[220px] flex-1 ${editorialInput}`}
              type="email"
            />
            <button type="submit" className={editorialCtaPrimary}>
              SUBSCRIBE
            </button>
          </form>
          {subscribed ? <p className="mt-2 text-xs text-[#8f6f3e]">Subscribed successfully.</p> : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => setOpenModal("invite")} className={editorialCtaPrimary}>
            REQUEST INVITE
          </button>
          <button type="button" onClick={() => setOpenModal("consultation")} className={editorialCtaSecondary}>
            BOOK CONSULTATION
          </button>
        </div>
      </EditorialSection>

      <EditorialSection id="events">
        <EditorialEyebrow>UPCOMING</EditorialEyebrow>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Upcoming Events</h2>
          <span className="text-sm text-[#8f6f3e]">Facebook</span>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.slug}
              className={`${editorialPanel} p-5 ${event.featured ? "border-[#1f7a7a55] ring-1 ring-[#1f7a7a33]" : ""}`}
            >
              {event.featured ? (
                <p className="mb-2 text-xs tracking-[0.16em] text-[#1b6568]">FEATURED · COMING SOON</p>
              ) : null}
              <div className="relative mb-4 h-44 overflow-hidden rounded-sm border border-[#e4d9c8]">
                <Image src={event.image} alt={event.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <p className="text-xl text-[#2b2218]">{event.title}</p>
              {event.host ? <p className="mt-1 text-xs text-[#8f6f3e]">Presented by {event.host}</p> : null}
              <p className="mt-3 text-sm leading-relaxed text-[#5f5344]">{event.subtitle}</p>
              {event.ticketPrice ? (
                <p className="mt-2 text-sm font-medium text-[#2b2218]">Tickets from {event.ticketPrice}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/events-retreats/${event.slug}`} className={editorialCtaSecondary}>
                  MORE INFO
                </Link>
                {event.ticketUrl ? (
                  <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className={editorialCtaPrimary}>
                    GET TICKETS
                  </a>
                ) : (
                  <Link href={`/events-retreats/${event.slug}?intent=rsvp`} className={editorialCtaPrimary}>
                    RSVP
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>FEATURED</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Featured Event</h2>
        <div className={`mt-6 grid items-center gap-8 ${editorialPanel} border-[#1f7a7a45] p-8 lg:grid-cols-[1.05fr_0.95fr]`}>
          <div>
            <p className="text-sm tracking-[0.16em] text-[#1b6568]">FEATURED EVENT</p>
            <h3 className="mt-2 font-serif text-3xl text-[#1f1a15] md:text-4xl">{featuredEvent.title}</h3>
            {featuredEvent.host ? (
              <p className="mt-2 text-sm text-[#8f6f3e]">Presented by {featuredEvent.host}</p>
            ) : null}
            <p className="mt-3 text-[#5f5344]">{featuredEvent.description}</p>
            <p className="mt-3 text-sm text-[#6f6251]">{featuredEvent.when}</p>
            <p className="text-sm text-[#6f6251]">{featuredEvent.location}</p>
            {featuredEvent.ticketPrice ? (
              <p className="mt-2 text-sm font-medium text-[#2b2218]">Ticket price: {featuredEvent.ticketPrice}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-3">
              {featuredEvent.ticketUrl ? (
                <a href={featuredEvent.ticketUrl} target="_blank" rel="noopener noreferrer" className={editorialCtaPrimary}>
                  GET TICKETS ON LUMA
                </a>
              ) : null}
              <Link href={`/events-retreats/${featuredEvent.slug}`} className={editorialCtaSecondary}>
                FULL EVENT DETAILS
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative h-[220px] overflow-hidden rounded-sm border border-[#e4d9c8] sm:h-[260px]">
              <Image src={featuredEvent.image} alt={featuredEvent.title} fill className="object-cover" />
            </div>
            {featuredEvent.flyerImage ? (
              <div className="relative h-[180px] overflow-hidden rounded-sm border border-[#e4d9c8] bg-[#f8faf6]">
                <Image src={featuredEvent.flyerImage} alt={`${featuredEvent.title} flyer`} fill className="object-contain p-2" />
              </div>
            ) : null}
          </div>
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>OUR STORY</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">My Journey to KIAN</h2>
        <div className={`mt-6 grid gap-8 ${editorialPanel} p-8 lg:grid-cols-[0.45fr_0.55fr]`}>
          <div className="relative h-[340px] overflow-hidden rounded-sm border border-[#e4d9c8]">
            <Image src="/images/AlyciaLerer.png" alt="Alycia Lerer founder" fill className="object-cover" />
          </div>
          <div className="space-y-4 text-[#5f5344]">
            <p>
              For over 25 years, I lived under the bright lights of the modeling world, then navigated the high-stakes realm of
              entertainment as a senior-level executive. Beneath the surface of success, a deeper calling emerged.
            </p>
            <p>
              &quot;Keeping it All Natural&quot; is the KIAN philosophy and more than a tagline. It is the core belief that fueled the birth of the
              KIAN Beauty and Wellness Center and KIAN Events.
            </p>
            <p>
              KIAN is about proactive self-care, finding harmony between body, mind, and spirit, and realizing that health is the greatest
              wealth we possess. Through KIAN events, we bridge intention and action so you can live well from the inside out.
            </p>
            <p>
              I am looking forward to seeing you there!
              <br />
              <span className="text-[#8f6f3e]">Alycia, Founder — KIAN Retreats & Events</span>
            </p>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection>
        <div className={`${editorialPanel} p-5`}>
          <p className="text-xs tracking-[0.18em] text-[#8f6f3e]">RETREATS & EVENTS POLICIES</p>
          <p className="mt-2 text-sm text-[#6f6251]">
            Booking, cancellation, travel insurance, and event guarantees for retreats and events are covered in our dedicated
            terms — separate from KIAN Privé membership and concierge service policies.
          </p>
          <Link href="/terms-and-conditions" className={`mt-4 ${editorialCtaSecondary}`}>
            VIEW RETREATS & EVENTS TERMS
          </Link>
        </div>
      </EditorialSection>

      {openModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className={`w-full max-w-2xl ${editorialPanel} bg-white p-6 shadow-[0_25px_45px_-20px_rgba(0,0,0,0.4)]`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">
                  {openModal === "invite" ? "REQUEST INVITE" : openModal === "rsvp" ? "RSVP" : "BOOK CONSULTATION"}
                </p>
                <h2 className="mt-2 font-serif text-2xl text-[#1f1a15]">
                  {openModal === "invite"
                    ? "Join Upcoming Events & Retreats"
                    : openModal === "rsvp"
                      ? "Reserve Your Event Seat"
                      : "Schedule Your Retreat Consultation"}
                </h2>
              </div>
              <button onClick={() => setOpenModal(null)} className="rounded-sm border border-[#b78d4b40] p-2 text-[#6f6251]">
                <X size={16} />
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2">
              <input className={editorialInput} placeholder="Full Name" />
              <input className={editorialInput} placeholder="Email" type="email" />
              <input className={editorialInput} placeholder="Phone" />
              <input className={editorialInput} type="date" />
              <textarea
                className={`min-h-[120px] ${editorialInput} md:col-span-2`}
                placeholder={
                  openModal === "invite"
                    ? "Tell us which retreat experience interests you."
                    : openModal === "rsvp"
                      ? "Tell us which event you want to RSVP for."
                      : "Tell us your consultation goals."
                }
              />
              <button type="button" className={`${editorialCtaPrimary} md:col-span-2`}>
                SUBMIT REQUEST
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
