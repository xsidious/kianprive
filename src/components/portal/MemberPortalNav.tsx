"use client";

import { PortalNavList, type PortalLink } from "@/components/portal/PortalNav";

const links: PortalLink[] = [
  { href: "/dashboard", label: "Home", exact: true },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/intake", label: "Clinical intake" },
  { href: "/dashboard/therapeutics", label: "Peptide therapy" },
  { href: "/dashboard/services", label: "Services" },
  { href: "/dashboard/subscription", label: "Membership" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function MemberPortalNav({ name }: { name?: string | null }) {
  return (
    <div className="border-b border-[#e5d7c2] bg-[linear-gradient(180deg,#fffaf3_0%,#f7f1e8_100%)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f6f3e]">Member portal</p>
            <p className="font-serif text-2xl text-[#1f1a15]">{name?.trim() || "Welcome back"}</p>
          </div>
        </div>
        <PortalNavList links={links} layout="row" />
      </div>
    </div>
  );
}
