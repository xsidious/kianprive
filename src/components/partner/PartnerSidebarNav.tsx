"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    label: "Overview",
    links: [
      { href: "/partner", label: "Dashboard", exact: true },
      { href: "/partner/analytics", label: "Analytics" },
    ],
  },
  {
    label: "Operations",
    links: [
      { href: "/partner/bookings", label: "Bookings" },
      { href: "/partner/calendar", label: "Calendar" },
      { href: "/partner/clients", label: "Clients" },
    ],
  },
  {
    label: "Catalog",
    links: [
      { href: "/partner/services", label: "Services" },
      { href: "/partner/products", label: "Products" },
      { href: "/partner/guidelines", label: "Guidelines" },
    ],
  },
  {
    label: "Finance",
    links: [
      { href: "/partner/earnings", label: "Earnings" },
      { href: "/partner/payouts", label: "Payouts" },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/partner/profile", label: "Profile" },
      { href: "/partner/support", label: "Support" },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PartnerSidebarNav() {
  const pathname = usePathname() || "/partner";

  return (
    <nav className="mt-6 space-y-5">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[#b0a090]">
            {group.label}
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {group.links.map((link) => {
              const active = isActive(pathname, link.href, link.exact);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-sm px-3 py-2 text-sm transition ${
                      active
                        ? "bg-[#fff6e8] font-medium text-[#8f6f3e]"
                        : "text-[#4f4335] hover:bg-[#fff8ef] hover:text-[#8f6f3e]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
