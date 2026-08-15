import Image from "next/image";
import { Play } from "lucide-react";
import { CinematicHero } from "@/components/ui/CinematicHero";
import { pageHeroes } from "@/lib/media/heroes";
import { EditorialEyebrow, EditorialSection, editorialPanel } from "@/components/ui/editorial-primitives";

const writtenTestimonials = [
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

const videoTestimonials = [
  { title: "Concierge Wellness Journey", category: "Written & Video" },
  { title: "Lymphatic & Recovery Results", category: "Video" },
  { title: "Aesthetics Transformation Story", category: "Video" },
];

export default function ClientTestimonialsPage() {
  return (
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="CLIENT STORIES"
        lineOne="Real clients."
        lineTwo="Measurable change."
        lineThree="Lasting trust."
        description="Written and video stories from clients following personalized concierge wellness protocols."
        primaryCta={{ label: "Book Consultation", href: "/book-online" }}
        secondaryCta={{ label: "Explore Services", href: "/services" }}
        imageSrc={pageHeroes.testimonials.src}
        imageAlt={pageHeroes.testimonials.alt}
      />

      <EditorialSection>
        <EditorialEyebrow>WRITTEN</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Client Testimonials</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {writtenTestimonials.map((item) => (
            <article key={item.name} className={`${editorialPanel} p-5`}>
              <p className="text-[#4f4335]">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-4 text-[#2b2218]">{item.name}</p>
              <p className="text-sm text-[#8f6f3e]">{item.title}</p>
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection dark>
        <EditorialEyebrow tone="dark">VIDEO</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#f7f1e8] md:text-4xl">On camera</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {videoTestimonials.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-sm border border-[#c9a86a33] bg-[#221c17]">
              <div className="relative h-44">
                <Image src="/images/HairReatorationpicture.jpeg" alt="" fill className="object-cover opacity-40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-white/40 bg-white/15 text-white backdrop-blur-sm">
                    <Play size={22} fill="currentColor" />
                  </span>
                  <p className="text-xs tracking-[0.14em] text-white/80">{item.category.toUpperCase()}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-white">{item.title}</p>
                <p className="mt-1 text-xs text-[#c9b89a]">Video testimonial — upload final asset when ready.</p>
              </div>
            </article>
          ))}
        </div>
      </EditorialSection>
    </div>
  );
}
