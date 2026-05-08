import { prisma } from "@/lib/prisma";
import { retreatEvents, type RetreatEvent } from "@/lib/events";

const RETREATS_SETTING_KEY = "retreatEvents";

function normalizeRetreatEvents(input: unknown): RetreatEvent[] {
  if (!Array.isArray(input)) return retreatEvents;
  const parsed = input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      if (
        typeof obj.slug !== "string" ||
        typeof obj.title !== "string" ||
        typeof obj.subtitle !== "string" ||
        typeof obj.description !== "string" ||
        typeof obj.location !== "string" ||
        typeof obj.when !== "string" ||
        typeof obj.image !== "string"
      ) {
        return null;
      }
      return {
        slug: obj.slug,
        title: obj.title,
        subtitle: obj.subtitle,
        description: obj.description,
        location: obj.location,
        when: obj.when,
        image: obj.image,
      } satisfies RetreatEvent;
    })
    .filter((value): value is RetreatEvent => Boolean(value));

  return parsed.length > 0 ? parsed : retreatEvents;
}

export async function getRetreatEventsFromStore() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: RETREATS_SETTING_KEY } }).catch(() => null);
  return normalizeRetreatEvents(setting?.value);
}

export async function getRetreatEventFromStoreBySlug(slug: string) {
  const events = await getRetreatEventsFromStore();
  return events.find((event) => event.slug === slug) ?? null;
}
