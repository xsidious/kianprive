import { prisma } from "@/lib/prisma";
import { retreatEvents, type RetreatEvent } from "@/lib/events";

const RETREATS_SETTING_KEY = "retreatEvents";

function parseRetreatEvent(item: Record<string, unknown>): RetreatEvent | null {
  if (
    typeof item.slug !== "string" ||
    typeof item.title !== "string" ||
    typeof item.subtitle !== "string" ||
    typeof item.description !== "string" ||
    typeof item.location !== "string" ||
    typeof item.when !== "string" ||
    typeof item.image !== "string"
  ) {
    return null;
  }

  const event: RetreatEvent = {
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle,
    description: item.description,
    location: item.location,
    when: item.when,
    image: item.image,
  };

  if (typeof item.flyerImage === "string") event.flyerImage = item.flyerImage;
  if (typeof item.flyerPdf === "string") event.flyerPdf = item.flyerPdf;
  if (typeof item.host === "string") event.host = item.host;
  if (typeof item.ticketUrl === "string") event.ticketUrl = item.ticketUrl;
  if (typeof item.ticketPrice === "string") event.ticketPrice = item.ticketPrice;
  if (item.featured === true) event.featured = true;
  if (item.soldOut === true) event.soldOut = true;
  if (Array.isArray(item.highlights)) {
    event.highlights = item.highlights.filter((line): line is string => typeof line === "string");
  }

  return event;
}

function normalizeRetreatEvents(input: unknown): RetreatEvent[] {
  if (!Array.isArray(input)) return retreatEvents;
  const parsed = input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      return parseRetreatEvent(item as Record<string, unknown>);
    })
    .filter((value): value is RetreatEvent => Boolean(value));

  if (parsed.length === 0) return retreatEvents;
  const catalogBySlug = new Map(retreatEvents.map((event) => [event.slug, event]));
  const merged = parsed.map((event) => {
    const catalog = catalogBySlug.get(event.slug);
    if (catalog?.soldOut) return { ...event, soldOut: true };
    return event;
  });
  const storedSlugs = new Set(merged.map((event) => event.slug));
  const missing = retreatEvents.filter((event) => !storedSlugs.has(event.slug));
  return [...missing, ...merged];
}

export async function getRetreatEventsFromStore() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: RETREATS_SETTING_KEY } }).catch(() => null);
  return normalizeRetreatEvents(setting?.value);
}

export async function getRetreatEventFromStoreBySlug(slug: string) {
  const events = await getRetreatEventsFromStore();
  return events.find((event) => event.slug === slug) ?? null;
}
