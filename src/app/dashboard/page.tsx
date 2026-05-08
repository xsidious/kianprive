import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeDollarSign, CalendarCheck2, CircleUserRound, Crown, MessageCircleMore, PackageCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserSubscription } from "@/lib/subscription";
import { buildWhatsAppUrl } from "@/lib/contact";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl text-[#1f1a15]">Welcome back, {session.user.name ?? "Member"}</h1>
      <p className="mt-4 text-[#6f6251]">Role: {session.user.role}</p>
      <p className="text-[#6f6251]">Subscription: {sub?.tier ?? "BASIC"} / {sub?.status ?? "INACTIVE"}</p>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
          <p className="inline-flex items-center gap-2 text-xs tracking-[0.14em] text-[#8f6f3e]"><PackageCheck size={14} /> ORDERS</p>
          <p className="mt-2 text-3xl text-[#1f1a15]">{orders.length}</p>
          <p className="text-xs text-[#6f6251]">{activeOrders} active</p>
        </article>
        <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
          <p className="inline-flex items-center gap-2 text-xs tracking-[0.14em] text-[#8f6f3e]"><CalendarCheck2 size={14} /> BOOKINGS</p>
          <p className="mt-2 text-3xl text-[#1f1a15]">{bookings.length}</p>
          <p className="text-xs text-[#6f6251]">{pendingBookings} pending</p>
        </article>
        <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
          <p className="inline-flex items-center gap-2 text-xs tracking-[0.14em] text-[#8f6f3e]"><Crown size={14} /> MEMBERSHIP</p>
          <p className="mt-2 text-xl text-[#1f1a15]">{sub?.tier ?? "BASIC"}</p>
          <p className="text-xs text-[#6f6251]">{sub?.status ?? "INACTIVE"}</p>
        </article>
        <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
          <p className="inline-flex items-center gap-2 text-xs tracking-[0.14em] text-[#8f6f3e]"><MessageCircleMore size={14} /> CONCIERGE</p>
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-2 inline-flex rounded-full border border-[#25d36680] bg-[#ecfff3] px-3 py-1.5 text-xs text-[#1f7e45]">
            Chat on WhatsApp
          </a>
        </article>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="inline-flex items-center gap-2 rounded-full border border-[#d7b67680] px-5 py-2" href="/dashboard/subscription"><BadgeDollarSign size={16} /> View Subscription</Link>
        <Link className="inline-flex items-center gap-2 rounded-full border border-[#d7b67680] px-5 py-2" href="/dashboard/profile"><CircleUserRound size={16} /> Profile Settings</Link>
        <Link className="inline-flex items-center gap-2 rounded-full border border-[#d7b67680] px-5 py-2" href="/dashboard/services"><CalendarCheck2 size={16} /> My Services</Link>
        <Link className="rounded-full bg-[#d7b676] px-5 py-2 text-black" href="/icoone-training">Go to Icoone Training</Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#b78d4b2d] bg-white p-5">
          <h2 className="text-2xl text-[#1f1a15]">My Orders</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-[#6f6251]">No orders yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <article key={order.id} className="rounded-xl border border-[#b78d4b2d] bg-[#fffaf2] p-3">
                  <p className="text-[#2b2218]">{order.orderNumber}</p>
                  <p className="text-sm text-[#6f6251]">{order.status} · {order.paymentStatus}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#b78d4b2d] bg-white p-5">
          <h2 className="text-2xl text-[#1f1a15]">My Consultations & Services</h2>
          {bookings.length === 0 ? (
            <p className="mt-3 text-sm text-[#6f6251]">No bookings yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {bookings.map((booking) => (
                <article key={booking.id} className="rounded-xl border border-[#b78d4b2d] bg-[#fffaf2] p-3">
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
          <Link href="/dashboard/services" className="mt-4 inline-flex rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-4 py-2 text-sm text-[#3b3024]">
            Open My Services
          </Link>
        </section>
      </div>
    </div>
  );
}
