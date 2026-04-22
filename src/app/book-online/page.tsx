"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldCheck, Sparkles, Star, Truck, UserCheck } from "lucide-react";

type BookingStep = 1 | 2 | 3;

const serviceOptions = [
  {
    id: "wellness-consultation",
    title: "Initial Wellness Consultation",
    description: "Comprehensive clinical and lifestyle review with a customized protocol strategy.",
    image: "/images/wellness.avif",
    guestPrice: 245,
    memberPrice: 195,
  },
  {
    id: "icoone-session",
    title: "Icoone Body & Lymphatic Session",
    description: "Non-invasive contouring and lymphatic optimization for beauty and recovery outcomes.",
    image: "/images/icoone.avif",
    guestPrice: 220,
    memberPrice: 176,
  },
  {
    id: "medical-aesthetics",
    title: "Medical Aesthetic Visit",
    description: "Physician-guided aesthetic and skin rejuvenation services tailored to your goals.",
    image: "/images/medicalaesthetics.avif",
    guestPrice: 310,
    memberPrice: 248,
  },
  {
    id: "nutrition-checkin",
    title: "Nutrition & Metabolic Check-In",
    description: "Personalized nutrition strategy and body-composition support for measurable progress.",
    image: "/images/nutrition.avif",
    guestPrice: 185,
    memberPrice: 148,
  },
  {
    id: "recovery-session",
    title: "Recovery Session",
    description: "PEMF, infrared, and recovery protocol stack to support circulation and performance.",
    image: "/images/esthetics.avif",
    guestPrice: 165,
    memberPrice: 132,
  },
  {
    id: "mtm-followup",
    title: "Medication Therapy Follow-Up",
    description: "Comprehensive medication and supplement optimization with ongoing clinical oversight.",
    image: "/images/beauty.avif",
    guestPrice: 210,
    memberPrice: 168,
  },
];

