import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Image from "next/image";
import { getBlogPosts } from "@/lib/content";
import { BlogGrid } from "@/components/blog/blog-grid";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div>
      <SectionWrapper className="pt-18">
        <div className="grid items-center gap-10 rounded-3xl border border-[#b78d4b2e] bg-white p-8 shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)] lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">JOURNAL</p>
            <h1 className="mt-4 text-4xl text-[#1f1a15] md:text-5xl">Insights on Wellness, Performance, and Clinical Aesthetics</h1>
            <p className="mt-5 max-w-2xl text-[#6f6251]">
              Explore practical guidance from the KIAN Privé perspective on concierge care, recovery strategy, and premium protocol design.
            </p>
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-3xl border border-[#b78d4b36]">
            <Image src="/images/beauty.avif" alt="Wellness editorial" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <BlogGrid posts={posts} />
      </SectionWrapper>
    </div>
  );
}
