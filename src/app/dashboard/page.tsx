import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeDollarSign, CalendarCheck2, CircleUserRound, Crown, MessageCircleMore, PackageCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { getPortalHomeForRole } from "@/lib/auth-redirect";
import { prisma } from "@/lib/prisma";
import { getUserSubscription } from "@/lib/subscription";
import { buildWhatsAppUrl } from "@/lib/contact";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const roleHome = getPortalHomeForRole(session.user.role);
  if (roleHome !== "/dashboard") {
    redirect(roleHome);
  }
  const [sub, orders, bookings] = await Promise.all([
    getUserSubscription(session.user.id),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.bookingRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING").length;
  const activeOrders = orders.filter((order) => order.status !== "DELIVERED" && order.status !== "CANCELED").length;
  const whatsappHref = buildWhatsAppUrl(
    `Hi KIAN Privé team, I need support with my member dashboard account (${session.user.email ?? "member"}).`,
  );

  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <EditorialEyebrow>MEMBER DASHBOARD</EditorialEyebrow>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-[#1f1a15]">Welcome back, {session.user.name ?? "Member"}</h1>
            <p className="mt-3 text-[#6f6251]">Role: {session.user.role}</p>
            <p className="text-[#6f6251]">
              Subscription: {sub?.tier ?? "BASIC"} / {sub?.status ?? "INACTIVE"}
            </p>
          </div>
          <Link href="/" className={editorialCtaSecondary}>
            Public website
          </Link>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-4">
          <article className={`${editorialPanel} p-4`}>
            <p className="inline-flex items-center gap-2 text-xs tracking-[0.14em] text-[#8f6f3e]">
              <PackageCheck size={14} /> ORDERS
            </p>
            <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{orders.length}</p>
            <p className="text-xs text-[#6f6251]">{activeOrders} active</p>
          </article>
          <article className={`${editorialPanel} p-4`}>
            <p className="inline-flex items-center gap-2 text-xs tracking-[0.14em] text-[#8f6f3e]">
              <CalendarCheck2 size={14} /> BOOKINGS
            </p>
            <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{bookings.length}</p>
            <p className="text-xs text-[#6f6251]">{pendingBookings} pending</p>
          </article>
          <article className={`${editorialPanel} p-4`}>
            <p className="inline-flex items-center gap-2 text-xs tracking-[0.14em] text-[#8f6f3e]">
              <Crown size={14} /> MEMBERSHIP
            </p>
            <p className="mt-2 font-serif text-xl text-[#1f1a15]">{sub?.tier ?? "BASIC"}</p>
            <p className="text-xs text-[#6f6251]">{sub?.status ?? "INACTIVE"}</p>
          </article>
          <article className={`${editorialPanel} p-4`}>
            <p className="inline-flex items-center gap-2 text-xs tracking-[0.14em] text-[#8f6f3e]">
              <MessageCircleMore size={14} /> CONCIERGE
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-sm border border-[#25d36680] bg-[#ecfff3] px-3 py-1.5 text-xs tracking-[0.12em] text-[#1f7e45]"
            >
              CHAT ON WHATSAPP
            </a>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link className={`inline-flex items-center gap-2 ${editorialCtaSecondary}`} href="/dashboard/subscription">
            <BadgeDollarSign size={16} /> VIEW SUBSCRIPTION
          </Link>
          <Link className={`inline-flex items-center gap-2 ${editorialCtaSecondary}`} href="/dashboard/profile">
            <CircleUserRound size={16} /> PROFILE SETTINGS
          </Link>
          <Link className={`inline-flex items-center gap-2 ${editorialCtaSecondary}`} href="/dashboard/services">
            <CalendarCheck2 size={16} /> MY SERVICES
          </Link>
          <Link className={editorialCtaPrimary} href="/icoone-training">
            GO TO ICOONE TRAINING
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className={`${editorialPanel} p-5`}>
            <h2 className="font-serif text-2xl text-[#1f1a15]">My Orders</h2>
            {orders.length === 0 ? (
              <p className="mt-3 text-sm text-[#6f6251]">No orders yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {orders.map((order) => (
                  <article key={order.id} className={`${editorialPanel} p-3`}>
                    <p className="text-[#2b2218]">{order.orderNumber}</p>
                    <p className="text-sm text-[#6f6251]">
                      {order.status} · {order.paymentStatus}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className={`${editorialPanel} p-5`}>
            <h2 className="font-serif text-2xl text-[#1f1a15]">My Consultations &amp; Services</h2>
            {bookings.length === 0 ? (
              <p className="mt-3 text-sm text-[#6f6251]">No bookings yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {bookings.map((booking) => (
                  <article key={booking.id} className={`${editorialPanel} p-3`}>
                    <p className="text-[#2b2218]">{booking.serviceTitles.join(", ")}</p>
                    <p className="text-xs text-[#8f6f3e]">Location: {booking.preferredLocation}</p>
                    <p className="text-sm text-[#6f6251]">
                      {booking.preferredDate.toISOString().slice(0, 10)} · {booking.status}
                    </p>
                    {booking.notes ? <p className="mt-1 text-xs text-[#6f6251]">{booking.notes}</p> : null}
                  </article>
                ))}
              </div>
            )}
            <Link href="/dashboard/services" className={`mt-4 ${editorialCtaSecondary}`}>
              OPEN MY SERVICES
            </Link>
          </section>
        </div>
      </EditorialSection>
    </div>
  );
}
