import Link from "next/link";
import { EditorialEyebrow, editorialCtaPrimary } from "@/components/ui/editorial-primitives";

const philosophyParagraphs = [
  "At KIAN Privé, our philosophy is deeply rooted in personal experiences that highlight the importance of holistic care. We’ve learned firsthand how effective lymphatic drainage and comprehensive treatments can significantly enhance overall well-being. Our physician-led protocols focus on treating the entire body to achieve sustainable health and beauty balance.",
  "We offer a diverse range of services, including weight loss and hormonal optimization through advanced peptide therapies, herbal remedies, and principles of Chinese medicine. Starting with baseline labs, our dedicated physicians and specialists will help guide your journey, ensuring personalized care tailored to your unique needs. From nutrition to IV therapy and beyond, we take a comprehensive approach to your wellness.",
  "We understand that true wellness goes beyond superficial aesthetics. By integrating physician-led lymphatic drainage, innovative therapies, and holistic practices—including the wisdom of herbal and Chinese medicine—we promote detoxification and support your body’s natural functions. This all-encompassing strategy fosters a harmonious balance between your inner health and outer beauty.",
  "Join us on a transformative journey at KIAN Privé, where you become a cherished part of our family. Your well-being is our passion, and together, we will uncover the beauty that comes from within.",
];

export function HomePhilosophy() {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
      <div className="lg:sticky lg:top-28">
        <EditorialEyebrow>OUR PHILOSOPHY</EditorialEyebrow>
        <h2 className="mt-4 max-w-md font-serif text-3xl leading-tight text-[#1f1a15] md:text-4xl lg:text-[2.75rem]">
          Beauty that comes from within.
        </h2>
        <span className="mt-5 block h-px w-16 bg-[#c9a86a]" aria-hidden />
        <p className="mt-5 max-w-md text-lg leading-relaxed text-[#6f6251]">
          Ready to start your journey?
        </p>
        <Link href="/services" className={`${editorialCtaPrimary} mt-6`}>
          GET STARTED NOW
        </Link>
      </div>

      <div className="space-y-6 border-l border-[#e4d9c8] pl-6 sm:pl-8">
        {philosophyParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="max-w-2xl text-base leading-[1.8] text-[#4f4335] sm:text-[1.05rem]">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
