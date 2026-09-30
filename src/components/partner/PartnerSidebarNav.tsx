"use client";

import { PortalNavGroups } from "@/components/portal/PortalNav";

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
      { href: "/partner/intake-link", label: "Clinical intake" },
      { href: "/partner/profile", label: "Profile" },
      { href: "/partner/support", label: "Support" },
    ],
  },
];

export function PartnerSidebarNav() {
  return (
    <div className="mt-5">
      <PortalNavGroups groups={navGroups} />
    </div>
  );
}
