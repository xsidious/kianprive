import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PageContentFallback = {
  title: string;
  description: string;
  eyebrow?: string;
};

const fallbackMap: Record<string, PageContentFallback> = {
  home: {
    eyebrow: "CONCIERGE WELLNESS",
    title: "Your Private Pathway to Greatness in Health, Aesthetics, and Performance.",
    description: "Delivering uninterrupted, personalized care at your location or ours.",
  },
  services: {
    eyebrow: "PRIVÉ SERVICES",
    title: "Luxury Wellness Services Designed Around Your Personal needs & Goals",
    description: "Clinically grounded, hospitality-led, and designed for measurable transformation.",
  },
  about: {
    eyebrow: "ABOUT",
    title: "A Physician and Wellness-Led Experience",
    description: "A private concierge model blending medicine, recovery, and beauty.",
  },
  "events-retreats": {
    eyebrow: "EVENTS & RETREATS",
    title: "Escape to Keeping It All Natural Retreats",
    description: "Personalized journeys of relaxation, rejuvenation, and learning.",
  },
};

export async function getCmsPageContent(slug: string): Promise<PageContentFallback> {
  const fallback = fallbackMap[slug] ?? {
    title: "KIAN Privé",
    description: "Premium concierge wellness",
  };

  const page = await prisma.cmsPage
    .findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
    })
    .catch(() => null);

  if (!page) return fallback;

  const body = (page.body ?? {}) as Record<string, unknown>;
  return {
    eyebrow: typeof body.eyebrow === "string" ? body.eyebrow : fallback.eyebrow,
    title: typeof body.title === "string" ? body.title : page.title ?? fallback.title,
    description: typeof body.description === "string" ? body.description : fallback.description,
  };
}
