"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, Phone } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
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

const STEP_LABELS = ["Pick a service", "Pick a time", "Your info", "All set!"] as const;

const LOCATION_OPTIONS = [
  { value: "In-Clinic", label: "At the clinic" },
  { value: "In-Home", label: "At my home" },
  { value: "Virtual Consultation", label: "Video call" },
] as const;

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
    weekday: "long",
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

function ProgressBar({ step }: { step: BookingStep }) {
  const current = step === 4 ? 3 : step;
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold ${
                n < current
                  ? "bg-[#b78d4b] text-white"
                  : n === current
                    ? "bg-[#b78d4b] text-white ring-4 ring-[#b78d4b33]"
                    : "bg-[#f4efe6] text-[#8f6f3e]"
              }`}
            >
              {n < current ? "✓" : n}
            </div>
            <p
              className={`hidden text-center text-xs sm:block ${
                n === current ? "font-medium text-[#3b3024]" : "text-[#7b6d5a]"
              }`}
            >
              {STEP_LABELS[n - 1]}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-medium text-[#3b3024] sm:hidden">
        Step {current} of 3 — {STEP_LABELS[current - 1]}
      </p>
    </div>
  );
}

function BookOnlineContent() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service");
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);

  const [step, setStep] = useState<BookingStep>(1);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("In-Clinic");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedSummary, setConfirmedSummary] = useState("");

  const selectedService = useMemo(
    () => (selectedServiceId ? getBookingOptionById(selectedServiceId) : null),
    [selectedServiceId],
  );

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
    if (!preselectedService || !getBookingOptionById(preselectedService)) return;
    setSelectedServiceId(preselectedService);
    setStep(2);
  }, [preselectedService]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (session?.user?.name) setFullName(session.user.name);
    if (session?.user?.email) setEmail(session.user.email);
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok || cancelled) return;
        const payload = (await res.json()) as { profile?: { phone?: string } };
        if (payload.profile?.phone) setPhone(payload.profile.phone);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, session?.user?.name, session?.user?.email]);

  useEffect(() => {
    if (step !== 2 || !selectedServiceId) return;
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError("");
    void (async () => {
      try {
        const option = getBookingOptionById(selectedServiceId);
        const params = new URLSearchParams({
          serviceId: selectedServiceId,
          timezone: DEFAULT_TIMEZONE,
          durationMinutes: String(option?.durationMinutes ?? 30),
        });
        const res = await fetch(`/api/scheduling/slots?${params.toString()}`);
        const raw = await res.text();
        let payload: { slots?: TimeSlot[]; error?: string } = {};
        if (raw) {
          try {
            payload = JSON.parse(raw) as { slots?: TimeSlot[]; error?: string };
          } catch {
            throw new Error("Please refresh the page and try again.");
          }
        } else if (!res.ok) {
          throw new Error("Could not load times. Please try again.");
        }
        if (!res.ok) throw new Error(payload.error ?? "Could not load times.");
        if (cancelled) return;
        setAvailableSlots(payload.slots ?? []);
        setSelectedSlotId("");
      } catch (error) {
        if (!cancelled) {
          setSlotsError(error instanceof Error ? error.message : "Could not load times.");
          setAvailableSlots([]);
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, selectedServiceId]);

  useEffect(() => {
    if (!dateSlotGroups.length) {
      setSelectedDateKey("");
      return;
    }
    if (!dateSlotGroups.some((group) => group.key === selectedDateKey)) {
      setSelectedDateKey(dateSlotGroups[0].key);
    }
  }, [dateSlotGroups, selectedDateKey]);

  function selectService(id: string) {
    setSelectedServiceId(id);
    setStep(2);
  }

  async function completeBooking() {
    if (submitting || !selectedServiceId || !selectedSlotId) return;
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
          serviceIds: [selectedServiceId],
          scheduledSlotId: selectedSlotId,
          timezone: DEFAULT_TIMEZONE,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Could not book. Please call us and we will help you.");
      }
      const slot = availableSlots.find((s) => s.id === selectedSlotId);
      const when = slot
        ? `${formatDateLabel(slot.start, DEFAULT_TIMEZONE)} at ${formatTimeLabel(slot.start, DEFAULT_TIMEZONE)}`
        : "your selected time";
      setConfirmedSummary(
        `${selectedService?.title ?? "Appointment"} — ${when} (${preferredLocation})`,
      );
      setStep(4);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not book. Please call us.");
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (step === 2 && selectedSlotId) setStep(3);
    if (step === 3) void completeBooking();
  }

  function goBack() {
    if (step === 4) return;
    if (step === 2 && preselectedService) {
      setStep(1);
      return;
    }
    setStep((prev) => (prev > 1 ? ((prev - 1) as BookingStep) : prev));
  }

  const canContinue =
    (step === 2 && Boolean(selectedSlotId)) ||
    (step === 3 && Boolean(fullName.trim() && email.trim() && phone.trim()));

  return (
    <div className="pb-28">
      <SectionWrapper className="pt-10 sm:pt-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl text-[#1f1a15] sm:text-4xl">Book an Appointment</h1>
          <p className="mt-3 text-lg text-[#6f6251]">Tap your choices below. It only takes a minute.</p>
          {step < 4 ? <ProgressBar step={step} /> : null}
        </div>
      </SectionWrapper>

      <SectionWrapper className="pt-6">
        <div className="mx-auto max-w-2xl">
          {step === 1 ? (
            <div>
              <h2 className="text-xl font-medium text-[#1f1a15] sm:text-2xl">What would you like to book?</h2>
              <p className="mt-1 text-[#6f6251]">Tap one option.</p>
              <ul className="mt-5 space-y-3">
                {bookingServiceOptions.map((service) => {
                  const selected = selectedServiceId === service.id;
                  return (
                    <li key={service.id}>
                      <button
                        type="button"
                        onClick={() => selectService(service.id)}
                        className={`w-full rounded-2xl border-2 px-5 py-5 text-left text-lg transition ${
                          selected
                            ? "border-[#b78d4b] bg-[#fff5e6] text-[#1f1a15]"
                            : "border-[#e8dcc8] bg-white text-[#2b2218] hover:border-[#b78d4b]"
                        }`}
                      >
                        <span className="font-medium">{service.title}</span>
                        {selected ? (
                          <span className="mt-1 block text-sm text-[#8f6f3e]">Selected — tap Continue below</span>
                        ) : (
                          <span className="mt-1 block text-sm text-[#8f6f3e]">Tap to choose</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="rounded-3xl border border-[#e8dcc8] bg-white p-5 sm:p-6">
              <h2 className="text-xl font-medium text-[#1f1a15] sm:text-2xl">When works for you?</h2>
              {selectedService ? (
                <p className="mt-1 text-[#6f6251]">
                  Booking: <span className="font-medium text-[#3b3024]">{selectedService.title}</span>
                </p>
              ) : null}
              <p className="mt-2 text-sm text-[#8f6f3e]">All times are Eastern (Miami).</p>

              {slotsLoading ? (
                <p className="mt-8 text-center text-lg text-[#6f6251]">Loading open times…</p>
              ) : slotsError ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
                  <p className="text-red-700">{slotsError}</p>
                  <a
                    href="tel:3059182570"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#b78d4b] px-5 py-2 text-white"
                  >
                    <Phone size={18} />
                    Call 305-918-2570
                  </a>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-[#e8dcc8] bg-[#fffaf2] p-4 text-center">
                  <p className="text-[#5f5344]">No open times online right now.</p>
                  <a
                    href="tel:3059182570"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#b78d4b] px-5 py-3 text-lg text-white"
                  >
                    <Phone size={20} />
                    Call us to schedule
                  </a>
                </div>
              ) : (
                <>
                  <p className="mt-6 mb-3 text-base font-medium text-[#3b3024]">1. Pick a day</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
                          className={`min-h-[52px] flex-1 rounded-2xl border-2 px-4 py-3 text-base sm:min-w-[140px] sm:flex-none ${
                            active
                              ? "border-[#b78d4b] bg-[#fff5e6] font-medium text-[#1f1a15]"
                              : "border-[#e8dcc8] bg-white text-[#3b3024]"
                          }`}
                        >
                          {group.label}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-8 mb-3 text-base font-medium text-[#3b3024]">2. Pick a time</p>
                  {selectedDateSlots.length ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {selectedDateSlots.map((slot) => {
                        const active = selectedSlotId === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`min-h-[52px] rounded-2xl border-2 px-3 py-3 text-base ${
                              active
                                ? "border-[#b78d4b] bg-[#fff5e6] font-semibold text-[#1f1a15]"
                                : "border-[#e8dcc8] bg-white text-[#3b3024]"
                            }`}
                          >
                            {formatTimeLabel(slot.start, DEFAULT_TIMEZONE)}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[#6f6251]">Pick a day first.</p>
                  )}
                </>
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="rounded-3xl border border-[#e8dcc8] bg-white p-5 sm:p-6">
              <h2 className="text-xl font-medium text-[#1f1a15] sm:text-2xl">Almost done</h2>
              <p className="mt-1 text-[#6f6251]">Enter your name and how we can reach you.</p>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-base font-medium text-[#3b3024]">Your full name</span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="w-full rounded-2xl border-2 border-[#e8dcc8] bg-[#fffaf4] px-4 py-4 text-lg text-[#1f1a15] outline-none focus:border-[#b78d4b]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-base font-medium text-[#3b3024]">Mobile phone</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    autoComplete="tel"
                    className="w-full rounded-2xl border-2 border-[#e8dcc8] bg-[#fffaf4] px-4 py-4 text-lg text-[#1f1a15] outline-none focus:border-[#b78d4b]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-base font-medium text-[#3b3024]">Email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-2xl border-2 border-[#e8dcc8] bg-[#fffaf4] px-4 py-4 text-lg text-[#1f1a15] outline-none focus:border-[#b78d4b]"
                  />
                </label>
              </div>

              <p className="mt-8 mb-3 text-base font-medium text-[#3b3024]">Where will your visit be?</p>
              <div className="space-y-2">
                {LOCATION_OPTIONS.map((opt) => {
                  const active = preferredLocation === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPreferredLocation(opt.value)}
                      className={`w-full min-h-[52px] rounded-2xl border-2 px-4 py-3 text-left text-lg ${
                        active
                          ? "border-[#b78d4b] bg-[#fff5e6] font-medium"
                          : "border-[#e8dcc8] bg-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {submitError ? (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-center text-red-700">{submitError}</p>
              ) : null}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="rounded-3xl border-2 border-[#b78d4b] bg-gradient-to-b from-[#fff8ed] to-[#f4efe6] p-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white">
                <CheckCircle2 className="text-[#8f6f3e]" size={48} />
              </div>
              <h2 className="mt-5 text-2xl font-medium text-[#1f1a15] sm:text-3xl">You&apos;re booked!</h2>
              <p className="mx-auto mt-3 max-w-md text-lg text-[#5f5344]">
                Thank you, {fullName.split(" ")[0] || "friend"}. We sent a confirmation to your email.
              </p>
              <p className="mx-auto mt-4 rounded-2xl bg-white/80 px-4 py-4 text-base text-[#3b3024]">
                {confirmedSummary}
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm text-[#6f6251]">
                Questions? Call{" "}
                <a href="tel:3059182570" className="font-medium text-[#8f6f3e] underline">
                  305-918-2570
                </a>
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/"
                  className="min-h-[52px] rounded-2xl bg-[#b78d4b] px-6 py-3 text-lg font-medium text-white"
                >
                  Back to home
                </Link>
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="min-h-[52px] rounded-2xl border-2 border-[#b78d4b] bg-white px-6 py-3 text-lg text-[#3b3024]"
                  >
                    My account
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          <p className="mt-8 text-center text-sm text-[#8f6f3e]">
            Prefer to talk to someone?{" "}
            <a href="tel:3059182570" className="font-medium underline">
              Call 305-918-2570
            </a>
            {" · "}
            <Link href="/contact" className="font-medium underline">
              Contact us
            </Link>
            {!isLoggedIn ? (
              <>
                {" · "}
                <Link href="/login?callbackUrl=/book-online" className="font-medium underline">
                  Member login
                </Link>
              </>
            ) : null}
          </p>
        </div>
      </SectionWrapper>

      {step < 4 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e8dcc8] bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-2xl gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex min-h-[56px] flex-1 items-center justify-center gap-1 rounded-2xl border-2 border-[#e8dcc8] bg-white text-lg text-[#3b3024] sm:flex-none sm:px-8"
              >
                <ChevronLeft size={22} />
                Back
              </button>
            ) : null}
            {step === 1 ? (
              <button
                type="button"
                disabled={!selectedServiceId}
                onClick={() => setStep(2)}
                className="min-h-[56px] flex-[2] rounded-2xl bg-[#b78d4b] text-lg font-semibold text-white disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue || submitting}
                className="min-h-[56px] flex-[2] rounded-2xl bg-[#b78d4b] text-lg font-semibold text-white disabled:opacity-50"
              >
                {step === 3 ? (submitting ? "Booking…" : "Book my appointment") : "Continue"}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function BookOnlinePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center p-10 text-lg text-[#6f6251]">
          Loading…
        </div>
      }
    >
      <BookOnlineContent />
    </Suspense>
  );
}
