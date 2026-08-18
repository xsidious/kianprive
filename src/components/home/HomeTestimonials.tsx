import Link from "next/link";
import { EditorialEyebrow, editorialCtaSecondary, editorialPanel } from "@/components/ui/editorial-primitives";

const quotes = [
  {
    quote:
      "My energy, skin, and recovery all improved within weeks. The KIAN team built a plan that finally felt personal and sustainable.",
    name: "Sophia M.",
    title: "Concierge Wellness Client",
  },
  {
    quote:
      "The protocols are premium but practical. I now have clear monthly targets and measurable progress without the usual clinic friction.",
    name: "Daniel R.",
    title: "Performance Member",
  },
  {
    quote:
      "This is the first place where medical insight and aesthetics were coordinated as one strategy. Results have been consistent and visible.",
    name: "Alyssa T.",
    title: "Aesthetics Client",
  },
];

export function HomeTestimonials() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <EditorialEyebrow>CLIENT STORIES</EditorialEyebrow>
          <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Trusted by members</h2>
          <p className="mt-3 max-w-2xl text-[#6f6251]">Real clients. Personal protocols. Lasting change.</p>
        </div>
        <Link href="/client-testimonials" className={editorialCtaSecondary}>
          READ MORE STORIES
        </Link>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {quotes.map((item) => (
          <blockquote key={item.name} className={`${editorialPanel} flex flex-col p-6 sm:p-7`}>
            <span className="font-serif text-4xl leading-none text-[#c9a86a]" aria-hidden>
              “
            </span>
            <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#4f4335]">{item.quote}</p>
            <footer className="mt-6 border-t border-[#e4d9c8] pt-4">
              <cite className="not-italic">
                <span className="block font-medium text-[#1f1a15]">{item.name}</span>
                <span className="mt-0.5 block text-sm text-[#8f6f3e]">{item.title}</span>
              </cite>
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
