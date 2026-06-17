import Image from "next/image";
import { Play } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

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
    <div>
      <SectionWrapper className="pt-14 sm:pt-16">
        <h1 className="text-3xl text-[#1f1a15] md:text-5xl">Client Testimonials</h1>
        <p className="mt-4 max-w-3xl text-[#6f6251]">
          Written and video stories from clients following personalized concierge wellness protocols.
        </p>
      </SectionWrapper>

      <SectionWrapper>
        <p className="mb-4 text-xs tracking-[0.18em] text-[#8f6f3e]">WRITTEN</p>
        <div className="grid gap-4 md:grid-cols-3">
          {writtenTestimonials.map((item) => (
            <article key={item.name} className="rounded-2xl border border-[#b78d4b2d] bg-white p-5 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
              <p className="text-[#4f4335]">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-4 text-[#2b2218]">{item.name}</p>
              <p className="text-sm text-[#8f6f3e]">{item.title}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <p className="mb-4 text-xs tracking-[0.18em] text-[#8f6f3e]">VIDEO</p>
        <div className="grid gap-4 md:grid-cols-3">
          {videoTestimonials.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-2xl border border-[#b78d4b2d] bg-[#2b2218] shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]"
            >
              <div className="relative h-44">
                <Image src="/images/facial-treatments.jpg" alt="" fill className="object-cover opacity-40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-sm">
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
      </SectionWrapper>
    </div>
  );
}
