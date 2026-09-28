"use client";

import { PortalNavGroups } from "@/components/portal/PortalNav";

const adminGroups = [
  {
    label: "Workspace",
    links: [
      { href: "/admin", label: "Overview", exact: true },
      { href: "/admin/intake", label: "Clinical Intake" },
      { href: "/admin/prescriptions", label: "Prescriptions" },
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
      { href: "/admin/shipping", label: "Shipping" },
      { href: "/admin/invoices", label: "Invoices" },
      { href: "/admin/subscriptions", label: "Therapy billing" },
      { href: "/admin/vendors", label: "Vendors" },
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

export function AdminSidebarNav() {
  return (
    <div className="mt-5">
      <PortalNavGroups groups={adminGroups} />
    </div>
  );
}
