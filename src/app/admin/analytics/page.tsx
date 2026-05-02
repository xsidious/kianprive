import { prisma } from "@/lib/prisma";

export default async function AdminAnalyticsPage() {
  const [eventsTotal, topEvents, topPages] = await Promise.all([
    prisma.analyticsEvent.count(),
    prisma.analyticsEvent.groupBy({
      by: ["eventName"],
      _count: true,
      orderBy: { _count: { eventName: "desc" } },
      take: 10,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["pagePath"],
      _count: true,
      where: { pagePath: { not: null } },
      orderBy: { _count: { pagePath: "desc" } },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl text-[#1f1a15]">Analytics Dashboard</h1>
      <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
        <p className="text-xs tracking-[0.16em] text-[#8f6f3e]">TOTAL EVENTS</p>
        <p className="mt-1 text-3xl text-[#1f1a15]">{eventsTotal}</p>
      </article>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
          <h2 className="text-xl text-[#1f1a15]">Top Events</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {topEvents.map((event) => (
              <li key={event.eventName} className="flex items-center justify-between">
                <span>{event.eventName}</span>
                <span className="text-[#8f6f3e]">{event._count}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
          <h2 className="text-xl text-[#1f1a15]">Top Pages</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {topPages.map((page) => (
              <li key={page.pagePath ?? "unknown"} className="flex items-center justify-between">
                <span>{page.pagePath ?? "unknown"}</span>
                <span className="text-[#8f6f3e]">{page._count}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
