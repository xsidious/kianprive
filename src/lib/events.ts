export type RetreatEvent = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  when: string;
  image: string;
  flyerImage?: string;
  flyerPdf?: string;
  host?: string;
  ticketUrl?: string;
  ticketPrice?: string;
  featured?: boolean;
  soldOut?: boolean;
  highlights?: string[];
};

export const retreatEvents: RetreatEvent[] = [
  {
    slug: "kian-prive-seoul",
    title: "KIAN Privé Seoul",
    subtitle: "November 13–27, 2027 · Seoul, South Korea",
    description:
      "A luxury wellness escape in Seoul with physician-supervised programs, K-beauty treatments, and bespoke packages. Supervised by KIAN Physician Dr. Carmen Ramirez.",
    location: "Seoul, South Korea",
    when: "November 13–27, 2027",
    image: "/images/kian-prive-seoul-flyer.jpg",
    flyerImage: "/images/kian-prive-seoul-flyer.jpg",
    soldOut: true,
    highlights: [
      "5-, 7-, and 10-day escapes",
      "Premium bespoke packages starting at $4,999",
      "Physician-supervised programs and continued aftercare",
    ],
  },
  {
    slug: "corporate-health-wellness-day",
    title: "Corporate Health & Wellness Day — Coming Soon",
    subtitle: "New date and location will be announced soon",
    description:
      "Our next corporate wellness event is in development. Join the list for first access to the new date, venue, and event details.",
    location: "Location to be announced",
    when: "Coming soon",
    image: "/images/corporate-wellness-venue.png",
    flyerImage: "/images/corporate-wellness-flyer.png",
    featured: true,
    highlights: [
      "Corporate wellness programming for leadership teams and organizations",
      "Performance, recovery, and resilience-focused experiences",
      "Expert-led education and interactive wellness activations",
      "Date, venue, and full agenda coming soon",
    ],
  },
  {
    slug: "kian-beauty-wellness-getaway",
    title: "KIAN Beauty & Wellness Getaway",
    subtitle: "Book your Getaway! Serena Hilton Tapestry Collection",
    description:
      "A signature beauty-forward retreat focused on skin radiance, lymphatic flow, stress release, and elevated recovery rituals curated by the KIAN team.",
    location: "Serena Hilton Tapestry Collection",
    when: "Upcoming launch date",
    image: "/images/beauty.avif",
  },
  {
    slug: "elevate-your-event-wellness-experience",
    title: "Elevate Your Event: KIAN Hosts Your Dream Wellness Experience",
    subtitle: "Date and time is TBD by you! Location is TBD by you!",
    description:
      "Private turnkey wellness event production for hosts, founders, and brands that want a luxury beauty and wellness experience designed around their audience.",
    location: "Custom location",
    when: "Scheduled on demand",
    image: "/images/facial-treatments.webp",
  },
  {
    slug: "love-yourself-first-beauty-spa-morning",
    title: "Love Yourself First: A Beauty & Spa Morning Celebration",
    subtitle: "Date and time is TBD — 2820 NE 214th Street, Aventura, FL 33180",
    description:
      "A restorative morning format blending skin rituals, education, and self-care protocols in a calm and elegant environment for lasting beauty outcomes.",
    location: "2820 NE 214th Street, Aventura, FL 33180",
    when: "Upcoming launch date",
    image: "/images/esthetics.avif",
  },
];

export function getRetreatEventBySlug(slug: string) {
  return retreatEvents.find((event) => event.slug === slug) ?? null;
}

export function getFeaturedRetreatEvent() {
  return retreatEvents.find((event) => event.featured) ?? retreatEvents[0];
}
