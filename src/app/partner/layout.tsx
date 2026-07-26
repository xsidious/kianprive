import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { canAccessPartnerPortal } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, conciergeEmail } from "@/lib/contact";
import { PartnerSidebarNav } from "@/components/partner/PartnerSidebarNav";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || !canAccessPartnerPortal(session.user.role)) {
    redirect("/login");
  }

  if (session.user.role === Role.ADMIN) {
    redirect("/admin/partners");
  }

  let partnerName = "Partner";
  let partnerCode = "";
  if (session.user.role === Role.PARTNER) {
    const partner = await prisma.partnerProfile.findUnique({ where: { userId: session.user.id } });
    if (!partner || partner.status === "SUSPENDED") {
      redirect("/access-required?target=partner");
    }
    partnerName = partner.displayName;
    partnerCode = partner.partnerCode;
  }

  const whatsapp = buildWhatsAppUrl(
    `Hi KIAN Privé team — partner support request from ${partnerName}${partnerCode ? ` (${partnerCode})` : ""}.`,
  );

  return (
    <div className="min-h-screen bg-[#fffdf9] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[#e4d9c8] bg-[#fffcf7] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="border-b border-[#e4d9c8] px-5 py-5">
          <p className="text-[10px] tracking-[0.22em] text-[#b78d4b]">PARTNER PORTAL</p>
          <p className="mt-2 truncate font-serif text-xl text-[#1f1a15]">{partnerName}</p>
          {partnerCode ? (
            <p className="mt-1 text-[11px] tracking-[0.12em] text-[#8f6f3e]">CODE {partnerCode}</p>
          ) : null}
        </div>

        <div className="px-3 py-2 lg:flex-1 lg:overflow-y-auto lg:px-3 lg:py-1">
          <div className="flex gap-1 overflow-x-auto pb-2 lg:hidden">
            {[
              { href: "/partner", label: "Home" },
              { href: "/partner/bookings", label: "Bookings" },
              { href: "/partner/guidelines", label: "Guidelines" },
              { href: "/partner/earnings", label: "Earnings" },
              { href: "/partner/profile", label: "Profile" },
              { href: "/partner/support", label: "Support" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-sm border border-[#e4d9c8] bg-white px-3 py-1.5 text-xs text-[#4f4335]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden lg:block">
            <PartnerSidebarNav />
          </div>
        </div>

        <div className="hidden space-y-2 border-t border-[#e4d9c8] p-4 lg:block">
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="block rounded-sm border border-[#e4d9c8] px-3 py-2 text-center text-[10px] tracking-[0.14em] text-[#8f6f3e] hover:bg-[#fff6e8]"
          >
            WHATSAPP
          </a>
          <a
            href={`mailto:${conciergeEmail}?subject=${encodeURIComponent(`Partner support — ${partnerName}`)}`}
            className="block rounded-sm border border-[#e4d9c8] px-3 py-2 text-center text-[10px] tracking-[0.14em] text-[#8f6f3e] hover:bg-[#fff6e8]"
          >
            EMAIL CONCIERGE
          </a>
          <Link
            href="/"
            className="block px-3 py-1 text-center text-xs text-[#6f6251] hover:text-[#8f6f3e]"
          >
            ← Public site
          </Link>
        </div>
      </aside>

      <section className="min-w-0 p-5 sm:p-6 lg:p-8">{children}</section>
    </div>
  );
}
