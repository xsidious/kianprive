import { prisma } from "@/lib/prisma";
import { adminEyebrow, adminMuted, adminPanel, adminTitle } from "@/components/admin/ui";

function Bar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#efe4d4]">
      <div className="h-full rounded-full bg-[linear-gradient(90deg,#b78d4b,#8a682e)]" style={{ width: `${width}%` }} />
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [eventsTotal, recentViews, topEvents, topPages, topCountries, topCities, recent] = await Promise.all([
    prisma.analyticsEvent.count(),
    prisma.analyticsEvent.count({ where: { eventName: "page_view", occurredAt: { gte: since } } }),
    prisma.analyticsEvent.groupBy({
      by: ["eventName"],
      _count: true,
      orderBy: { _count: { eventName: "desc" } },
      take: 8,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["pagePath"],
      _count: true,
      where: { pagePath: { not: null }, occurredAt: { gte: since } },
      orderBy: { _count: { pagePath: "desc" } },
      take: 10,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["country"],
      _count: true,
      where: { country: { not: null }, occurredAt: { gte: since } },
      orderBy: { _count: { country: "desc" } },
      take: 10,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["city"],
      _count: true,
      where: { city: { not: null }, occurredAt: { gte: since } },
      orderBy: { _count: { city: "desc" } },
      take: 10,
    }),
    prisma.analyticsEvent.findMany({
      orderBy: { occurredAt: "desc" },
      take: 18,
      select: {
        id: true,
        eventName: true,
        pagePath: true,
        country: true,
        city: true,
        referrer: true,
        occurredAt: true,
      },
    }),
  ]);

  const maxPage = Math.max(...topPages.map((p) => p._count), 1);
  const maxCountry = Math.max(...topCountries.map((p) => p._count), 1);

  return (
    <div className="space-y-8">
      <div>
        <p className={adminEyebrow}>Live traffic</p>
        <h1 className={adminTitle}>Analytics</h1>
        <p className={adminMuted}>
          First-party visit tracking with location from Vercel edge headers when available. Enable Web Analytics in the
          Vercel project for the official Vercel dashboard charts as well.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">All events</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{eventsTotal}</p>
        </div>
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Page views · 30 days</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{recentViews}</p>
        </div>
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Countries seen</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{topCountries.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={`${adminPanel} p-5`}>
          <h2 className="font-serif text-2xl text-[#1f1a15]">Top pages</h2>
          <ul className="mt-4 space-y-4">
            {topPages.map((page) => (
              <li key={page.pagePath ?? "unknown"}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-[#2b2218]">{page.pagePath ?? "unknown"}</span>
                  <span className="text-[#8f6f3e]">{page._count}</span>
                </div>
                <Bar value={page._count} max={maxPage} />
              </li>
            ))}
            {!topPages.length ? <li className="text-sm text-[#6f6251]">No page views yet.</li> : null}
          </ul>
        </section>

        <section className={`${adminPanel} p-5`}>
          <h2 className="font-serif text-2xl text-[#1f1a15]">Locations</h2>
          <ul className="mt-4 space-y-4">
            {topCountries.map((row) => (
              <li key={row.country ?? "unknown"}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#2b2218]">{row.country ?? "Unknown"}</span>
                  <span className="text-[#8f6f3e]">{row._count}</span>
                </div>
                <Bar value={row._count} max={maxCountry} />
              </li>
            ))}
            {!topCountries.length ? (
              <li className="text-sm text-[#6f6251]">
                Location appears after visitors hit the live Vercel deployment (uses `x-vercel-ip-country`).
              </li>
            ) : null}
          </ul>
          {topCities.length ? (
            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Top cities</p>
              <ul className="mt-2 space-y-2 text-sm">
                {topCities.map((city) => (
                  <li key={city.city ?? "unknown"} className="flex justify-between">
                    <span>{city.city}</span>
                    <span className="text-[#8f6f3e]">{city._count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={`${adminPanel} p-5`}>
          <h2 className="font-serif text-2xl text-[#1f1a15]">Top events</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {topEvents.map((event) => (
              <li key={event.eventName} className="flex items-center justify-between rounded-xl bg-[#fffaf3] px-3 py-2">
                <span>{event.eventName}</span>
                <span className="text-[#8f6f3e]">{event._count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${adminPanel} p-5`}>
          <h2 className="font-serif text-2xl text-[#1f1a15]">Recent activity</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {recent.map((event) => (
              <li key={event.id} className="border-b border-[#efe4d4] pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[#1f1a15]">{event.pagePath ?? event.eventName}</p>
                  <p className="text-xs text-[#8f6f3e]">{new Date(event.occurredAt).toLocaleString()}</p>
                </div>
                <p className="mt-1 text-xs text-[#6f6251]">
                  {[event.city, event.country].filter(Boolean).join(", ") || "Location pending"}
                  {event.referrer ? ` · from ${event.referrer}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
