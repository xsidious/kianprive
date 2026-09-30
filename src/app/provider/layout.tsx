import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { canAccessProviderPortal } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PortalSignOut } from "@/components/auth/PortalSignOut";
import { PortalNavList } from "@/components/portal/PortalNav";

const links = [
  { href: "/provider", label: "Overview" },
  { href: "/provider/patients", label: "Patients" },
  { href: "/provider/intake", label: "Intake" },
  { href: "/provider/therapeutics", label: "Therapeutics" },
  { href: "/provider/bookings", label: "Consultations" },
  { href: "/provider/earnings", label: "Earnings" },
  { href: "/provider/services", label: "Services" },
  { href: "/provider/links", label: "Links & QR" },
];

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || !canAccessProviderPortal(session.user.role)) {
    redirect("/login");
  }

  if (session.user.role === Role.ADMIN) {
    redirect("/admin/providers");
  }

  const partner = await prisma.partnerProfile.findUnique({ where: { userId: session.user.id } });
  if (!partner || partner.type !== "PROVIDER" || partner.status === "SUSPENDED") {
    redirect("/access-required?target=provider");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#fff9f0_0%,#f4ebe0_45%,#ebe1d4_100%)] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-[#e5d7c2]/80 bg-white/75 backdrop-blur-md lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="border-b border-[#e5d7c2]/80 px-5 py-6">
          <p className="text-[10px] tracking-[0.22em] text-[#8f6f3e]">KIAN PRIVÉ</p>
          <p className="mt-1 font-serif text-3xl text-[#1f1a15]">Practitioner</p>
          <p className="mt-2 truncate text-sm text-[#1f1a15]">{partner.displayName}</p>
          <p className="mt-1 text-[11px] tracking-[0.12em] text-[#8f6f3e]">CODE {partner.partnerCode}</p>
          {partner.specialty ? <p className="mt-1 text-xs text-[#6f6251]">{partner.specialty}</p> : null}
        </div>
        <div className="px-3 py-3 lg:flex-1 lg:overflow-y-auto lg:py-4">
          <div className="lg:hidden">
            <PortalNavList links={[{ ...links[0], exact: true }, ...links.slice(1)]} layout="row" />
          </div>
          <div className="hidden lg:block">
            <PortalNavList links={[{ ...links[0], exact: true }, ...links.slice(1)]} />
          </div>
        </div>
        <div className="space-y-2 border-t border-[#d9c7a866] p-4">
          <Link
            href="/"
            className="hidden rounded-full border border-[#d9c7a866] bg-[#fffaf3] px-3 py-2.5 text-center text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e] hover:bg-[#fff6e8] lg:block"
          >
            ← Public website
          </Link>
          <PortalSignOut className="block w-full rounded-full border border-[#d9c7a866] bg-white px-3 py-2.5 text-center text-[10px] uppercase tracking-[0.14em] text-[#5f5344] hover:bg-[#fff6e8] hover:text-[#8f6f3e]" />
        </div>
      </aside>
      <section className="min-w-0 p-5 sm:p-6 lg:p-8">{children}</section>
    </div>
  );
}
