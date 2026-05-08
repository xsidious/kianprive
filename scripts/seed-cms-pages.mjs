import { PrismaClient, ContentStatus } from "@prisma/client";

const prisma = new PrismaClient();

const cmsPages = [
  {
    slug: "home",
    title: "Home",
    pageType: "marketing",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "CONCIERGE WELLNESS",
      title: "Your Private Pathway to Greatness in Health, Aesthetics, and Performance.",
      description: "Delivering uninterrupted, personalized care at your location or ours.",
    },
  },
  {
    slug: "what-we-do",
    title: "What We Do",
    pageType: "marketing",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "WHAT WE DO",
      title: "Luxury concierge wellness built around outcomes.",
      description: "Medical, aesthetic, and recovery pathways designed for measurable progress.",
    },
  },
  {
    slug: "services",
    title: "Services",
    pageType: "services",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "PRIVÉ SERVICES",
      title: "Luxury Wellness Services Designed Around Your Personal needs & Goals",
      description: "Clinically grounded, hospitality-led, and designed for measurable transformation.",
    },
  },
  {
    slug: "about",
    title: "About",
    pageType: "marketing",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "ABOUT",
      title: "A Physician and Wellness-Led Experience",
      description: "A private concierge model blending medicine, recovery, and beauty.",
    },
  },
  {
    slug: "corporate-wellness",
    title: "Corporate Wellness",
    pageType: "marketing",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "CORPORATE WELLNESS",
      title: "Wellness experiences designed for leadership and teams.",
      description: "High-impact programs for performance, resilience, and culture.",
    },
  },
  {
    slug: "events-retreats",
    title: "Events & Retreats",
    pageType: "events",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "EVENTS & RETREATS",
      title: "Escape to Keeping It All Natural Retreats",
      description: "Personalized journeys of relaxation, rejuvenation, and learning.",
    },
  },
  {
    slug: "shop",
    title: "Shop",
    pageType: "commerce",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "SHOP",
      title: "Curated Wellness and Beauty Essentials",
      description: "Premium products selected to support at-home results.",
    },
  },
  {
    slug: "blog",
    title: "Blog",
    pageType: "content",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "BLOG",
      title: "Insights on beauty, lymphatic health, and longevity.",
      description: "Educational articles from the KIAN team.",
    },
  },
  {
    slug: "contact",
    title: "Contact",
    pageType: "marketing",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "CONTACT",
      title: "Request Your Private Concierge Experience",
      description: "Tell us your goals and our team will build your plan.",
    },
  },
  {
    slug: "book-online",
    title: "Book Online",
    pageType: "booking",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "BOOK ONLINE",
      title: "Book Concierge Consultation",
      description: "Start with a guided onboarding consultation.",
    },
  },
  {
    slug: "login",
    title: "Login",
    pageType: "auth",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "MEMBERS PORTAL",
      title: "Welcome Back",
      description: "Secure member login for concierge access.",
    },
  },
  {
    slug: "signup",
    title: "Signup",
    pageType: "auth",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "CREATE ACCOUNT",
      title: "Join KIAN Privé",
      description: "Create your account to access member services.",
    },
  },
  {
    slug: "practitioners",
    title: "Practitioners",
    pageType: "member-only",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "PRACTITIONERS",
      title: "Professional access and resources.",
      description: "Advanced protocols and clinical pathways for practitioners.",
    },
  },
  {
    slug: "athletes",
    title: "Athletes",
    pageType: "member-only",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "ATHLETES",
      title: "Performance and recovery access.",
      description: "Elite support protocols for training and recovery.",
    },
  },
  {
    slug: "icoone-training",
    title: "Icoone Training",
    pageType: "services",
    status: ContentStatus.PUBLISHED,
    body: {
      eyebrow: "ICOONE",
      title: "Icoone Program Overview",
      description: "Explore treatment pathways, training, and member access.",
    },
  },
];

async function main() {
  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      create: page,
      update: {
        title: page.title,
        pageType: page.pageType,
        status: page.status,
        body: page.body,
      },
    });
  }

  const count = await prisma.cmsPage.count();
  console.log(`CMS pages seeded. Total pages: ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
