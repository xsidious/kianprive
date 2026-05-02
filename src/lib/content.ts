import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  readTime: string;
  image: string;
  content: string[];
};

export const blogPostsData: BlogPost[] = [
  {
    slug: "icoone-and-lymphatic-optimization",
    title: "How Icoone Supports Lymphatic Optimization and Faster Recovery",
    excerpt:
      "A practical look at how Icoone microstimulation can improve circulation, reduce inflammation, and enhance post-treatment recovery.",
    publishedAt: "2026-04-10",
    category: "Icoone",
    readTime: "6 min read",
    image: "/images/icoone.avif",
    content: [
      "Icoone therapy uses robotic microstimulation technology to activate superficial and deeper tissue layers with precision. For clients focused on recovery and body optimization, this can support healthier lymphatic flow and visible improvements in comfort and contour.",
      "When integrated with a complete care strategy, Icoone sessions can complement performance protocols by reducing fluid stagnation and supporting tissue quality after training blocks, long flights, or high stress cycles.",
      "At KIAN Privé, Icoone is not delivered as a standalone trend treatment. It is used within individualized plans that consider current health status, treatment goals, and the best sequencing with additional services like nutrition, diagnostics, and recovery support.",
    ],
  },
  {
    slug: "concierge-wellness-at-home",
    title: "The New Standard: Concierge Wellness at Home",
    excerpt:
      "Why high-performing clients are moving toward private, in-home care models for better consistency, privacy, and outcomes.",
    publishedAt: "2026-04-06",
    category: "Concierge Care",
    readTime: "5 min read",
    image: "/images/wellness.avif",
    content: [
      "Concierge wellness shifts healthcare from reactive appointments to proactive continuity. Instead of fitting your life around fragmented visits, care is brought directly to your environment with better coordination and less friction.",
      "This model increases consistency and adherence because it removes common barriers: time pressure, waiting rooms, and disconnected provider communication. Clients can stay focused on results while the care team handles orchestration.",
      "For many members, the biggest advantage is privacy. In-home and on-location services allow clients to receive premium care discreetly while maintaining momentum across clinical, aesthetic, and performance goals.",
    ],
  },
  {
    slug: "clinical-aesthetics-with-natural-balance",
    title: "Clinical Aesthetics with a Natural, Long-Term Strategy",
    excerpt:
      "The best aesthetic outcomes come from protocol design, not one-off procedures. Here is how to build a sustainable approach.",
    publishedAt: "2026-03-28",
    category: "Medical Aesthetics",
    readTime: "7 min read",
    image: "/images/medicalaesthetics.avif",
    content: [
      "Aesthetic care is most effective when it is planned in phases. A strong strategy starts with baseline assessment, realistic goals, and treatment sequencing that respects tissue health and recovery.",
      "Rather than chasing quick fixes, long-term plans focus on preserving skin quality, supporting collagen remodeling, and aligning treatments with overall wellness indicators like inflammation, hydration, and nutrition.",
      "KIAN Privé combines physician oversight with regenerative and supportive modalities so clients can achieve visible enhancements while maintaining a balanced, natural look over time.",
    ],
  },
  {
    slug: "beauty-rituals-that-protect-skin-longevity",
    title: "Beauty Rituals That Protect Skin Longevity",
    excerpt:
      "Daily beauty habits that preserve barrier integrity, collagen health, and long-term skin glow without overloading your routine.",
    publishedAt: "2026-03-21",
    category: "Beauty",
    readTime: "5 min read",
    image: "/images/facial-treatments.jpg",
    content: [
      "Luxury skincare outcomes are built on consistency, not intensity. A simplified structure that protects barrier function can outperform aggressive treatment stacking over time.",
      "Hydration, antioxidant support, and gentle stimulation techniques can preserve glow and reduce visible stress markers. The right cadence matters more than the number of products.",
      "At KIAN Privé, beauty protocols are aligned with your broader wellness context so skin health improves alongside recovery, sleep quality, and inflammation reduction.",
    ],
  },
  {
    slug: "how-to-combine-recovery-and-aesthetics",
    title: "How to Combine Recovery and Aesthetics for Better Results",
    excerpt:
      "A modern approach to pairing body recovery therapies with beauty treatments for improved resilience and visible outcomes.",
    publishedAt: "2026-03-15",
    category: "Recovery",
    readTime: "6 min read",
    image: "/images/wellness.avif",
    content: [
      "Recovery and aesthetics are strongest when programmed together. Tissue quality and circulation directly influence how well aesthetic protocols perform.",
      "Integrating lymphatic and recovery-support sessions can improve comfort and consistency while reducing downtime after treatment blocks.",
      "This integrated sequencing is one of the core reasons clients experience more reliable and sustainable outcomes in our concierge model.",
    ],
  },
  {
    slug: "nutrition-protocols-for-radiant-skin",
    title: "Nutrition Protocols for Radiant Skin and Stable Energy",
    excerpt:
      "How strategic nutrition and supplementation support skin quality, hormonal stability, and performance throughout the week.",
    publishedAt: "2026-03-08",
    category: "Nutrition",
    readTime: "7 min read",
    image: "/images/nutrition.avif",
    content: [
      "Nutritional support for skin quality begins with reducing inflammatory load and improving micronutrient consistency. This creates better conditions for tissue repair.",
      "Protein quality, hydration strategy, and targeted supplementation can support elasticity, recovery, and clarity while stabilizing daily energy output.",
      "When nutrition is coordinated with clinical oversight, the protocol remains adaptive and aligned to changing goals across seasons and stress cycles.",
    ],
  },
];

export async function getBlogPosts(): Promise<BlogPost[]> {
  const dbPosts = await prisma.blogPost
    .findMany({
      where: { status: ContentStatus.PUBLISHED },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
    })
    .catch(() => []);

  if (!dbPosts.length) return blogPostsData;

  return dbPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? "",
    publishedAt: (post.publishedAt ?? post.updatedAt).toISOString(),
    category: post.category?.name ?? "General",
    readTime: post.readTime ?? "5 min read",
    image: post.featuredImage ?? "/images/beauty.avif",
    content: Array.isArray(post.content) ? (post.content as string[]) : [],
  }));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const dbPost = await prisma.blogPost
    .findFirst({
      where: {
        slug,
        status: ContentStatus.PUBLISHED,
      },
      include: { category: true },
    })
    .catch(() => null);

  if (dbPost) {
    return {
      slug: dbPost.slug,
      title: dbPost.title,
      excerpt: dbPost.excerpt ?? "",
      publishedAt: (dbPost.publishedAt ?? dbPost.updatedAt).toISOString(),
      category: dbPost.category?.name ?? "General",
      readTime: dbPost.readTime ?? "5 min read",
      image: dbPost.featuredImage ?? "/images/beauty.avif",
      content: Array.isArray(dbPost.content) ? (dbPost.content as string[]) : [],
    };
  }

  return blogPostsData.find((post) => post.slug === slug) ?? null;
}
