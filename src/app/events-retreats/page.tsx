"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { retreatEvents } from "@/lib/events";

export default function EventsRetreatsPage() {
  const [openModal, setOpenModal] = useState<null | "invite" | "consultation" | "rsvp">(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div>
      <SectionWrapper className="pt-14 sm:pt-16 md:pt-18">
        <div className="grid items-center gap-8 rounded-3xl border border-[#b78d4b2e] bg-white p-5 shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)] sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm text-[#8f6f3e]">Beauty and Wellness</p>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">EVENTS & RETREATS</p>
            <h1 className="mt-4 text-3xl text-[#1f1a15] sm:text-4xl md:text-5xl">Escape to Keeping It All Natural Retreats</h1>
            <p className="mt-5 text-[#6f6251]">
              We guide you through personalized, global journeys of relaxation, rejuvenation, and learning. Uncover nature&apos;s secrets to
              longevity as you indulge in nourishing treatments, explore sustainable practices, and find blissful balance.
            </p>
            <p className="mt-3 text-[#6f6251]">
              Immerse yourself in the ultimate natural wellness experience — let nature be your sanctuary.
            </p>

            <div className="mt-7 rounded-2xl border border-[#b78d4b30] bg-[#fffaf2] p-4">
              <p className="text-sm text-[#8f6f3e]">Join our list to opt-in for event launches & promotions!</p>
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
                  className="min-w-[220px] flex-1 rounded-xl border border-[#b78d4b35] bg-white p-3"
                  type="email"
                />
                <button className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">Subscribe</button>
              </form>
              {subscribed ? <p className="mt-2 text-xs text-[#8f6f3e]">Subscribed successfully.</p> : null}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => setOpenModal("invite")}
                className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white"
              >
                Request Invite
              </button>
              <button
                onClick={() => setOpenModal("consultation")}
                className="rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-5 py-2 text-sm text-[#3b3024]"
              >
                Book Consultation
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative h-[220px] overflow-hidden rounded-3xl border border-[#b78d4b36] sm:h-[250px]">
              <Image src="/images/stock/hero-luxury-clinic.jpg" alt="Luxury retreat event" fill className="object-cover" />
            </div>
            <div className="relative h-[120px] overflow-hidden rounded-3xl border border-[#b78d4b36] sm:h-[130px]">
              <Image src="/images/beauty.avif" alt="Beauty and wellness gathering" fill className="object-cover" />
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Upcoming Events</h2>
          <span className="text-sm text-[#8f6f3e]">Facebook</span>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {retreatEvents.map((event) => (
            <article key={event.title} className="rounded-2xl border border-[#b78d4b2d] bg-white p-5 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
              <div className="relative mb-4 h-40 overflow-hidden rounded-xl border border-[#b78d4b2d]">
                <Image src={event.image} alt={event.title} fill className="object-cover" />
              </div>
              <p className="text-xl text-[#2b2218]">{event.title}</p>
              <p className="mt-3 text-sm text-[#5f5344]">{event.subtitle}</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/events-retreats/${event.slug}`} className="rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-4 py-2 text-xs text-[#3b3024]">
                  More info
                </Link>
                <Link href={`/events-retreats/${event.slug}?intent=rsvp`} className="rounded-full bg-[#b78d4b] px-4 py-2 text-xs text-white">
                  RSVP
                </Link>
              </div>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-4 text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Featured Event</h2>
        <div className="grid items-center gap-8 rounded-3xl border border-[#b78d4b2d] bg-white p-8 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)] lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm text-[#8f6f3e]">INSIDE - OUT • MIAMI wellness RETREAT</p>
            <h3 className="mt-2 text-3xl text-[#1f1a15]">Oriental Lotus</h3>
            <p className="mt-2 text-[#5f5344]">Hosted by Cherie Johnson — Celebrity Nutritionist</p>
            <button onClick={() => setOpenModal("consultation")} className="mt-5 rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
              Learn More
            </button>
          </div>
          <div className="relative h-[260px] overflow-hidden rounded-2xl border border-[#b78d4b2d]">
            <Image src="/images/stock/service-wellness.jpg" alt="Featured retreat event" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-4 text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">My Journey to KIAN</h2>
        <div className="grid gap-8 rounded-3xl border border-[#b78d4b2d] bg-white p-8 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)] lg:grid-cols-[0.45fr_0.55fr]">
          <div className="relative h-[340px] overflow-hidden rounded-2xl border border-[#b78d4b2d]">
            <Image src="/images/AlyciaLerer.avif" alt="Alycia Lerer founder" fill className="object-cover" />
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
              I am looking forward to seeing you there!<br />
              <span className="text-[#8f6f3e]">Alycia, Founder — KIAN Retreats & Events</span>
            </p>
          </div>
        </div>
      </SectionWrapper>

      {openModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-[#b78d4b45] bg-white p-6 shadow-[0_25px_45px_-20px_rgba(0,0,0,0.4)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">
                  {openModal === "invite" ? "REQUEST INVITE" : openModal === "rsvp" ? "RSVP" : "BOOK CONSULTATION"}
                </p>
                <h2 className="mt-2 text-2xl text-[#1f1a15]">
                  {openModal === "invite"
                    ? "Join Upcoming Events & Retreats"
                    : openModal === "rsvp"
                      ? "Reserve Your Event Seat"
                      : "Schedule Your Retreat Consultation"}
                </h2>
              </div>
              <button onClick={() => setOpenModal(null)} className="rounded-full border border-[#b78d4b40] p-2 text-[#6f6251]">
                <X size={16} />
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Full Name" />
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Email" type="email" />
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Phone" />
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" type="date" />
              <textarea
                className="min-h-[120px] rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 md:col-span-2"
                placeholder={
                  openModal === "invite"
                    ? "Tell us which retreat experience interests you."
                    : openModal === "rsvp"
                      ? "Tell us which event you want to RSVP for."
                      : "Tell us your consultation goals."
                }
              />
              <button type="button" className="rounded-full bg-[#b78d4b] px-6 py-3 text-white md:col-span-2">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
