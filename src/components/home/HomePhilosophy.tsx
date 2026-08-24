const sections = [
  {
    number: "01",
    label: "Philosophy",
    title: "Rooted in lived experience",
    body:
      "At KIAN Privé, our philosophy is deeply rooted in personal experiences that highlight the importance of holistic care. We've learned firsthand how effective lymphatic drainage and comprehensive treatments can significantly enhance overall well-being. Our physician-led protocols focus on treating the entire body to achieve sustainable health and beauty balance. As a private concierge wellness practice, we deliver personalized care in our suite or yours.",
    items: [
      { label: "Lymphatic drainage", icon: "lymph" as const },
      { label: "Physician-led protocols", icon: "stethoscope" as const },
      { label: "Whole-body balance", icon: "lotus" as const },
    ],
  },
  {
    number: "02",
    label: "Services",
    title: "A journey guided by data",
    body:
      "We offer a diverse range of services, including weight loss and hormonal optimization through advanced peptide therapies, herbal remedies, and principles of Chinese medicine. Starting with baseline labs, our dedicated physicians and specialists will help guide your journey, ensuring personalized care tailored to your unique needs. From nutrition to IV therapy and beyond, we take a comprehensive approach to your wellness.",
    items: [
      { label: "Baseline labs & peptides", icon: "flask" as const },
      { label: "Herbal & Chinese medicine", icon: "leaf" as const },
      { label: "Nutrition", icon: "bowl" as const },
      { label: "IV therapy", icon: "iv" as const },
    ],
  },
  {
    number: "03",
    label: "Method",
    title: "Beyond superficial aesthetics",
    body:
      "We understand that true wellness goes beyond superficial aesthetics. By integrating physician-led lymphatic drainage, innovative therapies, and holistic practices—including the wisdom of herbal and Chinese medicine—we promote detoxification and support your body's natural functions. This all-encompassing strategy fosters a harmonious balance between your inner health and outer beauty.",
    items: [
      { label: "Detoxification", icon: "breeze" as const },
      { label: "Innovative therapies", icon: "sparkles" as const },
      { label: "Inner & outer harmony", icon: "sun" as const },
    ],
  },
  {
    number: "04",
    label: "Invitation",
    title: "Become part of the family",
    body:
      "Join us on a transformative journey at KIAN Privé, where you become a cherished part of our family. Your well-being is our passion, and together, we will uncover the beauty that comes from within.",
    items: [{ label: "A cherished welcome", icon: "heart" as const }],
  },
];

type IconName =
  | "lymph"
  | "stethoscope"
  | "lotus"
  | "flask"
  | "leaf"
  | "bowl"
  | "iv"
  | "breeze"
  | "sparkles"
  | "sun"
  | "heart";

