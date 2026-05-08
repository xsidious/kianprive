import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/rbac";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/communications", label: "Communications" },
  { href: "/admin/cms", label: "CMS" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/retreats", label: "Retreats" },
  { href: "/admin/commerce", label: "Commerce" },
  { href: "/admin/operations", label: "Operations" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="grid min-h-screen gap-0 bg-[#f5efe4] md:grid-cols-[250px_1fr]">
      <aside className="border-r border-[#b78d4b30] bg-white/95 p-5">
        <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">ADMIN DASHBOARD</p>
        <nav className="mt-3 grid gap-1 text-sm text-[#4f4335]">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 hover:bg-[#fff6e8] hover:text-[#8f6f3e]">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="p-6 md:p-8">{children}</section>
    </div>
  );
}
