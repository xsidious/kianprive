"use client";

import { useState } from "react";
import { CinematicHero } from "@/components/ui/CinematicHero";
import { pageHeroes } from "@/lib/media/heroes";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialInput,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

export default function CorporateWellnessPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submitConsultation(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;
    setSubmitted(true);
  }

  return (
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="CORPORATE WELLNESS"
        lineOne="Corporate wellness."
        lineTwo="Concierge medicine."
        lineThree="For your organization."
        description="KIAN Privé — where modern medicine meets holistic living. Founded by a physician and a wellness coach united by a common vision: to bring natural technology and modern medicine together for a truly comprehensive approach to health."
        primaryCta={{ label: "Schedule Consultation", href: "#consultation" }}
        secondaryCta={{ label: "Book Online", href: "/book-online" }}
        imageSrc={pageHeroes.corporate.src}
        imageAlt={pageHeroes.corporate.alt}
      />

      <EditorialSection>
        <EditorialEyebrow>OUR TEAM</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Our Team</h2>
        <p className="mt-3 max-w-4xl text-[#6f6251]">
          KIAN Privé brings together a multidisciplinary team of professionals working in concert to deliver care that is both clinically
          rigorous and deeply personal.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {["Physicians", "Nurses & PAs", "Nutritionists", "Wellness coaches", "Medication therapists", "Yoga instructors"].map((role) => (
            <article key={role} className={`${editorialPanel} p-4 text-center text-[#4f4335]`}>
              {role}
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>PROGRAMS</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Corporate wellness programs</h2>
        <p className="mt-3 max-w-4xl text-[#6f6251]">
          Integrating a KIAN Privé wellness program into your organization creates measurable value for your people and your bottom line.
          Healthier employees are more focused, more resilient, and more engaged, translating directly into a more vibrant and productive
          workplace.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "For employees", detail: "Better health & energy" },
            { title: "For teams", detail: "Higher productivity" },
            { title: "For organizations", detail: "Meaningful cost savings" },
            { title: "For culture", detail: "A thriving workplace" },
          ].map((card) => (
            <article key={card.title} className={`${editorialPanel} p-5`}>
              <h3 className="text-xl text-[#2b2218]">{card.title}</h3>
              <p className="mt-2 text-[#6f6251]">{card.detail}</p>
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>APPROACH</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">The KIAN Privé approach</h2>
        <div className={`mt-6 grid gap-6 ${editorialPanel} p-8 md:grid-cols-2`}>
          <p className="text-[#5f5344]">
            We know lasting change is hard. That&apos;s why KIAN Privé pairs natural solutions with cutting-edge technology and ongoing education
            guiding clients through every step of their transformation, not just the first one.
          </p>
          <p className="text-[#5f5344]">
            Our mission is to empower people to feel energized, revitalized, and balanced and to give them the tools to stay that way. True
            wellness begins with a sustainable foundation. KIAN Privé helps individuals achieve their weight, health, and wellness goals in
            ways that support both immediate results and lasting transformation because we know those goals are inseparable.
          </p>
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>LIFESTYLE</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">The KIAN Privé Lifestyle</h2>
        <p className="mt-3 max-w-4xl text-[#6f6251]">
          The Privé Lifestyle goes far beyond diet and exercise. It&apos;s about understanding how your body responds to food, embracing mindful
          habits, and building routines that endure. Every program is personalized to the individual whether they&apos;re using weight-loss
          therapies, maintaining an active lifestyle, or seeking natural alternatives to traditional approaches.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            "Personalized programs",
            "Clinical + holistic care",
            "Natural solutions",
            "Ongoing support",
            "Education-first",
            "Corporate concierge",
          ].map((item) => (
            <article key={item} className={`${editorialPanel} p-5 text-[#4f4335]`}>
              {item}
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection id="consultation">
        <div className={`${editorialPanel} border-[#b78d4b4f] bg-gradient-to-b from-[#fff8ed] to-[#f1e7d7] p-8`}>
          <EditorialEyebrow>GET STARTED</EditorialEyebrow>
          <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Schedule a Complimentary Consultation</h2>
          <p className="mt-3 max-w-3xl text-[#5f5344]">
            Contact us today for a complimentary consultation, where we will work together to design a personalized beauty wellness treatment
            tailored to your unique needs. Our expert team is here to help you achieve your desired results and enhance your well-being.
            Don&apos;t hesitate to reach out and start your journey towards a more radiant you.
          </p>
          <form onSubmit={submitConsultation} className="mt-6 grid gap-4 md:grid-cols-3">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className={editorialInput}
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className={editorialInput}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className={editorialInput}
            />
            <button type="submit" className={`${editorialCtaPrimary} md:col-span-3`}>
              SUBMIT CONSULTATION REQUEST
            </button>
            {submitted ? (
              <p className="text-sm text-[#8f6f3e] md:col-span-3">Thank you. Your complimentary consultation request has been received.</p>
            ) : null}
          </form>
        </div>
      </EditorialSection>
    </div>
  );
}