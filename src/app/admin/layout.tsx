import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/rbac";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/cms", label: "CMS" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/commerce", label: "Commerce" },
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
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-2xl border border-[#b78d4b30] bg-white p-4">
        <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">ADMIN</p>
        <nav className="mt-3 grid gap-1 text-sm text-[#4f4335]">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 hover:bg-[#fff6e8] hover:text-[#8f6f3e]">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
