export type RetreatEvent = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  when: string;
  image: string;
  flyerImage?: string;
  host?: string;
  ticketUrl?: string;
  ticketPrice?: string;
  featured?: boolean;
  highlights?: string[];
};

export const retreatEvents: RetreatEvent[] = [
  {
    slug: "corporate-health-wellness-day",
    title: "Corporate Health & Wellness Day",
    subtitle: "Sunday, June 7 · 10:00 AM – 5:00 PM EDT · Frida Kahlo Center, Wynwood",
    description:
      "Join us for a full day dedicated to employee well-being, connection, and inspiration in the heart of Wynwood. Presented by Miami Sports & Entertainment Alliance.",
    location: "Frida Kahlo Center · 1018 N Miami Ave, Miami, FL 33136",
    when: "Sunday, June 7, 2026 · 10:00 AM – 5:00 PM EDT",
    image: "/images/corporate-wellness-venue.png",
    flyerImage: "/images/corporate-wellness-flyer.png",
    host: "Miami Sports & Entertainment Alliance",
    ticketUrl: "https://luma.com/corporatewellness",
    ticketPrice: "$150.00",
    featured: true,
    highlights: [
      "Focus: performance, balance, and modern leadership",
      "Expert panels on wellness, corporate well-being, and lifestyle innovation",
      "Health and wellness-focused experiences and classes (including MINDTAP)",
      "Vendor showcases in health, wellness, and performance",
      "Discussion panels on today's top health and wellness topics",
      "Move your body, clear your mind, and connect with others — one day of real connection and lasting wellness",
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
    image: "/images/facial-treatments.jpg",
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
