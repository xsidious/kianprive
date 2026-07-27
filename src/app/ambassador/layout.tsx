import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { canAccessAmbassadorPortal } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const links = [
  { href: "/ambassador", label: "Overview" },
  { href: "/ambassador/links", label: "Links & QR" },
  { href: "/ambassador/sales", label: "Sales" },
  { href: "/ambassador/earnings", label: "Earnings" },
];

export default async function AmbassadorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || !canAccessAmbassadorPortal(session.user.role)) {
    redirect("/login");
  }

  if (session.user.role === Role.ADMIN) {
    redirect("/admin/ambassadors");
  }

  const partner = await prisma.partnerProfile.findUnique({ where: { userId: session.user.id } });
  if (!partner || partner.type !== "AMBASSADOR" || partner.status === "SUSPENDED") {
    redirect("/access-required?target=ambassador");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f2e8_0%,#f3ebe0_50%,#efe6d8_100%)] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[#d9c7a866] bg-white/90 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="border-b border-[#d9c7a866] px-5 py-5">
          <p className="text-[10px] tracking-[0.22em] text-[#8f6f3e]">AMBASSADOR PORTAL</p>
          <p className="mt-2 truncate font-serif text-xl text-[#1f1a15]">{partner.displayName}</p>
          <p className="mt-1 text-[11px] tracking-[0.12em] text-[#8f6f3e]">CODE {partner.partnerCode}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:block lg:flex-1 lg:space-y-1 lg:overflow-y-auto lg:px-3 lg:py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fff6e8] hover:text-[#8f6f3e] lg:block"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-[#d9c7a866] p-4 lg:block">
          <Link href="/" className="block text-center text-xs text-[#6f6251] hover:text-[#8f6f3e]">
            ← Public site
          </Link>
        </div>
      </aside>
      <section className="min-w-0 p-5 sm:p-6 lg:p-8">{children}</section>
    </div>
  );
}
