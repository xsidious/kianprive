import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/rbac";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { adminShell } from "@/components/admin/ui";

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
    <div className={`${adminShell} lg:grid lg:grid-cols-[260px_1fr]`}>
      <aside className="border-b border-[#d9c7a866] bg-white/90 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="border-b border-[#d9c7a866] px-5 py-5">
          <p className="text-[10px] tracking-[0.22em] text-[#8f6f3e]">KIAN PRIVÉ</p>
          <p className="mt-1 font-serif text-2xl text-[#1f1a15]">Admin</p>
          <p className="mt-1 truncate text-xs text-[#6f6251]">{session.user.email}</p>
        </div>
        <div className="px-3 py-2 lg:flex-1 lg:overflow-y-auto">
          <div className="flex gap-1 overflow-x-auto pb-2 lg:hidden">
            {[
              { href: "/admin", label: "Home" },
              { href: "/admin/intake", label: "Intake" },
              { href: "/admin/ambassadors", label: "Ambassadors" },
              { href: "/admin/orders", label: "Orders" },
              { href: "/admin/users", label: "Users" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-sm border border-[#d9c7a866] bg-white px-3 py-1.5 text-xs text-[#4f4335]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden lg:block">
            <AdminSidebarNav />
          </div>
        </div>
        <div className="hidden border-t border-[#d9c7a866] p-4 lg:block">
          <Link href="/" className="block text-center text-xs text-[#6f6251] hover:text-[#8f6f3e]">
            ← Back to site
          </Link>
        </div>
      </aside>
      <section className="min-w-0 p-5 sm:p-6 lg:p-8">{children}</section>
    </div>
  );
}
