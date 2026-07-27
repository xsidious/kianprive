import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { formatBookingDateTime } from "@/lib/admin/booking-display";
import { getPortalHomeForRole } from "@/lib/auth-redirect";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/rbac";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminEyebrow,
  adminMuted,
  adminPanel,
  adminStat,
  adminTitle,
  money,
  statusTone,
} from "@/components/admin/ui";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    redirect(session?.user?.role ? getPortalHomeForRole(session.user.role) : "/login");
  }

  const [
    users,
    orderCount,
    pageCount,
    productCount,
    bookingCount,
    bookingRequests,
    postsCount,
    intakeCount,
    pendingIntake,
    recentOrders,
    recentIntake,
    partnerCount,
  ] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { subscription: true },
      take: 8,
    }),
    prisma.order.count(),
    prisma.cmsPage.count(),
    prisma.product.count(),
    prisma.bookingRequest.count(),
    prisma.bookingRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.blogPost.count(),
    prisma.therapeuticsIntakeSubmission.count(),
    prisma.therapeuticsIntakeSubmission.count({
      where: { status: { in: ["PENDING_REVIEW", "UNDER_PHYSICIAN_REVIEW", "NEEDS_FOLLOW_UP"] } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: { take: 2 }, partner: { select: { displayName: true, partnerCode: true, type: true } } },
    }),
    prisma.therapeuticsIntakeSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, fullName: true, email: true, status: true, createdAt: true, programs: true },
    }),
    prisma.partnerProfile.count({ where: { type: { not: "AMBASSADOR" } } }),
  ]);

  let ambassadorCount = 0;
  try {
    ambassadorCount = await prisma.partnerProfile.count({ where: { type: "AMBASSADOR" } });
  } catch {
    ambassadorCount = 0;
  }

  const stats = [
    { label: "Orders", value: orderCount, href: "/admin/orders" },
    { label: "Bookings", value: bookingCount, href: "/admin/bookings" },
    { label: "Clinical intake", value: intakeCount, href: "/admin/intake", note: `${pendingIntake} need review` },
    { label: "Ambassadors", value: ambassadorCount, href: "/admin/ambassadors" },
    { label: "Partners", value: partnerCount, href: "/admin/partners" },
    { label: "Products", value: productCount, href: "/admin/products" },
    { label: "Pages", value: pageCount, href: "/admin/cms" },
    { label: "Blog posts", value: postsCount, href: "/admin/blog" },
  ];

  const shortcuts = [
    { href: "/admin/intake", label: "Clinical Intake", desc: "Review submissions" },
    { href: "/admin/bookings", label: "Bookings", desc: "Confirm & schedule" },
    { href: "/admin/orders", label: "Orders", desc: "Fulfill commerce" },
    { href: "/admin/products", label: "Products", desc: "Catalog & variants" },
    { href: "/admin/ambassadors", label: "Ambassadors", desc: "Codes & QR" },
    { href: "/admin/partners", label: "Partners", desc: "Network & payouts" },
    { href: "/admin/seo", label: "SEO", desc: "Page metadata" },
    { href: "/admin/analytics", label: "Analytics", desc: "Visits & locations" },
    { href: "/admin/users", label: "Users", desc: "Accounts & roles" },
    { href: "/admin/cms", label: "CMS", desc: "Site pages" },
    { href: "/admin/blog", label: "Blog", desc: "Publish content" },
    { href: "/admin/settings", label: "Settings", desc: "Site configuration" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={adminEyebrow}>Operations</p>
          <h1 className={adminTitle}>Dashboard</h1>
          <p className={adminMuted}>Everything in one place — intake, commerce, growth, content, and analytics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/intake" className={adminBtnPrimary}>
            Review intake
          </Link>
          <Link href="/admin/orders" className={adminBtnGhost}>
            Orders
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className={`${adminStat} transition hover:border-[#b78d4b80]`}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">{stat.label}</p>
            <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{stat.value}</p>
            {"note" in stat && stat.note ? <p className="mt-1 text-xs text-[#6f6251]">{stat.note}</p> : null}
          </Link>
        ))}
      </div>

      <section className={`${adminPanel} p-5`}>
        <h2 className="font-serif text-2xl text-[#1f1a15]">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-[#efe4d4] bg-[#fffaf3] px-4 py-3 transition hover:border-[#b78d4b80]"
            >
              <p className="text-sm font-medium text-[#1f1a15]">{item.label}</p>
              <p className="mt-1 text-xs text-[#6f6251]">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className={`${adminPanel} overflow-hidden xl:col-span-1`}>
          <div className="flex items-center justify-between border-b border-[#efe6d8] px-5 py-4">
            <h2 className="font-serif text-xl text-[#1f1a15]">Intake queue</h2>
            <Link href="/admin/intake" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
              Open
            </Link>
          </div>
          <div className="divide-y divide-[#f0e8db]">
            {recentIntake.length === 0 ? (
              <p className="px-5 py-8 text-sm text-[#6f6251]">No intake yet.</p>
            ) : (
              recentIntake.map((item) => (
                <div key={item.id} className="px-5 py-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[#1f1a15]">{item.fullName}</p>
                      <p className="text-xs text-[#6f6251]">{item.email}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(item.status)}`}>
                      {item.status.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className={`${adminPanel} overflow-hidden xl:col-span-1`}>
          <div className="flex items-center justify-between border-b border-[#efe6d8] px-5 py-4">
            <h2 className="font-serif text-xl text-[#1f1a15]">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
              Open
            </Link>
          </div>
          <div className="divide-y divide-[#f0e8db]">
            {recentOrders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-[#6f6251]">No orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="px-5 py-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[#1f1a15]">{order.orderNumber}</p>
                      <p className="text-xs text-[#6f6251]">
                        {(order.items ?? []).map((i) => i.title).join(", ") || order.email || "—"}
                      </p>
                      {order.partner ? (
                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#8f6f3e]">
                          via {order.partner.displayName} ({order.partner.partnerCode})
                        </p>
                      ) : null}
                    </div>
                    <p className="font-medium text-[#1f1a15]">{money(order.total)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className={`${adminPanel} overflow-hidden xl:col-span-1`}>
          <div className="flex items-center justify-between border-b border-[#efe6d8] px-5 py-4">
            <h2 className="font-serif text-xl text-[#1f1a15]">Recent bookings</h2>
            <Link href="/admin/bookings" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
              Open
            </Link>
          </div>
          <div className="divide-y divide-[#f0e8db]">
            {bookingRequests.length === 0 ? (
              <p className="px-5 py-8 text-sm text-[#6f6251]">No bookings yet.</p>
            ) : (
              bookingRequests.map((booking) => (
                <div key={booking.id} className="px-5 py-3 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[#1f1a15]">{booking.fullName}</p>
                      <p className="text-xs text-[#6f6251]">{booking.serviceTitles.join(", ")}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(booking.status)}`}>
                      {booking.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8f6f3e]">
                    {formatBookingDateTime(
                      booking.scheduledStart ?? booking.preferredDate,
                      booking.timezone ?? "America/New_York",
                    )}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className={`${adminPanel} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-[#efe6d8] px-5 py-4">
          <h2 className="font-serif text-xl text-[#1f1a15]">Recent users</h2>
          <Link href="/admin/users" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
            Manage
          </Link>
        </div>
        <div className="divide-y divide-[#f0e8db]">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div>
                <p className="text-[#1f1a15]">{user.name || user.email}</p>
                <p className="text-xs text-[#6f6251]">{user.email}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(user.role)}`}>
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
