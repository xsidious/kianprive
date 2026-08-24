import { APPOINTMENT_AFTERCARE } from "@/lib/booking-aftercare";

type Props = {
  serviceTitles?: string[];
  className?: string;
};

export function AppointmentAftercare({ serviceTitles, className = "" }: Props) {
  return (
    <section
      className={`overflow-hidden rounded-sm bg-[#1a1612] px-5 py-8 sm:px-7 sm:py-10 ${className}`}
      aria-label="Appointment aftercare"
    >
      <p className="text-[10px] uppercase tracking-[0.24em] text-[#c9a86a]">Your visit is complete</p>
      <h3 className="mt-3 font-serif text-2xl text-[#f7f1e8] sm:text-3xl">Aftercare guidance</h3>
      {serviceTitles?.length ? (
        <p className="mt-2 text-sm text-[#cbbba5]">{serviceTitles.join(", ")}</p>
      ) : null}

      <div className="mt-8 space-y-8">
        {APPOINTMENT_AFTERCARE.map((item) => (
          <article key={item.label}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9a86a]">{item.label}</p>
            <p className="mt-3 font-serif text-xl leading-snug text-[#f7f1e8] sm:text-[1.35rem]">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
