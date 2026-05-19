"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, LogIn, ShieldCheck, Sparkles, Star, Truck, UserCheck, UserCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { bookingServiceOptions, getBookingOptionById } from "@/lib/services/booking-options";
import { DEFAULT_TIMEZONE } from "@/lib/scheduling/config";

type BookingStep = 1 | 2 | 3 | 4;

type TimeSlot = {
  id: string;
  start: string;
  end: string;
  label: string;
};

type DateSlotGroup = {
  key: string;
  label: string;
  slots: TimeSlot[];
};

function getDateKeyInTimezone(isoDate: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(isoDate));

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
}

function formatDateLabel(isoDate: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}

function formatTimeLabel(isoDate: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function BookOnlineContent() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service");
  const { data: session, status: sessionStatus } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const [memberPricingActive, setMemberPricingActive] = useState(false);

  const [step, setStep] = useState<BookingStep>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("In-Clinic");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedSlotLabel, setConfirmedSlotLabel] = useState("");

  const selectedServiceTitles = useMemo(
    () =>
      bookingServiceOptions
        .filter((s) => selectedServices.includes(s.id))
        .map((s) => s.title),
    [selectedServices],
  );
  const selectedServiceRows = useMemo(
    () => bookingServiceOptions.filter((service) => selectedServices.includes(service.id)),
    [selectedServices],
  );
  const bookingDurationMinutes = useMemo(() => {
    if (!selectedServices.length) return 30;
    return Math.max(
      ...selectedServices.map((id) => getBookingOptionById(id)?.durationMinutes ?? 30),
    );
  }, [selectedServices]);
  const guestTotal = useMemo(
    () => selectedServiceRows.reduce((sum, service) => sum + service.guestPrice, 0),
    [selectedServiceRows],
  );
  const memberTotal = useMemo(
    () => selectedServiceRows.reduce((sum, service) => sum + service.memberPrice, 0),
    [selectedServiceRows],
  );
  const savings = guestTotal - memberTotal;
  const dateSlotGroups = useMemo<DateSlotGroup[]>(() => {
    const groups = new Map<string, DateSlotGroup>();

    for (const slot of availableSlots) {
      const dateKey = getDateKeyInTimezone(slot.start, DEFAULT_TIMEZONE);
      const existing = groups.get(dateKey);

      if (existing) {
        existing.slots.push(slot);
      } else {
        groups.set(dateKey, {
          key: dateKey,
          label: formatDateLabel(slot.start, DEFAULT_TIMEZONE),
          slots: [slot],
        });
      }
    }

    return Array.from(groups.values());
  }, [availableSlots]);

  const selectedDateSlots = useMemo(() => {
    if (!selectedDateKey) return [];
    return dateSlotGroups.find((group) => group.key === selectedDateKey)?.slots ?? [];
  }, [dateSlotGroups, selectedDateKey]);

  useEffect(() => {
    if (!preselectedService) return;
    if (getBookingOptionById(preselectedService)) {
      setSelectedServices([preselectedService]);
    }
  }, [preselectedService]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const name = session?.user?.name ?? "";
    const emailAddr = session?.user?.email ?? "";
    if (name) setFullName(name);
    if (emailAddr) setEmail(emailAddr);
  }, [isLoggedIn, session?.user?.name, session?.user?.email]);

  useEffect(() => {
    if (!isLoggedIn) {
      setMemberPricingActive(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;
        const payload = (await res.json()) as {
          profile?: { phone?: string };
          subscription?: { status: string; currentPeriodEnd: string | null } | null;
        };
        if (cancelled) return;
        if (payload.profile?.phone) setPhone(payload.profile.phone);
        const sub = payload.subscription;
        const active =
          sub?.status === "ACTIVE" &&
          sub.currentPeriodEnd &&
          new Date(sub.currentPeriodEnd).getTime() > Date.now();
        setMemberPricingActive(Boolean(active));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (step !== 2 || selectedServices.length === 0) return;
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError("");
    void (async () => {
      try {
        const params = new URLSearchParams({
          serviceId: selectedServices[0],
          timezone: DEFAULT_TIMEZONE,
          durationMinutes: String(bookingDurationMinutes),
        });
        const res = await fetch(`/api/scheduling/slots?${params.toString()}`);
        const payload = (await res.json()) as { slots?: TimeSlot[]; error?: string };
        if (!res.ok) throw new Error(payload.error ?? "Could not load time slots.");
        if (cancelled) return;
        setAvailableSlots(payload.slots ?? []);
        if (selectedSlotId && !payload.slots?.some((slot) => slot.id === selectedSlotId)) {
          setSelectedSlotId("");
        }
      } catch (error) {
        if (!cancelled) {
          setSlotsError(error instanceof Error ? error.message : "Could not load time slots.");
          setAvailableSlots([]);
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, selectedServices, bookingDurationMinutes, selectedSlotId]);

  useEffect(() => {
    if (!dateSlotGroups.length) {
      setSelectedDateKey("");
      return;
    }

    const hasSelectedDate = dateSlotGroups.some((group) => group.key === selectedDateKey);
    if (!hasSelectedDate) {
      setSelectedDateKey(dateSlotGroups[0].key);
    }
  }, [dateSlotGroups, selectedDateKey]);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((serviceId) => serviceId !== id) : [...prev, id],
    );
  }

  async function completeBooking() {
    if (submitting) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          preferredLocation,
          notes: notes || undefined,
          serviceIds: selectedServices,
          scheduledSlotId: selectedSlotId,
          timezone: DEFAULT_TIMEZONE,
          memberPricingActive,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Could not submit booking.");
      }
      setConfirmedSlotLabel(availableSlots.find((slot) => slot.id === selectedSlotId)?.label ?? "");
      setStep(4);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not submit booking.");
    } finally {
      setSubmitting(false);
    }
  }

  function nextStep() {
    if (step === 1 && selectedServices.length === 0) return;
    if (step === 2 && !selectedSlotId) return;
    if (step === 3 && (!fullName || !email || !phone)) return;
    if (step === 3) {
      void completeBooking();
      return;
    }
    setStep((prev) => (prev < 4 ? ((prev + 1) as BookingStep) : prev));
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
            <h1 className="mt-4 text-3xl text-[#1f1a15] sm:text-4xl md:text-5xl">Book Your Appointment</h1>
            <p className="mt-5 max-w-2xl text-[#6f6251]">
              Choose your services, pick an available time instantly, and confirm in minutes. All times shown in Eastern Time (ET).
            </p>
            {sessionStatus === "loading" ? (
              <div className="mt-5 rounded-2xl border border-[#b78d4b33] bg-[#fffaf2] px-4 py-3 text-sm text-[#6f6251]">
                Checking your session…
              </div>
            ) : isLoggedIn ? (
              <div className="mt-5 rounded-2xl border border-[#2e7d3245] bg-[#f1faf1] p-4">
                <p className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#2e7d32]">
                  <UserCircle2 size={16} />
                  SIGNED IN
                </p>
                <p className="mt-2 text-sm text-[#2b2218]">
                  You are booking as <span className="font-medium">{session?.user?.name ?? "Member"}</span>
                  {session?.user?.email ? (
                    <>
                      {" "}
                      (<span className="text-[#5f5344]">{session.user.email}</span>)
                    </>
                  ) : null}
                  . This request will be saved to your account.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/dashboard"
                    className="rounded-full border border-[#2e7d3240] bg-white px-4 py-2 text-xs font-medium text-[#1b5e20]"
                  >
                    Member dashboard
                  </Link>
                  <Link
                    href="/dashboard/services"
                    className="rounded-full border border-[#2e7d3240] bg-white px-4 py-2 text-xs font-medium text-[#1b5e20]"
                  >
                    My booked services
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#b78d4b] bg-[#fff7eb] p-4 ring-2 ring-[#b78d4b33]">
                  <p className="text-xs font-medium tracking-[0.14em] text-[#8f6f3e]">CONTINUE AS GUEST</p>
                  <p className="mt-2 text-sm text-[#5f5344]">Book without an account. We will follow up by email and phone.</p>
                </div>
                <div className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
                  <p className="text-xs font-medium tracking-[0.14em] text-[#8f6f3e]">MEMBER OR JOIN REQUEST</p>
                  <p className="mt-2 text-sm text-[#5f5344]">Existing members can sign in. New members complete consultation + onboarding to get approved.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/login?callbackUrl=/book-online"
                      className="inline-flex items-center gap-1 rounded-full bg-[#b78d4b] px-4 py-2 text-xs text-white"
                    >
                      <LogIn size={14} />
                      Log in
                    </Link>
                    <Link href="/signup" className="rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-4 py-2 text-xs text-[#3b3024]">
                      Join onboarding
                    </Link>
                    <Link href="/pricing" className="rounded-full border border-[#b78d4b50] px-4 py-2 text-xs text-[#3b3024]">
                      Membership
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {!isLoggedIn ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#b78d4b45] bg-[#fff7eb] px-4 py-2 text-xs text-[#8f6f3e]">
                <Sparkles size={14} />
                Guest booking — you can join anytime for member rates
              </div>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs ${step === 1 ? "border-[#b78d4b] bg-[#fff3df] text-[#8f6f3e]" : "border-[#b78d4b3e] text-[#7b6d5a]"}`}>1. Services</span>
              <span className={`rounded-full border px-3 py-1 text-xs ${step === 2 ? "border-[#b78d4b] bg-[#fff3df] text-[#8f6f3e]" : "border-[#b78d4b3e] text-[#7b6d5a]"}`}>2. Schedule</span>
              <span className={`rounded-full border px-3 py-1 text-xs ${step === 3 ? "border-[#b78d4b] bg-[#fff3df] text-[#8f6f3e]" : "border-[#b78d4b3e] text-[#7b6d5a]"}`}>3. Details</span>
              <span className={`rounded-full border px-3 py-1 text-xs ${step === 4 ? "border-[#b78d4b] bg-[#fff3df] text-[#8f6f3e]" : "border-[#b78d4b3e] text-[#7b6d5a]"}`}>4. Confirmed</span>
            </div>
          </div>
          <div className="relative h-[260px] overflow-hidden rounded-3xl border border-[#b78d4b36] sm:h-[320px] md:h-[360px]">
            <Image src="/images/wellness.avif" alt="Client booking and concierge wellness" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        {isLoggedIn ? (
          <div className="mb-6 rounded-3xl border border-[#b78d4b2d] bg-white p-5 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">MEMBER BOOKING ESTIMATE</p>
                <h3 className="mt-1 text-xl text-[#1f1a15] sm:text-2xl">Your current selection</h3>
              </div>
              <div className="rounded-2xl border border-[#b78d4b38] bg-[#fffaf2] px-4 py-2 text-sm text-[#5f5344]">
                Member total: <span className="text-[#3b3024]">${memberTotal || 0}</span>
                <span className="ml-2 text-[#8f6f3e]">Save ${savings > 0 ? savings : 0}</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-[#6f6251]">
              {memberPricingActive
                ? "Active membership pricing is applied."
                : "Member estimate shown; activate membership in your dashboard for best rates."}
            </p>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-services"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="mb-4 text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Choose Services</h2>
              <p className="mb-6 text-[#6f6251]">Select one or more services for this appointment.</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {bookingServiceOptions.map((service) => {
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
                        {isLoggedIn ? (
                          <div className="mt-3 text-sm text-[#2b2218]">
                            <span className="text-[#8f6f3e]">Member estimate:</span> ${service.memberPrice}
                          </div>
                        ) : (
                          <div className="mt-3 text-xs text-[#8f6f3e]">
                            Pricing is shared during consultation and membership onboarding.
                          </div>
                        )}
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
              key="step-schedule"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-[#b78d4b2d] bg-white p-6 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)]"
            >
              <h2 className="text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Choose Date &amp; Time</h2>
              <p className="mt-2 text-[#6f6251]">
                First choose your date, then pick your preferred time. Appointments are offered weekdays, 8:00 AM–8:00 PM Eastern ({bookingDurationMinutes} min session).
              </p>
              {slotsLoading ? (
                <p className="mt-6 text-sm text-[#6f6251]">Loading available times…</p>
              ) : slotsError ? (
                <p className="mt-6 text-sm text-red-600">{slotsError}</p>
              ) : availableSlots.length === 0 ? (
                <p className="mt-6 text-sm text-[#6f6251]">No slots available in the next few weeks. Please contact concierge for priority scheduling.</p>
              ) : (
                <>
                  <div className="mt-6">
                    <p className="mb-3 text-xs tracking-[0.14em] text-[#8f6f3e]">SELECT DATE</p>
                    <div className="flex flex-wrap gap-2">
                      {dateSlotGroups.map((group) => {
                        const active = selectedDateKey === group.key;
                        return (
                          <button
                            key={group.key}
                            type="button"
                            onClick={() => {
                              setSelectedDateKey(group.key);
                              setSelectedSlotId("");
                            }}
                            className={`rounded-full border px-4 py-2 text-sm transition ${
                              active
                                ? "border-[#b78d4b] bg-[#fff5e6] text-[#3b3024]"
                                : "border-[#b78d4b2d] bg-white text-[#5f5344] hover:border-[#b78d4b80]"
                            }`}
                          >
                            {group.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="mb-3 text-xs tracking-[0.14em] text-[#8f6f3e]">SELECT TIME</p>
                    {selectedDateSlots.length ? (
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {selectedDateSlots.map((slot) => {
                          const active = selectedSlotId === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                                active
                                  ? "border-[#b78d4b] bg-[#fff5e6] text-[#3b3024]"
                                  : "border-[#b78d4b2d] bg-white text-[#5f5344] hover:border-[#b78d4b80]"
                              }`}
                            >
                              {formatTimeLabel(slot.start, DEFAULT_TIMEZONE)}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-[#6f6251]">Select a date to view available times.</p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          ) : null}

          {step === 3 ? (
            <motion.div
              key="step-information"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-[#b78d4b2d] bg-white p-6 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)]"
            >
              <h2 className="text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Your Details</h2>
              <p className="mt-2 text-[#6f6251]">Confirm your details and visit location.</p>
              {isLoggedIn ? (
                <p className="mt-2 rounded-xl border border-[#2e7d322e] bg-[#f7fcf7] px-3 py-2 text-xs text-[#2e7d32]">
                  Signed in — details below are pre-filled from your account. You can still edit before submitting.
                </p>
              ) : null}
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
              {submitError ? <p className="mt-4 text-sm text-red-600">{submitError}</p> : null}
            </motion.div>
          ) : null}

          {step === 4 ? (
            <motion.div
              key="step-complete"
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
              <h2 className="mt-4 text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Appointment Confirmed</h2>
              <p className="mx-auto mt-3 max-w-2xl text-[#5f5344]">
                Thank you, {fullName || "Member"}. Your appointment is confirmed. A confirmation email will follow shortly.
              </p>
              <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[#b78d4b38] bg-white/75 p-4 text-left">
                <p className="text-sm text-[#4f4335]">
                  <span className="text-[#8f6f3e]">Services:</span>{" "}
                  {selectedServiceTitles.length ? selectedServiceTitles.join(", ") : "None selected"}
                </p>
                <p className="mt-1 text-sm text-[#4f4335]">
                  <span className="text-[#8f6f3e]">Scheduled:</span> {confirmedSlotLabel || "Confirmed"}
                </p>
                <p className="mt-1 text-sm text-[#4f4335]">
                  <span className="text-[#8f6f3e]">Location:</span> {preferredLocation}
                </p>
                {isLoggedIn ? (
                  <p className="mt-2 text-sm text-[#4f4335]">
                    <span className="text-[#8f6f3e]">Member Estimate:</span> ${memberTotal || 0}
                  </p>
                ) : null}
              </div>
              <div className="mx-auto mt-5 grid max-w-2xl gap-2 rounded-2xl border border-[#b78d4b33] bg-white/80 p-4 text-left text-sm text-[#5f5344] sm:grid-cols-2">
                <p className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-[#8f6f3e]" /> HIPAA-aware privacy</p>
                <p className="inline-flex items-center gap-2"><Truck size={14} className="text-[#8f6f3e]" /> Concierge scheduling support</p>
                <p className="inline-flex items-center gap-2"><UserCheck size={14} className="text-[#8f6f3e]" /> Clinically guided protocols</p>
                <p className="inline-flex items-center gap-2"><Star size={14} className="text-[#8f6f3e]" /> Priority member perks available</p>
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {isLoggedIn ? (
                  <>
                    <Link href="/dashboard/services" className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
                      View my bookings
                    </Link>
                    <Link href="/dashboard" className="rounded-full border border-[#b78d4b70] bg-white px-5 py-2 text-sm text-[#3b3024]">
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signup" className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
                      Join onboarding for membership
                    </Link>
                    <Link href="/pricing" className="rounded-full border border-[#b78d4b70] bg-white px-5 py-2 text-sm text-[#3b3024]">
                      Compare Membership Plans
                    </Link>
                  </>
                )}
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
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={
                submitting ||
                (step === 1 && selectedServices.length === 0) ||
                (step === 2 && !selectedSlotId) ||
                (step === 3 && (!fullName || !email || !phone))
              }
              className="rounded-full bg-[#b78d4b] px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {step === 3 ? (submitting ? "Confirming..." : "Confirm Appointment") : "Next Step"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSelectedServices([]);
                setSelectedSlotId("");
                setAvailableSlots([]);
                setFullName("");
                setEmail("");
                setPhone("");
                setPreferredLocation("In-Clinic");
                setNotes("");
                setConfirmedSlotLabel("");
              }}
              className="rounded-full border border-[#b78d4b80] bg-white px-6 py-3 text-[#3b3024]"
            >
              Start New Booking
            </button>
          )}
        </div>
        <div className="mt-6 rounded-2xl border border-[#b78d4b2d] bg-white p-5 text-center">
          {isLoggedIn ? (
            <>
              <p className="text-sm font-medium text-[#2b2218]">You are signed in</p>
              <p className="mt-1 text-sm text-[#6f6251]">Your session is active across the site. Continue booking or go to your dashboard.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex rounded-full bg-[#b78d4b] px-6 py-3 text-sm text-white transition hover:opacity-95"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut({ callbackUrl: "/login?callbackUrl=/book-online" })}
                  className="inline-flex rounded-full border border-[#b78d4b80] bg-white px-6 py-3 text-sm text-[#3b3024] transition hover:bg-[#fff7eb]"
                >
                  Switch account
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[#5f5344]">Already a member?</p>
              <p className="mt-1 text-sm text-[#6f6251]">
                Log in to apply member pricing and save this booking to your account.
              </p>
              <Link
                href="/login?callbackUrl=/book-online"
                className="mt-4 inline-flex rounded-full border border-[#b78d4b80] bg-white px-6 py-3 text-sm text-[#3b3024] transition hover:bg-[#fff7eb]"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </SectionWrapper>
    </div>
  );
}

export default function BookOnlinePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-[#6f6251]">Loading booking...</div>}>
      <BookOnlineContent />
    </Suspense>
  );
}
