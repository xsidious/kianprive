"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminGroups = [
  {
    label: "Workspace",
    links: [
      { href: "/admin", label: "Overview", exact: true },
      { href: "/admin/intake", label: "Clinical Intake" },
      { href: "/admin/bookings", label: "Bookings" },
      { href: "/admin/consultations", label: "Consultations" },
    ],
  },
  {
    label: "People",
    links: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/partners", label: "Partners" },
      { href: "/admin/providers", label: "Practitioners" },
      { href: "/admin/ambassadors", label: "Ambassadors" },
    ],
  },
  {
    label: "Commerce",
    links: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/commerce", label: "Commerce Hub" },
    ],
  },
  {
    label: "Content",
    links: [
      { href: "/admin/cms", label: "CMS" },
      { href: "/admin/seo", label: "SEO" },
      { href: "/admin/blog", label: "Blog" },
      { href: "/admin/retreats", label: "Retreats" },
      { href: "/admin/communications", label: "Communications" },
    ],
  },
  {
    label: "System",
    links: [
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/operations", label: "Operations" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebarNav() {
  const pathname = usePathname() || "/admin";

  return (
    <nav className="mt-6 space-y-5">
      {adminGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[#b0a090]">{group.label}</p>
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
