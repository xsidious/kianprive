import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/content";
import { BlogGrid } from "@/components/blog/blog-grid";
import { CinematicHero } from "@/components/ui/CinematicHero";
import { EditorialEyebrow, EditorialSection } from "@/components/ui/editorial-primitives";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildSeoMetadata({
  title: "Wellness Journal",
  description:
    "Insights from KIAN Privé on lymphatic health, aesthetics, recovery, nutrition, and concierge wellness in Miami.",
  canonicalPath: "/blog",
});

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="JOURNAL"
        lineOne="Insights on wellness."
        lineTwo="Performance."
        lineThree="Clinical aesthetics."
        description="Explore practical guidance from the KIAN Privé perspective on concierge care, recovery strategy, and premium protocol design."
        primaryCta={{ label: "Read the Journal", href: "#journal" }}
        secondaryCta={{ label: "Book Online", href: "/book-online" }}
        imageSrc="/images/facial-treatments.webp"
        imageAlt="Wellness editorial"
        priority={false}
      />

      <EditorialSection id="journal">
        <EditorialEyebrow>LATEST</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">From the journal</h2>
        <div className="mt-8">
          <BlogGrid posts={posts} />
        </div>
      </EditorialSection>
    </div>
  );
}
