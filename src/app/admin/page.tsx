import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/rbac";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) redirect("/dashboard");

  const [users, orderCount, pageCount, productCount, bookingCount, bookingRequests, postsCount] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { subscription: true },
      take: 20,
    }),
    prisma.order.count(),
    prisma.cmsPage.count(),
    prisma.product.count(),
    prisma.bookingRequest.count(),
    prisma.bookingRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.blogPost.count(),
  ]);

  return (
    <div>
      <h1 className="text-3xl text-[#1f1a15] md:text-4xl">Admin Panel</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
          <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">ORDERS</p>
          <p className="mt-1 text-2xl text-[#1f1a15]">{orderCount}</p>
        </article>
        <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
          <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">PAGES</p>
          <p className="mt-1 text-2xl text-[#1f1a15]">{pageCount}</p>
        </article>
        <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
          <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">PRODUCTS</p>
          <p className="mt-1 text-2xl text-[#1f1a15]">{productCount}</p>
        </article>
        <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
          <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">BOOKINGS</p>
          <p className="mt-1 text-2xl text-[#1f1a15]">{bookingCount}</p>
        </article>
        <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
          <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">BLOG POSTS</p>
          <p className="mt-1 text-2xl text-[#1f1a15]">{postsCount}</p>
        </article>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/admin/users" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">Manage Users</Link>
        <Link href="/admin/bookings" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">Manage Bookings</Link>
        <Link href="/admin/blog" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">Manage Blog</Link>
        <Link href="/admin/commerce" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">Manage Commerce</Link>
        <Link href="/admin/cms" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">Manage CMS</Link>
        <Link href="/admin/retreats" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">Manage Retreats</Link>
      </div>
      <div className="mt-8 overflow-hidden rounded-2xl border border-[#d7b67666]">
        <table className="w-full text-left text-sm text-[#3b3024]">
          <thead className="bg-[#fff6e8]">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Plan</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[#d7b67633]">
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.subscription?.tier ?? "BASIC"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#d7b67666]">
        <table className="w-full text-left text-sm text-[#3b3024]">
          <thead className="bg-[#fff6e8]">
            <tr>
              <th className="p-3">Client</th>
              <th className="p-3">Services</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookingRequests.map((booking) => (
              <tr key={booking.id} className="border-t border-[#d7b67633]">
                <td className="p-3">
                  <p>{booking.fullName}</p>
                  <p className="text-xs text-[#6f6251]">{booking.email}</p>
                </td>
                <td className="p-3">{booking.serviceTitles.join(", ")}</td>
                <td className="p-3">{booking.preferredDate.toISOString().slice(0, 10)}</td>
                <td className="p-3">{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
