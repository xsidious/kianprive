"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarHeart,
  Check,
  ChevronLeft,
  LogIn,
  Phone,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { bookingServiceOptions, getBookingOptionById } from "@/lib/services/booking-options";
import { DEFAULT_TIMEZONE } from "@/lib/scheduling/config";

type WizardStep = "welcome" | "count" | "services" | "schedule" | "details" | "complete";
type VisitorType = "member" | "guest" | null;
type ServiceInterest = "one" | "two" | "many" | null;

type TimeSlot = { id: string; start: string; end: string; label: string };
type DateSlotGroup = { key: string; label: string; slots: TimeSlot[] };

const STEPS: WizardStep[] = ["welcome", "count", "services", "schedule", "details"];
const STEP_TITLES: Record<WizardStep, string> = {
  welcome: "Welcome",
  count: "Your plan",
  services: "Services",
  schedule: "Date & time",
  details: "Your details",
  complete: "Confirmed",
};

const LOCATION_OPTIONS = [
  { value: "In-Clinic", label: "At the clinic", icon: "✨" },
  { value: "In-Home", label: "At my home", icon: "🏠" },
  { value: "Virtual Consultation", label: "Video call", icon: "💻" },
] as const;

const COUNT_OPTIONS = [
  {
    id: "one" as const,
    title: "One service",
    subtitle: "A focused visit for one treatment or consult",
    emoji: "1",
  },
  {
    id: "two" as const,
    title: "Two services",
    subtitle: "Pair treatments in a single trip",
    emoji: "2",
  },
  {
    id: "many" as const,
    title: "Three or more",
    subtitle: "Build a full wellness experience",
    emoji: "3+",
  },
];

function getDateKeyInTimezone(isoDate: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(isoDate));
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "00";
  const day = parts.find((p) => p.type === "day")?.value ?? "00";
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