function PhilosophyIcon({ name }: { name: IconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c9a86a]/70 text-[#8a682e]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        {name === "lymph" ? (
          <>
            <path {...common} d="M4 8c2.5-2 5.5-2 8 0s5.5 2 8 0" />
            <path {...common} d="M4 12c2.5-2 5.5-2 8 0s5.5 2 8 0" />
            <path {...common} d="M4 16c2.5-2 5.5-2 8 0s5.5 2 8 0" />
          </>
        ) : null}
        {name === "stethoscope" ? (
          <>
            <path {...common} d="M6 4v6a4 4 0 0 0 8 0V4" />
            <path {...common} d="M10 14v2a4 4 0 0 0 8 0v-1" />
            <circle {...common} cx="18" cy="14" r="2" />
            <path {...common} d="M6 4h2M14 4h2" />
          </>
        ) : null}
        {name === "lotus" ? (
          <>
            <path {...common} d="M12 19c-3-3-5-6-5-9a5 5 0 0 1 10 0c0 3-2 6-5 9Z" />
            <path {...common} d="M12 19c-1.5-4-1.5-7 0-11" />
            <path {...common} d="M7 12c2 0 3.5-1 5-3 1.5 2 3 3 5 3" />
          </>
        ) : null}
        {name === "flask" ? (
          <>
            <path {...common} d="M9 3h6M10 3v5.5L6.5 18a2.5 2.5 0 0 0 2.3 3.5h6.4a2.5 2.5 0 0 0 2.3-3.5L14 8.5V3" />
            <path {...common} d="M8 14h8" />
          </>
        ) : null}
        {name === "leaf" ? (
          <>
            <path {...common} d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14Z" />
            <path {...common} d="M5 19c4-4 8-8 12-12" />
          </>
        ) : null}
        {name === "bowl" ? (
          <>
            <path {...common} d="M4 11h16c-.5 5-4 8-8 8s-7.5-3-8-8Z" />
            <path {...common} d="M12 5v4M10 6.5 14 8" />
          </>
        ) : null}
        {name === "iv" ? (
          <>
            <path {...common} d="M9 3h6l1 5H8L9 3Z" />
            <path {...common} d="M12 8v10" />
            <path {...common} d="M10 18h4" />
            <path {...common} d="M12 13c1.5 0 2.5-1 2.5-2.2" />
          </>
        ) : null}
        {name === "breeze" ? (
          <>
            <path {...common} d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5" />
            <path {...common} d="M3 12h14a2.5 2.5 0 1 1-2.5 2.5" />
            <path {...common} d="M3 16h9a2.5 2.5 0 1 0-2.5 2.5" />
          </>
        ) : null}
        {name === "sparkles" ? (
          <>
            <path {...common} d="M12 4v3M12 17v3M4 12h3M17 12h3" />
            <path {...common} d="M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2" />
            <circle {...common} cx="12" cy="12" r="1.5" />
          </>
        ) : null}
        {name === "sun" ? (
          <>
            <circle {...common} cx="12" cy="12" r="3.5" />
            <path {...common} d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6.2 6.2l1.8 1.8M16 16l1.8 1.8M17.8 6.2 16 8M8 16l-1.8 1.8" />
          </>
        ) : null}
        {name === "heart" ? (
          <path
            {...common}
            d="M12 19s-7-4.3-7-9a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 4.7-7 9-7 9Z"
          />
        ) : null}
      </svg>
    </span>
  );
}

export function HomePhilosophy() {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="text-center">
        <h2 className="font-serif text-4xl leading-tight text-[#2b241c] sm:text-5xl md:text-[3.25rem]">
          Vitality begins
        </h2>
        <p className="mt-1 font-serif text-3xl italic leading-tight text-[#5f7a6e] sm:text-4xl md:text-[2.75rem]">
          from within
        </p>
        <div className="mx-auto mt-8 h-px w-full max-w-xl bg-[#c9a86a]/80" aria-hidden />
      </header>

      <div className="mt-14 space-y-16 sm:mt-16 sm:space-y-20">
        {sections.map((section) => (
          <article
            key={section.number}
            className="grid gap-8 sm:grid-cols-[minmax(10rem,0.42fr)_minmax(0,1fr)] sm:gap-10 md:gap-14"
          >
            <ul className="space-y-5 sm:pt-1">
              {section.items.map((item) => (
                <li key={item.label} className="flex items-center gap-3.5">
                  <PhilosophyIcon name={item.icon} />
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#3b3024] sm:text-[11px]">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#b78d4b]">
                {section.number} — {section.label}
              </p>
              <h3 className="mt-3 font-serif text-2xl text-[#2b241c] sm:text-[1.75rem]">{section.title}</h3>
              <p className="mt-4 max-w-xl text-[15px] leading-[1.75] text-[#6a5d4e]">{section.body}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-16 h-px w-full max-w-xl bg-[#c9a86a]/80 sm:mt-20" aria-hidden />
      <p className="mt-6 text-center text-[11px] uppercase tracking-[0.32em] text-[#8a7d6c] sm:text-xs">
        Health · Balance · Beauty
      </p>
    </div>
  );
}
