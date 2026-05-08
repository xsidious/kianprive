import { PrismaClient, ContentStatus } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function estimateReadTime(content) {
  const words = content.join(" ").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(4, Math.ceil(words / 180));
  return `${minutes} min read`;
}

const posts = [
  {
    slug: "what-is-the-lymphatic-system-and-why-it-is-important",
    title: "What Is the Lymphatic System and Why Is It So Important?",
    excerpt:
      "A practical guide to how the lymphatic system supports immunity, fluid balance, detoxification, and why lymphatic drainage can improve how you feel and look.",
    publishedAt: "2026-05-08",
    category: "Lymphatic Health",
    image: "/images/icoone.avif",
    content: [
      "The lymphatic system is a network of vessels, tissues, and organs that transports lymph, a clear fluid containing immune cells, proteins, waste products, and excess fluid.",
      "It works alongside the circulatory system and helps your body regulate inflammation, fluid balance, and immune response every day.",
      "Core components include lymph vessels, lymph nodes, spleen, thymus, bone marrow, and tonsils. These structures work together to monitor threats and clear metabolic byproducts.",
      "Lymph nodes filter foreign particles and activate immune cells, helping your body respond to bacteria, viruses, and other stressors.",
      "The lymphatic pathway also returns excess interstitial fluid to the bloodstream. Without this process, swelling and fluid retention can increase.",
      "When lymph flow is sluggish, people often report heavy legs, puffiness, reduced recovery, and dull skin tone.",
      "Lymphatic drainage therapy and movement-based circulation support can improve comfort, reduce visible puffiness, and enhance tissue quality over time.",
      "At KIAN Prive, lymphatic optimization is integrated with broader wellness plans to support measurable, sustainable outcomes.",
    ],
  },
  {
    slug: "putting-your-best-face-forward-the-power-of-exfoliation",
    title: "Putting Your Best Face Forward: The Power of Exfoliation",
    excerpt:
      "Why exfoliation improves skin clarity, tone, product absorption, and makeup finish, and how to do it safely.",
    publishedAt: "2026-05-08",
    category: "Beauty",
    image: "/images/facial-treatments.jpg",
    content: [
      "Exfoliation removes dead skin buildup that can block your products from absorbing effectively.",
      "Regular exfoliation can help reduce clogged pores, minimize breakouts, and improve visible skin texture.",
      "It also supports a more even-looking complexion by helping fade dark marks over time.",
      "For makeup wearers, smoother skin can improve foundation application and reduce patchiness.",
      "As skin renewal slows with age, exfoliation can help support fresher, brighter-looking skin.",
      "For most people, exfoliating once weekly is a safe baseline, with up to twice weekly for makeup-heavy routines when tolerated.",
      "Over-exfoliation can irritate the barrier, so consistency and moderation matter more than intensity.",
    ],
  },
  {
    slug: "boost-your-collagen-naturally-the-power-of-vitamin-c-for-your-skin-and-lymphatic-system",
    title: "Boost Your Collagen Naturally: The Power of Vitamin C for Your Skin and Lymphatic System",
    excerpt:
      "How vitamin C supports collagen, skin quality, and lymphatic health, plus practical ways to improve your routine naturally.",
    publishedAt: "2026-05-08",
    category: "Nutrition",
    image: "/images/nutrition.avif",
    content: [
      "Vitamin C plays a central role in collagen synthesis, helping your body maintain firm skin and resilient connective tissue.",
      "Collagen is not just cosmetic. It also supports structural elements around lymphatic tissues, which are critical for immune and fluid regulation.",
      "Vitamin C also supports lymphocyte health and helps protect immune cells from oxidative stress.",
      "Whole-food vitamin C sources such as citrus, berries, peppers, and leafy vegetables are often better tolerated and more nutrient-dense than isolated synthetic forms.",
      "When combined with hydration, circulation support, and consistent skincare habits, vitamin C can improve skin tone, brightness, and recovery.",
      "Pairing internal nutrition with quality topical and exfoliation routines can significantly improve visible skin outcomes over time.",
      "A balanced strategy focused on diet, routine, and consistency delivers better long-term results than quick-fix product stacking.",
    ],
  },
  {
    slug: "icoone-and-lymphatic-optimization",
    title: "How Icoone Supports Lymphatic Optimization and Faster Recovery",
    excerpt:
      "A practical look at how Icoone microstimulation can improve circulation, reduce inflammation, and enhance post-treatment recovery.",
    publishedAt: "2026-04-10",
    category: "Icoone",
    image: "/images/icoone.avif",
    content: [
      "Icoone therapy uses robotic microstimulation to activate superficial and deeper tissue layers with precision.",
      "This supports healthier lymphatic flow, improved circulation, and better tissue comfort following stress, travel, or training.",
      "When integrated into a complete care plan, sessions can reduce fluid stagnation and improve contour quality over time.",
      "Icoone is most effective when sequenced with nutrition, diagnostics, recovery support, and clinical oversight.",
      "Clients often report improvements in heaviness, puffiness, and post-session recovery metrics when protocols are consistent.",
      "The key is structured treatment cadence, not one-off sessions without follow-through.",
    ],
  },
  {
    slug: "concierge-wellness-at-home",
    title: "The New Standard: Concierge Wellness at Home",
    excerpt:
      "Why high-performing clients are moving toward private, in-home care models for better consistency, privacy, and outcomes.",
    publishedAt: "2026-04-06",
    category: "Concierge Care",
    image: "/images/wellness.avif",
    content: [
      "Concierge wellness shifts healthcare from fragmented appointments to coordinated, proactive continuity.",
      "In-home and on-location care improves adherence by removing friction such as waiting rooms and scheduling conflicts.",
      "This model also improves privacy for clients who want high-level care delivered discreetly.",
      "When providers can coordinate across clinical, aesthetic, and recovery goals, outcomes become more measurable.",
      "Clients benefit from stronger protocol consistency and clearer accountability throughout each phase of care.",
      "Over time, this integrated approach supports both performance and quality-of-life improvements.",
    ],
  },
  {
    slug: "clinical-aesthetics-with-natural-balance",
    title: "Clinical Aesthetics with a Natural, Long-Term Strategy",
    excerpt:
      "The best aesthetic outcomes come from protocol design, not one-off procedures. Here is how to build a sustainable approach.",
    publishedAt: "2026-03-28",
    category: "Medical Aesthetics",
    image: "/images/medicalaesthetics.avif",
    content: [
      "Aesthetic care is strongest when planned in phases with clear timelines, realistic goals, and tissue-aware sequencing.",
      "Long-term results depend on preserving skin quality, managing inflammation, and supporting recovery between treatments.",
      "Protocol design should account for lifestyle factors such as sleep, nutrition, hydration, and stress load.",
      "One-off interventions can create temporary changes, but coordinated plans create stability and consistency.",
      "With physician-guided strategy, clients can achieve visible improvements while maintaining a natural look.",
      "The best outcomes happen when beauty goals and overall wellness indicators are managed together.",
    ],
  },
  {
    slug: "beauty-rituals-that-protect-skin-longevity",
    title: "Beauty Rituals That Protect Skin Longevity",
    excerpt:
      "Daily beauty habits that preserve barrier integrity, collagen health, and long-term skin glow without overloading your routine.",
    publishedAt: "2026-03-21",
    category: "Beauty",
    image: "/images/facial-treatments.jpg",
    content: [
      "Healthy skin longevity comes from consistency, not excessive product complexity.",
      "Barrier-first routines help reduce irritation and preserve hydration, tone, and resilience.",
      "Simple daily habits such as gentle cleansing, strategic hydration, and UV protection are foundational.",
      "Adding controlled stimulation and antioxidant support can improve visible vitality without overstripping skin.",
      "When routines are aligned to your physiology and lifestyle, results become more stable and predictable.",
      "A long-term strategy should prioritize skin function first, then aesthetics.",
    ],
  },
  {
    slug: "how-to-combine-recovery-and-aesthetics",
    title: "How to Combine Recovery and Aesthetics for Better Results",
    excerpt:
      "A modern approach to pairing body recovery therapies with beauty treatments for improved resilience and visible outcomes.",
    publishedAt: "2026-03-15",
    category: "Recovery",
    image: "/images/wellness.avif",
    content: [
      "Recovery and aesthetics are most effective when they are programmed together rather than in isolation.",
      "Circulation quality, inflammation load, and tissue health all influence aesthetic treatment response.",
      "Integrating recovery support can reduce downtime and improve comfort during treatment phases.",
      "Sequencing matters: preparation, treatment, and recovery should be structured as one protocol arc.",
      "This approach improves consistency and helps maintain results between sessions.",
      "Over time, clients see stronger outcomes with less volatility and fewer setbacks.",
    ],
  },
  {
    slug: "nutrition-protocols-for-radiant-skin",
    title: "Nutrition Protocols for Radiant Skin and Stable Energy",
    excerpt:
      "How strategic nutrition and supplementation support skin quality, hormonal stability, and performance throughout the week.",
    publishedAt: "2026-03-08",
    category: "Nutrition",
    image: "/images/nutrition.avif",
    content: [
      "Skin quality is strongly influenced by inflammatory load, hydration status, and nutrient sufficiency.",
      "Protein quality and micronutrient consistency are essential for collagen support and tissue repair.",
      "Strategic supplementation can improve resilience when paired with real food, sleep, and stress management.",
      "Nutrition protocols should be dynamic and adapt to training load, hormonal shifts, and recovery demands.",
      "When coordinated with clinical oversight, nutrition becomes a predictable lever for visible results.",
      "Stable energy and skin clarity improve when the plan is practical, repeatable, and personalized.",
    ],
  },
];

async function main() {
  for (const post of posts) {
    const categorySlug = slugify(post.category);
    const category = await prisma.blogCategory.upsert({
      where: { slug: categorySlug },
      update: { name: post.category },
      create: { slug: categorySlug, name: post.category },
    });

    const readTime = estimateReadTime(post.content);

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        status: ContentStatus.PUBLISHED,
        categoryId: category.id,
        readTime,
        featuredImage: post.image,
        publishedAt: new Date(post.publishedAt),
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        status: ContentStatus.PUBLISHED,
        categoryId: category.id,
        readTime,
        featuredImage: post.image,
        publishedAt: new Date(post.publishedAt),
      },
    });
  }

  const count = await prisma.blogPost.count();
  console.log(`Blog sync complete. Total posts in DB: ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
