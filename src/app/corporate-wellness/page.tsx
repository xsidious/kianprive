"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Image from "next/image";
import { useState } from "react";

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
    <div>
      <SectionWrapper className="pt-18">
        <div className="grid items-center gap-10 rounded-3xl border border-[#b78d4b2e] bg-white p-8 shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)] lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">CORPORATE WELLNESS</p>
            <h1 className="mt-4 text-4xl text-[#1f1a15] md:text-5xl">Corporate Wellness & Concierge Medicine</h1>
            <p className="mt-5 max-w-3xl text-[#6f6251]">
              KIAN Privé — where modern medicine meets holistic living. Founded by a physician and a wellness coach united by a common
              vision: to bring natural technology and modern medicine together for a truly comprehensive approach to health for individuals,
              and for the organizations they power.
            </p>
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-3xl border border-[#b78d4b36]">
            <Image src="/images/stock/hero-luxury-clinic.jpg" alt="Corporate wellness concierge medicine" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-3 text-3xl text-[#1f1a15] md:text-4xl">Our Team</h2>
        <p className="max-w-4xl text-[#6f6251]">
          KIAN Privé brings together a multidisciplinary team of professionals working in concert to deliver care that is both clinically
          rigorous and deeply personal.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {["Physicians", "Nurses & PAs", "Nutritionists", "Wellness coaches", "Medication therapists", "Yoga instructors"].map((role) => (
            <article key={role} className="rounded-2xl border border-[#b78d4b2e] bg-white p-4 text-center text-[#4f4335] shadow-[0_12px_30px_-28px_rgba(66,45,14,0.45)]">
              {role}
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-4 text-3xl text-[#1f1a15] md:text-4xl">Corporate wellness programs</h2>
        <p className="max-w-4xl text-[#6f6251]">
          Integrating a KIAN Privé wellness program into your organization creates measurable value for your people and your bottom line.
          Healthier employees are more focused, more resilient, and more engaged, translating directly into a more vibrant and productive
          workplace.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "For employees", detail: "Better health & energy" },
            { title: "For teams", detail: "Higher productivity" },
            { title: "For organizations", detail: "Meaningful cost savings" },
            { title: "For culture", detail: "A thriving workplace" },
          ].map((card) => (
            <article key={card.title} className="rounded-2xl border border-[#b78d4b2e] bg-white p-5 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
              <h2 className="text-xl text-[#2b2218]">{card.title}</h2>
              <p className="mt-2 text-[#6f6251]">{card.detail}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-3 text-3xl text-[#1f1a15] md:text-4xl">The KIAN Privé approach</h2>
        <div className="grid gap-6 rounded-3xl border border-[#b78d4b2d] bg-white p-8 shadow-[0_16px_40px_-34px_rgba(66,45,14,0.45)] md:grid-cols-2">
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
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-3 text-3xl text-[#1f1a15] md:text-4xl">The KIAN Privé Lifestyle</h2>
        <p className="max-w-4xl text-[#6f6251]">
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
            <article key={item} className="rounded-2xl border border-[#b78d4b2d] bg-[#fffaf2] p-5 text-[#4f4335]">
              {item}
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="rounded-3xl border border-[#b78d4b4f] bg-gradient-to-b from-[#fff8ed] to-[#f1e7d7] p-8 shadow-[0_18px_40px_-30px_rgba(66,45,14,0.45)]">
          <h2 className="text-3xl text-[#1f1a15] md:text-4xl">Schedule a Complimentary Consultation</h2>
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
              className="rounded-xl border border-[#b78d4b35] bg-white p-3"
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="rounded-xl border border-[#b78d4b35] bg-white p-3"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="rounded-xl border border-[#b78d4b35] bg-white p-3"
            />
            <button type="submit" className="rounded-full bg-[#b78d4b] px-6 py-3 text-white md:col-span-3">
              Submit Consultation Request
            </button>
            {submitted ? (
              <p className="text-sm text-[#8f6f3e] md:col-span-3">Thank you. Your complimentary consultation request has been received.</p>
            ) : null}
          </form>
        </div>
      </SectionWrapper>
    </div>
  );
}