function StepProgress({ step }: { step: WizardStep }) {
  const index = STEPS.indexOf(step);
  if (index < 0) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-1.5 sm:gap-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5 sm:gap-2">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 sm:h-3 ${
              i < index ? "w-8 bg-[#b78d4b] sm:w-10" : i === index ? "w-12 bg-[#b78d4b] sm:w-14" : "w-6 bg-[#e8dcc8] sm:w-8"
            }`}
            title={STEP_TITLES[s]}
          />
        </div>
      ))}
    </div>
  );
}

function WizardCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`overflow-hidden rounded-[2rem] border border-[#b78d4b22] bg-white/90 p-6 shadow-[0_28px_60px_-40px_rgba(66,45,14,0.55)] backdrop-blur-sm sm:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function BookOnlineWizard() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service");
  const { data: session, status: sessionStatus } = useSession();
  const isLoggedIn = Boolean(session?.user);

  const [step, setStep] = useState<WizardStep>("welcome");
  const [visitorType, setVisitorType] = useState<VisitorType>(null);
  const [serviceInterest, setServiceInterest] = useState<ServiceInterest>(null);
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedSummary, setConfirmedSummary] = useState("");
  const preselectAppliedRef = useRef(false);

  const selectedRows = useMemo(
    () => bookingServiceOptions.filter((s) => selectedServices.includes(s.id)),
    [selectedServices],
  );

  const primaryServiceId = selectedServices[0] ?? "";
  const bookingDurationMinutes = useMemo(() => {
    if (!selectedServices.length) return 30;
    return Math.max(...selectedServices.map((id) => getBookingOptionById(id)?.durationMinutes ?? 30));
  }, [selectedServices]);

  const dateSlotGroups = useMemo<DateSlotGroup[]>(() => {
    const groups = new Map<string, DateSlotGroup>();
    for (const slot of availableSlots) {
      const dateKey = getDateKeyInTimezone(slot.start, DEFAULT_TIMEZONE);
      const existing = groups.get(dateKey);
      if (existing) existing.slots.push(slot);
      else {
        groups.set(dateKey, {
          key: dateKey,
          label: formatDateLabel(slot.start, DEFAULT_TIMEZONE),
          slots: [slot],
        });
      }
    }
    return Array.from(groups.values());
  }, [availableSlots]);

  const selectedDateSlots = useMemo(
    () => dateSlotGroups.find((g) => g.key === selectedDateKey)?.slots ?? [],
    [dateSlotGroups, selectedDateKey],
  );

  const serviceSelectionHint = useMemo(() => {
    if (serviceInterest === "one") return "Choose one service";
    if (serviceInterest === "two") return `Choose two services (${selectedServices.length}/2)`;
    return `Choose your services (${selectedServices.length} selected)`;
  }, [serviceInterest, selectedServices.length]);

  useEffect(() => {
    if (isLoggedIn) {
      setVisitorType("member");
      if (session?.user?.name) setFullName(session.user.name);
      if (session?.user?.email) setEmail(session.user.email);
    }
  }, [isLoggedIn, session?.user?.name, session?.user?.email]);

  useEffect(() => {
    if (!isLoggedIn) return;
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
  }, [isLoggedIn]);

  useEffect(() => {
    if (step !== "schedule" || !primaryServiceId) return;
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError("");
    void (async () => {
      try {
        const params = new URLSearchParams({
          serviceId: primaryServiceId,
          timezone: DEFAULT_TIMEZONE,
          durationMinutes: String(bookingDurationMinutes),
        });
        const res = await fetch(`/api/scheduling/slots?${params.toString()}`);
        const raw = await res.text();
        let payload: { slots?: TimeSlot[]; error?: string } = {};
        if (raw) payload = JSON.parse(raw) as { slots?: TimeSlot[]; error?: string };
        else if (!res.ok) throw new Error("Could not load times.");
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
  }, [step, primaryServiceId, bookingDurationMinutes]);

  useEffect(() => {
    if (!dateSlotGroups.length) {
      setSelectedDateKey("");
      return;
    }
    if (!dateSlotGroups.some((g) => g.key === selectedDateKey)) {
      setSelectedDateKey(dateSlotGroups[0].key);
    }
  }, [dateSlotGroups, selectedDateKey]);

  useEffect(() => {
    if (step !== "services") {
      preselectAppliedRef.current = false;
      return;
    }
    if (!preselectedService || !getBookingOptionById(preselectedService) || preselectAppliedRef.current) {
      return;
    }
    preselectAppliedRef.current = true;
    setSelectedServices((prev) => {
      if (prev.length > 0) return prev;
      if (serviceInterest === "one") return [preselectedService];
      return [preselectedService];
    });
  }, [step, preselectedService, serviceInterest]);

  function toggleService(id: string) {
    setSelectedServices((prev) => {
      if (serviceInterest === "one") {
        if (prev.includes(id) && prev.length === 1) return [];
        return [id];
      }
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (serviceInterest === "two" && prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  function servicesValid() {
    if (serviceInterest === "two") return selectedServices.length >= 2;
    return selectedServices.length >= 1;
  }

  function goNext() {
    if (step === "welcome" && visitorType) setStep("count");
    else if (step === "count" && serviceInterest) setStep("services");
    else if (step === "services" && servicesValid()) setStep("schedule");
    else if (step === "schedule" && selectedSlotId) setStep("details");
    else if (step === "details") void submitBooking();
  }

  function goBack() {
    if (step === "complete") return;
    const order = STEPS;
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }

  async function submitBooking() {
    if (submitting || !selectedServices.length || !selectedSlotId) return;
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
          serviceIds: selectedServices,
          scheduledSlotId: selectedSlotId,
          timezone: DEFAULT_TIMEZONE,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Could not complete booking. Please call us.");
      }
      const slot = availableSlots.find((s) => s.id === selectedSlotId);
      const when = slot
        ? `${formatDateLabel(slot.start, DEFAULT_TIMEZONE)} at ${formatTimeLabel(slot.start, DEFAULT_TIMEZONE)}`
        : "your selected time";
      const names = selectedRows.map((s) => s.title).join(", ");
      setConfirmedSummary(`${names} · ${when} · ${preferredLocation}`);
      setStep("complete");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const canContinue =
    (step === "welcome" && visitorType !== null) ||
    (step === "count" && serviceInterest !== null) ||
    (step === "services" && servicesValid()) ||
    (step === "schedule" && Boolean(selectedSlotId)) ||
    (step === "details" && Boolean(fullName.trim() && email.trim() && phone.trim()));

  const continueLabel =
    step === "details"
      ? submitting
        ? "Booking your visit…"
        : "Confirm my appointment"
      : "Continue";

  return (
    <div className="relative min-h-[80vh] overflow-hidden pb-32">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#b78d4b18] blur-3xl" />
        <div className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-[#1f7a7a12] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#b78d4b10] blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-10 text-center sm:pt-14">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-flex items-center gap-2 rounded-full border border-[#b78d4b33] bg-white/70 px-4 py-1.5 text-sm text-[#8f6f3e]"
        >
          <Sparkles size={16} />
          KIAN Privé · Concierge booking
        </motion.p>
        <h1 className="mt-5 font-serif text-4xl tracking-tight text-[#1f1a15] sm:text-5xl">
          Your wellness journey starts here
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-[#6f6251]">
          A few easy taps — we&apos;ll handle the rest with white-glove care.
        </p>
        {step !== "complete" ? <StepProgress step={step} /> : null}
      </div>

      <div className="mx-auto mt-10 max-w-3xl px-4">
        <AnimatePresence mode="wait">
          {step === "welcome" ? (
            <WizardCard key="welcome">
              <div className="text-center">
                <Users className="mx-auto text-[#b78d4b]" size={40} strokeWidth={1.5} />
                <h2 className="mt-4 text-2xl font-medium text-[#1f1a15] sm:text-3xl">
                  Do you have a KIAN Privé account?
                </h2>
                <p className="mt-2 text-[#6f6251]">Members get saved details and priority follow-up.</p>
              </div>

              {sessionStatus === "loading" ? (
                <p className="mt-8 text-center text-[#8f6f3e]">One moment…</p>
              ) : isLoggedIn ? (
                <motion.div
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  className="mt-8 rounded-2xl border-2 border-[#2e7d3240] bg-gradient-to-br from-[#f4fbf4] to-white p-6 text-center"
                >
                  <p className="text-sm font-medium tracking-wide text-[#2e7d32]">WELCOME BACK</p>
                  <p className="mt-2 text-xl text-[#1f1a15]">{session?.user?.name ?? "Member"}</p>
                  <p className="mt-1 text-sm text-[#6f6251]">{session?.user?.email}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setVisitorType("member");
                      setStep("count");
                    }}
                    className="mt-6 w-full rounded-2xl bg-[#b78d4b] py-4 text-lg font-semibold text-white"
                  >
                    Continue as member
                  </button>
                </motion.div>
              ) : (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setVisitorType("member")}
                    className={`group rounded-2xl border-2 p-6 text-left transition-all ${
                      visitorType === "member"
                        ? "border-[#b78d4b] bg-[#fff8ed] shadow-lg shadow-[#b78d4b22]"
                        : "border-[#e8dcc8] bg-white hover:border-[#b78d4b66]"
                    }`}
                  >
                    <LogIn className="text-[#b78d4b]" size={28} />
                    <p className="mt-4 text-xl font-medium text-[#1f1a15]">Yes, I have an account</p>
                    <p className="mt-2 text-sm text-[#6f6251]">Sign in for member pricing and saved preferences.</p>
                    {visitorType === "member" ? (
                      <Link
                        href="/login?callbackUrl=/book-online"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-4 inline-flex rounded-full bg-[#1f1a15] px-4 py-2 text-sm text-white"
                      >
                        Sign in now
                      </Link>
                    ) : null}
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisitorType("guest")}
                    className={`group rounded-2xl border-2 p-6 text-left transition-all ${
                      visitorType === "guest"
                        ? "border-[#b78d4b] bg-[#fff8ed] shadow-lg shadow-[#b78d4b22]"
                        : "border-[#e8dcc8] bg-white hover:border-[#b78d4b66]"
                    }`}
                  >
                    <UserPlus className="text-[#b78d4b]" size={28} />
                    <p className="mt-4 text-xl font-medium text-[#1f1a15]">I&apos;m new here</p>
                    <p className="mt-2 text-sm text-[#6f6251]">Book as a guest — no account required today.</p>
                    <p className="mt-3 text-xs text-[#8f6f3e]">
                      Want membership?{" "}
                      <Link href="/signup" className="underline" onClick={(e) => e.stopPropagation()}>
                        Start onboarding
                      </Link>
                    </p>
                  </button>
                </div>
              )}
            </WizardCard>
          ) : null}

          {step === "count" ? (
            <WizardCard key="count">
              <div className="text-center">
                <CalendarHeart className="mx-auto text-[#b78d4b]" size={40} strokeWidth={1.5} />
                <h2 className="mt-4 text-2xl font-medium text-[#1f1a15] sm:text-3xl">
                  How many services interest you today?
                </h2>
                <p className="mt-2 text-[#6f6251]">We&apos;ll tailor the next step for you.</p>
              </div>
              <div className="mt-8 space-y-3">
                {COUNT_OPTIONS.map((opt) => {
                  const active = serviceInterest === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setServiceInterest(opt.id);
                        setSelectedServices([]);
                      }}
                      className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-5 text-left transition-all ${
                        active
                          ? "border-[#b78d4b] bg-gradient-to-r from-[#fff8ed] to-white shadow-md"
                          : "border-[#e8dcc8] bg-white hover:border-[#b78d4b55]"
                      }`}
                    >
                      <span
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold ${
                          active ? "bg-[#b78d4b] text-white" : "bg-[#f4efe6] text-[#8f6f3e]"
                        }`}
                      >
                        {opt.emoji}
                      </span>
                      <div>
                        <p className="text-lg font-medium text-[#1f1a15]">{opt.title}</p>
                        <p className="text-sm text-[#6f6251]">{opt.subtitle}</p>
                      </div>
                      {active ? <Check className="ml-auto shrink-0 text-[#b78d4b]" size={24} /> : null}
                    </button>
                  );
                })}
              </div>
            </WizardCard>
          ) : null}

          {step === "services" ? (
            <WizardCard key="services">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-medium text-[#1f1a15] sm:text-3xl">Choose your services</h2>
                <p className="mt-2 text-[#6f6251]">{serviceSelectionHint}</p>
                {preselectedService && getBookingOptionById(preselectedService) ? (
                  <p className="mt-2 text-sm text-[#8f6f3e]">
                    Tap any card to change your selection — you are not locked to one service.
                  </p>
                ) : null}
                {selectedServices.length > 0 ? (
                  <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {selectedRows.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1 rounded-full bg-[#fff3df] px-3 py-1 text-sm font-medium text-[#8f6f3e]"
                      >
                        <Check size={14} />
                        {s.title}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {bookingServiceOptions.map((service) => {
                  const active = selectedServices.includes(service.id);
                  const disabled =
                    serviceInterest === "two" && !active && selectedServices.length >= 2;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleService(service.id)}
                      className={`relative overflow-hidden rounded-2xl border-2 text-left transition-all ${
                        active
                          ? "border-[#b78d4b] ring-2 ring-[#b78d4b33]"
                          : disabled
                            ? "cursor-not-allowed border-[#e8dcc8] opacity-50"
                            : "border-[#e8dcc8] hover:border-[#b78d4b66]"
                      }`}
                    >
                      <div className="relative h-36 w-full">
                        <Image src={service.image} alt="" fill className="object-cover" sizes="(max-width:640px) 100vw, 50vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1f1a15]/75 via-transparent to-transparent" />
                        {active ? (
                          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#b78d4b] text-white">
                            <Check size={18} />
                          </span>
                        ) : null}
                      </div>
                      <div className="bg-white p-4">
                        <p className="font-medium text-[#1f1a15]">{service.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-[#6f6251]">{service.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </WizardCard>
          ) : null}

          {step === "schedule" ? (
            <WizardCard key="schedule">
              <h2 className="text-2xl font-medium text-[#1f1a15] sm:text-3xl">Pick your perfect time</h2>
              <p className="mt-2 text-[#6f6251]">
                Scheduling for:{" "}
                <span className="font-medium text-[#3b3024]">
                  {selectedRows.map((s) => s.title).join(" + ")}
                </span>
              </p>
              <p className="mt-1 text-sm text-[#8f6f3e]">Eastern Time (Miami)</p>

              {slotsLoading ? (
                <div className="mt-10 flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="h-10 w-10 rounded-full border-2 border-[#e8dcc8] border-t-[#b78d4b]"
                  />
                  <p className="text-[#6f6251]">Finding open times…</p>
                </div>
              ) : slotsError ? (
                <div className="mt-8 rounded-2xl bg-red-50 p-5 text-center text-red-700">{slotsError}</div>
              ) : availableSlots.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-[#e8dcc8] bg-[#fffaf2] p-6 text-center">
                  <p className="text-[#5f5344]">No times online — our team can help.</p>
                  <a href="tel:3059182570" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#b78d4b] px-6 py-3 text-white">
                    <Phone size={18} /> 305-918-2570
                  </a>
                </div>
              ) : (
                <>
                  <p className="mt-8 mb-3 font-medium text-[#3b3024]">Choose a day</p>
                  <div className="flex flex-wrap gap-2">
                    {dateSlotGroups.map((group) => (
                      <button
                        key={group.key}
                        type="button"
                        onClick={() => {
                          setSelectedDateKey(group.key);
                          setSelectedSlotId("");
                        }}
                        className={`rounded-2xl border-2 px-4 py-3 text-sm sm:text-base ${
                          selectedDateKey === group.key
                            ? "border-[#b78d4b] bg-[#fff5e6] font-medium"
                            : "border-[#e8dcc8] bg-white"
                        }`}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-8 mb-3 font-medium text-[#3b3024]">Choose a time</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {selectedDateSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`min-h-[48px] rounded-2xl border-2 py-3 text-base ${
                          selectedSlotId === slot.id
                            ? "border-[#b78d4b] bg-[#fff5e6] font-semibold"
                            : "border-[#e8dcc8] bg-white"
                        }`}
                      >
                        {formatTimeLabel(slot.start, DEFAULT_TIMEZONE)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </WizardCard>
          ) : null}

          {step === "details" ? (
            <WizardCard key="details">
              <h2 className="text-2xl font-medium text-[#1f1a15] sm:text-3xl">Almost there</h2>
              <p className="mt-2 text-[#6f6251]">
                {visitorType === "member"
                  ? "Confirm your details — we pre-filled what we could."
                  : "Tell us how to reach you. We'll send confirmation right away."}
              </p>

              <div className="mt-8 space-y-5">
                {[
                  { label: "Full name", value: fullName, set: setFullName, type: "text", auto: "name" },
                  { label: "Mobile phone", value: phone, set: setPhone, type: "tel", auto: "tel" },
                  { label: "Email", value: email, set: setEmail, type: "email", auto: "email" },
                ].map((field) => (
                  <label key={field.label} className="block">
                    <span className="mb-2 block text-sm font-medium tracking-wide text-[#8f6f3e]">
                      {field.label}
                    </span>
                    <input
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                      type={field.type}
                      autoComplete={field.auto}
                      className="w-full rounded-2xl border-2 border-[#e8dcc8] bg-[#fffdf9] px-4 py-4 text-lg text-[#1f1a15] outline-none transition focus:border-[#b78d4b] focus:ring-4 focus:ring-[#b78d4b18]"
                    />
                  </label>
                ))}
              </div>

              <p className="mt-8 mb-3 font-medium text-[#3b3024]">Visit location</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {LOCATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPreferredLocation(opt.value)}
                    className={`rounded-2xl border-2 px-3 py-4 text-center transition ${
                      preferredLocation === opt.value
                        ? "border-[#b78d4b] bg-[#fff5e6]"
                        : "border-[#e8dcc8] bg-white"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <p className="mt-2 text-sm font-medium text-[#3b3024]">{opt.label}</p>
                  </button>
                ))}
              </div>

              {submitError ? (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-center text-red-700">{submitError}</p>
              ) : null}
            </WizardCard>
          ) : null}

          {step === "complete" ? (
            <WizardCard key="complete" className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#b78d4b] to-[#8f6f3e] text-white shadow-lg"
              >
                <Check size={48} strokeWidth={2.5} />
              </motion.div>
              <h2 className="mt-6 font-serif text-3xl text-[#1f1a15] sm:text-4xl">You&apos;re all set!</h2>
              <p className="mx-auto mt-3 max-w-md text-lg text-[#6f6251]">
                {fullName.split(" ")[0] || "Friend"}, your appointment is confirmed. Check your email for details.
              </p>
              <p className="mx-auto mt-6 rounded-2xl border border-[#b78d4b33] bg-[#fffaf2] px-5 py-4 text-[#3b3024]">
                {confirmedSummary}
              </p>
              {selectedServices.length > 1 ? (
                <p className="mx-auto mt-3 max-w-md text-sm text-[#8f6f3e]">
                  Our concierge will coordinate timing for all {selectedServices.length} services.
                </p>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/"
                  className="rounded-2xl bg-[#b78d4b] px-8 py-4 text-lg font-semibold text-white"
                >
                  Explore KIAN Privé
                </Link>
                {visitorType === "member" || isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="rounded-2xl border-2 border-[#b78d4b] px-8 py-4 text-lg text-[#3b3024]"
                  >
                    My dashboard
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="rounded-2xl border-2 border-[#b78d4b] px-8 py-4 text-lg text-[#3b3024]"
                  >
                    Join as a member
                  </Link>
                )}
              </div>
            </WizardCard>
          ) : null}
        </AnimatePresence>

        <p className="mt-10 text-center text-sm text-[#8f6f3e]">
          <a href="tel:3059182570" className="font-medium underline">
            305-918-2570
          </a>
          {" · "}
          <Link href="/contact" className="underline">
            Contact concierge
          </Link>
        </p>
      </div>

      {step !== "complete" ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#b78d4b22] bg-white/90 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl gap-3">
            {step !== "welcome" ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex min-h-[56px] items-center justify-center gap-1 rounded-2xl border-2 border-[#e8dcc8] px-6 text-lg text-[#3b3024]"
              >
                <ChevronLeft size={22} />
                Back
              </button>
            ) : null}
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue || submitting}
              className="min-h-[56px] flex-1 rounded-2xl bg-gradient-to-r from-[#b78d4b] to-[#a67d42] text-lg font-semibold text-white shadow-[0_12px_28px_-12px_rgba(183,141,75,0.8)] disabled:opacity-50"
            >
              {continueLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
