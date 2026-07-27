import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPortalHomeForRole } from "@/lib/auth-redirect";
import { canAccessAdmin } from "@/lib/rbac";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { PortalSignOut } from "@/components/auth/PortalSignOut";
import { adminShell } from "@/components/admin/ui";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    redirect(session?.user?.role ? getPortalHomeForRole(session.user.role) : "/login");
  }

  return (
    <div className={`${adminShell} lg:grid lg:grid-cols-[272px_1fr]`}>
      <aside className="border-b border-[#e5d7c2]/80 bg-white/80 backdrop-blur-md lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="border-b border-[#e5d7c2]/80 px-5 py-6">
          <p className="text-[10px] tracking-[0.22em] text-[#8f6f3e]">KIAN PRIVÉ</p>
          <p className="mt-1 font-serif text-3xl text-[#1f1a15]">Admin</p>
          <p className="mt-1 truncate text-xs text-[#6f6251]">{session.user.email}</p>
        </div>
        <div className="px-3 py-3 lg:flex-1 lg:overflow-y-auto">
          <div className="flex gap-1.5 overflow-x-auto pb-2 lg:hidden">
            {[
              { href: "/admin", label: "Home" },
              { href: "/admin/intake", label: "Intake" },
              { href: "/admin/products", label: "Products" },
              { href: "/admin/orders", label: "Orders" },
              { href: "/admin/ambassadors", label: "Ambassadors" },
              { href: "/admin/providers", label: "Providers" },
              { href: "/admin/seo", label: "SEO" },
              { href: "/admin/analytics", label: "Analytics" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-full border border-[#e5d7c2] bg-white px-3 py-1.5 text-xs text-[#4f4335]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden lg:block">
            <AdminSidebarNav />
          </div>
        </div>
        <div className="space-y-2 border-t border-[#e5d7c2]/80 p-4">
          <Link
            href="/"
            className="hidden rounded-full border border-[#e5d7c2] bg-[#fffaf3] px-3 py-2.5 text-center text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e] hover:bg-[#fff6e8] lg:block"
          >
            ← Public website
          </Link>
          <PortalSignOut />
        </div>
      </aside>
      <section className="min-w-0 p-5 sm:p-7 lg:p-10">{children}</section>
    </div>
  );
}
