import Image from "next/image";
import Link from "next/link";

type CinematicHeroProps = {
  eyebrow?: string;
  lineOne?: string;
  lineTwo?: string;
  lineThree?: string;
  description?: string;
  primaryCta?: { label: string; href: string } | null;
  secondaryCta?: { label: string; href: string } | null;
  imageSrc?: string;
  imageAlt?: string;
  /** Homepage should keep priority; inner pages pass false to avoid competing LCP. */
  priority?: boolean;
};

export function CinematicHero({
  eyebrow = "THE SERVICE MENU",
  lineOne = "Luxury wellness.",
  lineTwo = "Uncompromising care.",
  lineThree = "Exclusively yours.",
  description = "KIAN Privé is a concierge wellness provider — physicians, nurses, aestheticians and specialists delivering clinical medicine, advanced skincare and regenerative therapies in a serene, intimate setting. At our suite, or yours.",
  primaryCta = { label: "View the Menu", href: "#all-services" },
  secondaryCta = { label: "Reserve a Session", href: "/book-online" },
  imageSrc = "/images/facial-treatments.jpg",
  imageAlt = "KIAN Privé luxury wellness suite",
  priority = false,
}: CinematicHeroProps) {
  const showCtas = Boolean(primaryCta || secondaryCta);
  return (
    <section className="relative min-h-[min(88vh,920px)] w-full overflow-hidden bg-[#1a1510]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority={priority}
        quality={75}
        className="object-cover object-center"
        sizes="100vw"
      />
      {/* Single dark wash for text contrast — no bottom fade (cream handles the page blend) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(105deg,rgba(18,14,10,0.72)_0%,rgba(18,14,10,0.48)_45%,rgba(18,14,10,0.35)_100%)]"
      />
      {/* Single cream blend into next section: 0% at top of band → 100% at bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-28 md:h-32"
        style={{
          background:
            "linear-gradient(to top, #fffdf9 0%, rgba(255,253,249,0.65) 45%, rgba(255,253,249,0) 100%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[min(88vh,920px)] max-w-7xl items-center px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 text-[11px] tracking-[0.28em] text-[#c9a86a] sm:text-xs">
            <span className="h-px w-8 bg-[#c9a86a]" aria-hidden />
            {eyebrow}
          </p>
          <h1 className="mt-6 font-serif text-[2.35rem] leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            <span className="block">{lineOne}</span>
            <span className="mt-1 block italic text-[#c9a86a]">{lineTwo}</span>
            <span className="mt-1 block">{lineThree}</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/88 sm:text-base sm:leading-relaxed">{description}</p>
          {showCtas ? (
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              {primaryCta ? (
                <Link
                  href={primaryCta.href}
                  className="inline-flex min-h-[48px] items-center rounded-sm bg-[#8a682e] px-6 text-xs font-medium tracking-[0.18em] text-white transition hover:bg-[#755724] sm:px-7 sm:text-sm"
                >
                  {primaryCta.label.toUpperCase()}
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex min-h-[48px] items-center rounded-sm border border-white/85 bg-transparent px-6 text-xs font-medium tracking-[0.18em] text-white transition hover:bg-white/10 sm:px-7 sm:text-sm"
                >
                  {secondaryCta.label.toUpperCase()}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
