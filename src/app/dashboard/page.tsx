import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserSubscription } from "@/lib/subscription";

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
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl text-[#1f1a15]">Welcome back, {session.user.name ?? "Member"}</h1>
      <p className="mt-4 text-[#6f6251]">Role: {session.user.role}</p>
      <p className="text-[#6f6251]">Subscription: {sub?.tier ?? "BASIC"} / {sub?.status ?? "INACTIVE"}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="rounded-full border border-[#d7b67680] px-5 py-2" href="/dashboard/subscription">View Subscription</Link>
        <Link className="rounded-full border border-[#d7b67680] px-5 py-2" href="/dashboard/profile">Profile Settings</Link>
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
                  <p className="text-sm text-[#6f6251]">
                    {booking.preferredDate.toISOString().slice(0, 10)} · {booking.status}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