export default function BookOnlinePage() {
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("In-Clinic");
  const [notes, setNotes] = useState("");

  const selectedServiceTitles = useMemo(
    () =>
      serviceOptions
        .filter((s) => selectedServices.includes(s.id))
        .map((s) => s.title),
    [selectedServices],
  );
  const selectedServiceRows = useMemo(
    () => serviceOptions.filter((service) => selectedServices.includes(service.id)),
    [selectedServices],
  );
  const guestTotal = useMemo(
    () => selectedServiceRows.reduce((sum, service) => sum + service.guestPrice, 0),
    [selectedServiceRows],
  );
  const memberTotal = useMemo(
    () => selectedServiceRows.reduce((sum, service) => sum + service.memberPrice, 0),
    [selectedServiceRows],
  );
  const savings = guestTotal - memberTotal;

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((serviceId) => serviceId !== id) : [...prev, id],
    );
  }

  function nextStep() {
    if (step === 1 && selectedServices.length === 0) return;
    if (step === 2 && (!fullName || !email || !phone || !preferredDate)) return;
    setStep((prev) => (prev < 3 ? ((prev + 1) as BookingStep) : prev));
  }

  function prevStep() {
    setStep((prev) => (prev > 1 ? ((prev - 1) as BookingStep) : prev));
  }

  return (
    <div>
      <SectionWrapper className="pt-14 sm:pt-16 md:pt-18">
        <div className="grid items-center gap-8 rounded-3xl border border-[#b78d4b2e] bg-white p-5 shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)] sm:p-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">CLIENT BOOKING</p>
            <h1 className="mt-4 text-3xl text-[#1f1a15] sm:text-4xl md:text-5xl">Book Your Private Session Online</h1>
            <p className="mt-5 max-w-2xl text-[#6f6251]">
              Schedule concierge wellness sessions, protocol reviews, and premium treatment visits with a guided multi-step experience.
              Select one or multiple services, confirm your details, and complete booking in minutes.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#b78d4b45] bg-[#fff7eb] px-4 py-2 text-xs text-[#8f6f3e]">
              <Sparkles size={14} />
              No login required to book
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs ${step === 1 ? "border-[#b78d4b] bg-[#fff3df] text-[#8f6f3e]" : "border-[#b78d4b3e] text-[#7b6d5a]"}`}>1. Services</span>
              <span className={`rounded-full border px-3 py-1 text-xs ${step === 2 ? "border-[#b78d4b] bg-[#fff3df] text-[#8f6f3e]" : "border-[#b78d4b3e] text-[#7b6d5a]"}`}>2. Information</span>
              <span className={`rounded-full border px-3 py-1 text-xs ${step === 3 ? "border-[#b78d4b] bg-[#fff3df] text-[#8f6f3e]" : "border-[#b78d4b3e] text-[#7b6d5a]"}`}>3. Complete</span>
            </div>
          </div>
          <div className="relative h-[260px] overflow-hidden rounded-3xl border border-[#b78d4b36] sm:h-[320px] md:h-[360px]">
            <Image src="/images/wellness.avif" alt="Client booking and concierge wellness" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="mb-6 rounded-3xl border border-[#b78d4b2d] bg-white p-5 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">MEMBER PRICING ADVANTAGE</p>
              <h3 className="mt-1 text-xl text-[#1f1a15] sm:text-2xl">Unlock premium pricing while you book</h3>
            </div>
            <div className="rounded-2xl border border-[#b78d4b38] bg-[#fffaf2] px-4 py-2 text-sm text-[#5f5344]">
              Guest total: <span className="text-[#3b3024]">${guestTotal || 0}</span> | Member total: <span className="text-[#3b3024]">${memberTotal || 0}</span>
              <span className="ml-2 text-[#8f6f3e]">Save ${savings > 0 ? savings : 0}</span>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <article className="rounded-2xl border border-[#b78d4b30] bg-white p-4">
              <p className="text-sm text-[#8f6f3e]">Book as Guest</p>
              <p className="mt-1 text-sm text-[#6f6251]">Reserve services instantly with no account required.</p>
            </article>
            <article className="rounded-2xl border border-[#b78d4b45] bg-[#fff7eb] p-4">
              <p className="text-sm text-[#8f6f3e]">Become a Member</p>
              <p className="mt-1 text-sm text-[#6f6251]">Get discounted session rates, priority booking, and premium concierge support.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/signup" className="rounded-full bg-[#b78d4b] px-4 py-2 text-xs text-white">
                  Create Account
                </Link>
                <Link href="/pricing" className="rounded-full border border-[#b78d4b70] bg-white px-4 py-2 text-xs text-[#3b3024]">
                  View Membership
                </Link>
              </div>
            </article>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="mb-4 text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Choose Services</h2>
              <p className="mb-6 text-[#6f6251]">Select one or multiple services for this booking request.</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {serviceOptions.map((service) => {
                  const active = selectedServices.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`overflow-hidden rounded-2xl border text-left transition ${
                        active
                          ? "border-[#b78d4b] bg-[#fff5e6] shadow-[0_16px_35px_-30px_rgba(66,45,14,0.55)]"
                          : "border-[#b78d4b2d] bg-white shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)]"
                      }`}
                    >
                      <div className="relative h-44">
                        <Image src={service.image} alt={service.title} fill className="object-cover" />
                      </div>
                      <div className="p-4">
                        <p className="text-lg text-[#2b2218]">{service.title}</p>
                        <p className="mt-2 text-sm text-[#6f6251]">{service.description}</p>
                        <div className="mt-3 flex items-center gap-3 text-sm">
                          <p className="text-[#5f5344]">
                            <span className="text-[#8f6f3e]">Guest:</span> ${service.guestPrice}
                          </p>
                          <p className="text-[#2b2218]">
                            <span className="text-[#8f6f3e]">Member:</span> ${service.memberPrice}
                          </p>
                        </div>
                        {active ? <p className="mt-3 text-xs text-[#8f6f3e]">Selected</p> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : null}

          {step === 2 ? (
            <motion.div
              key="information"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-[#b78d4b2d] bg-white p-6 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)]"
            >
              <h2 className="text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Your Information</h2>
              <p className="mt-2 text-[#6f6251]">Tell us where and when you want your session.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="rounded-xl border border-[#b78d4b3a] bg-[#fffaf4] p-3 text-[#2b2218] outline-none focus:border-[#b78d4b]"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  className="rounded-xl border border-[#b78d4b3a] bg-[#fffaf4] p-3 text-[#2b2218] outline-none focus:border-[#b78d4b]"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                  className="rounded-xl border border-[#b78d4b3a] bg-[#fffaf4] p-3 text-[#2b2218] outline-none focus:border-[#b78d4b]"
                />
                <input
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  type="date"
                  className="rounded-xl border border-[#b78d4b3a] bg-[#fffaf4] p-3 text-[#2b2218] outline-none focus:border-[#b78d4b]"
                />
                <select
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  className="rounded-xl border border-[#b78d4b3a] bg-[#fffaf4] p-3 text-[#2b2218] outline-none focus:border-[#b78d4b]"
                >
                  <option>In-Clinic</option>
                  <option>In-Home</option>
                  <option>Virtual Consultation</option>
                </select>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes"
                  className="min-h-[100px] rounded-xl border border-[#b78d4b3a] bg-[#fffaf4] p-3 text-[#2b2218] outline-none focus:border-[#b78d4b] md:col-span-2"
                />
              </div>
            </motion.div>
          ) : null}

          {step === 3 ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-[#b78d4b42] bg-gradient-to-b from-[#fff8ed] to-[#f1e7d7] p-8 text-center shadow-[0_22px_45px_-32px_rgba(66,45,14,0.45)]"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.25 }}
                className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-white"
              >
                <CheckCircle2 className="text-[#8f6f3e]" size={34} />
              </motion.div>
              <h2 className="mt-4 text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Booking Request Complete</h2>
              <p className="mx-auto mt-3 max-w-2xl text-[#5f5344]">
                Thank you, {fullName || "Member"}. Your request has been prepared and our concierge coordinator will contact you shortly.
              </p>
              <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[#b78d4b38] bg-white/75 p-4 text-left">
                <p className="text-sm text-[#4f4335]">
                  <span className="text-[#8f6f3e]">Services:</span>{" "}
                  {selectedServiceTitles.length ? selectedServiceTitles.join(", ") : "None selected"}
                </p>
                <p className="mt-1 text-sm text-[#4f4335]">
                  <span className="text-[#8f6f3e]">Preferred Date:</span> {preferredDate || "Not provided"}
                </p>
                <p className="mt-1 text-sm text-[#4f4335]">
                  <span className="text-[#8f6f3e]">Location:</span> {preferredLocation}
                </p>
                <p className="mt-2 text-sm text-[#4f4335]">
                  <span className="text-[#8f6f3e]">Guest Estimate:</span> ${guestTotal || 0} | <span className="text-[#8f6f3e]">Member Estimate:</span> ${memberTotal || 0}
                </p>
              </div>
              <div className="mx-auto mt-5 grid max-w-2xl gap-2 rounded-2xl border border-[#b78d4b33] bg-white/80 p-4 text-left text-sm text-[#5f5344] sm:grid-cols-2">
                <p className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-[#8f6f3e]" /> HIPAA-aware privacy</p>
                <p className="inline-flex items-center gap-2"><Truck size={14} className="text-[#8f6f3e]" /> Concierge scheduling support</p>
                <p className="inline-flex items-center gap-2"><UserCheck size={14} className="text-[#8f6f3e]" /> Clinically guided protocols</p>
                <p className="inline-flex items-center gap-2"><Star size={14} className="text-[#8f6f3e]" /> Priority member perks available</p>
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link href="/signup" className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
                  Create Account for Member Pricing
                </Link>
                <Link href="/pricing" className="rounded-full border border-[#b78d4b70] bg-white px-5 py-2 text-sm text-[#3b3024]">
                  Compare Membership Plans
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </SectionWrapper>

      <SectionWrapper>
        <div className="flex flex-wrap items-center gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="rounded-full border border-[#b78d4b80] bg-white px-6 py-3 text-[#3b3024]"
            >
              Back
            </button>
          ) : null}
          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={
                (step === 1 && selectedServices.length === 0) ||
                (step === 2 && (!fullName || !email || !phone || !preferredDate))
              }
              className="rounded-full bg-[#b78d4b] px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {step === 2 ? "Complete Booking" : "Next Step"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSelectedServices([]);
                setFullName("");
                setEmail("");
                setPhone("");
                setPreferredDate("");
                setPreferredLocation("In-Clinic");
                setNotes("");
              }}
              className="rounded-full border border-[#b78d4b80] bg-white px-6 py-3 text-[#3b3024]"
            >
              Start New Booking
            </button>
          )}
        </div>
      </SectionWrapper>
    </div>
  );
}
