import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { formatBookingDateTime } from "@/lib/admin/booking-display";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/rbac";
import { adminBtnGhost, adminEyebrow, adminMuted, adminPanel, adminStat, adminTitle, statusTone } from "@/components/admin/ui";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) redirect("/dashboard");

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
      take: 8,
    }),
    prisma.blogPost.count(),
    prisma.therapeuticsIntakeSubmission.count(),
    prisma.therapeuticsIntakeSubmission.count({
      where: { status: { in: ["PENDING_REVIEW", "UNDER_PHYSICIAN_REVIEW", "NEEDS_FOLLOW_UP"] } },
    }),
  ]);

  // Soft-fail until production DB has Role/PartnerType AMBASSADOR enum values.
  let ambassadorCount = 0;
  try {
    ambassadorCount = await prisma.partnerProfile.count({ where: { type: "AMBASSADOR" } });
  } catch (error) {
    console.error("[admin] Ambassador count unavailable (run AMBASSADOR enum migration):", error);
  }

  const stats = [
    { label: "Orders", value: orderCount, href: "/admin/orders" },
    { label: "Bookings", value: bookingCount, href: "/admin/bookings" },
    { label: "Clinical intake", value: intakeCount, href: "/admin/intake", note: `${pendingIntake} need review` },
    { label: "Ambassadors", value: ambassadorCount, href: "/admin/ambassadors" },
    { label: "Products", value: productCount, href: "/admin/products" },
    { label: "Pages", value: pageCount, href: "/admin/cms" },
    { label: "Blog posts", value: postsCount, href: "/admin/blog" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={adminEyebrow}>Operations</p>
          <h1 className={adminTitle}>Dashboard</h1>
          <p className={adminMuted}>Clinical intake, commerce, partners, and ambassadors in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/intake" className={adminBtnGhost}>
            Review intake
          </Link>
          <Link href="/admin/ambassadors" className={adminBtnGhost}>
            Ambassadors
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

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={`${adminPanel} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-[#efe6d8] px-5 py-4">
            <h2 className="font-serif text-xl text-[#1f1a15]">Recent users</h2>
            <Link href="/admin/users" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
              View all
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

        <section className={`${adminPanel} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-[#efe6d8] px-5 py-4">
            <h2 className="font-serif text-xl text-[#1f1a15]">Recent bookings</h2>
            <Link href="/admin/bookings" className="text-xs uppercase tracking-[0.14em] text-[#8f6f3e]">
              View all
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
    </div>
  );
}
