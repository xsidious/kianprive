import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileWhere } from "@/lib/network-profile";
import { buildWhatsAppUrl, conciergeEmail } from "@/lib/contact";
import { PartnerSidebarNav } from "@/components/partner/PartnerSidebarNav";
import { PortalSignOut } from "@/components/auth/PortalSignOut";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role === Role.ADMIN) {
    redirect("/admin/partners");
  }

  const partner = await prisma.partnerProfile.findFirst({ where: profileWhere(session.user.id, "partner") });
  if (!partner || partner.status === "SUSPENDED") {
    redirect("/access-required?target=partner");
  }
  const partnerName = partner.displayName;
  const partnerCode = partner.partnerCode;

  const whatsapp = buildWhatsAppUrl(
    `Hi KIAN Privé team — partner support request from ${partnerName}${partnerCode ? ` (${partnerCode})` : ""}.`,
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#fff9f0_0%,#f4ebe0_45%,#ebe1d4_100%)] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-[#e5d7c2]/80 bg-white/75 backdrop-blur-md lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="border-b border-[#e5d7c2]/80 px-5 py-6">
          <p className="text-[10px] tracking-[0.22em] text-[#8f6f3e]">KIAN PRIVÉ</p>
          <p className="mt-1 font-serif text-3xl text-[#1f1a15]">Partner</p>
          <p className="mt-2 truncate text-sm text-[#1f1a15]">{partnerName}</p>
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
              { href: "/partner/intake-link", label: "Clinical intake" },
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

        <div className="space-y-2 border-t border-[#e4d9c8] p-4">
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-sm border border-[#e4d9c8] px-3 py-2 text-center text-[10px] tracking-[0.14em] text-[#8f6f3e] hover:bg-[#fff6e8] lg:block"
          >
            WHATSAPP
          </a>
          <a
            href={`mailto:${conciergeEmail}?subject=${encodeURIComponent(`Partner support — ${partnerName}`)}`}
            className="hidden rounded-sm border border-[#e4d9c8] px-3 py-2 text-center text-[10px] tracking-[0.14em] text-[#8f6f3e] hover:bg-[#fff6e8] lg:block"
          >
            EMAIL CONCIERGE
          </a>
          <Link
            href="/"
            className="hidden rounded-sm border border-[#e4d9c8] bg-[#fffaf3] px-3 py-2.5 text-center text-[10px] tracking-[0.14em] text-[#8f6f3e] hover:bg-[#fff6e8] lg:block"
          >
            ← Public website
          </Link>
          <PortalSignOut className="block w-full rounded-sm border border-[#e4d9c8] bg-white px-3 py-2.5 text-center text-[10px] tracking-[0.14em] text-[#5f5344] hover:bg-[#fff6e8] hover:text-[#8f6f3e]" />
        </div>
      </aside>

      <section className="min-w-0 p-5 sm:p-6 lg:p-8">{children}</section>
    </div>
  );
}
