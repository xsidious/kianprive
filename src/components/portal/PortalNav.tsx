"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type PortalLink = { href: string; label: string; exact?: boolean };

export function portalLinkActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const stackLink =
  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition";
const rowLink =
  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition";

function linkClass(active: boolean, layout: "stack" | "row") {
  if (layout === "row") {
    return active
      ? `${rowLink} border-[#c9ae78] bg-white text-[#1f1a15] shadow-[0_6px_16px_rgba(143,111,62,0.12)]`
      : `${rowLink} border-[#e5d7c2] bg-white/70 text-[#5c5146] hover:border-[#c9ae78] hover:bg-white`;
  }
  return active
    ? `${stackLink} bg-white font-medium text-[#1f1a15] shadow-[0_8px_22px_rgba(143,111,62,0.1)] ring-1 ring-[#e7d8c2]`
    : `${stackLink} text-[#5c5146] hover:bg-white/70 hover:text-[#1f1a15]`;
}

export function PortalNavList({
  links,
  layout = "stack",
}: {
  links: PortalLink[];
  layout?: "stack" | "row";
}) {
  const pathname = usePathname() || "/";

  return (
    <nav className={layout === "row" ? "flex gap-1.5 overflow-x-auto pb-1" : "space-y-1"}>
      {links.map((link) => {
        const active = portalLinkActive(pathname, link.href, link.exact);
        return (
          <Link key={link.href} href={link.href} className={linkClass(active, layout)} aria-current={active ? "page" : undefined}>
            {layout === "stack" ? (
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-[#b78d4b]" : "bg-[#e5d7c2]"}`} />
            ) : null}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PortalNavGroups({
  groups,
}: {
  groups: { label: string; links: PortalLink[] }[];
}) {
  const pathname = usePathname() || "/";

  return (
    <nav className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#b0a090]">{group.label}</p>
          <ul className="mt-2 space-y-1">
            {group.links.map((link) => {
              const active = portalLinkActive(pathname, link.href, link.exact);
              return (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass(active, "stack")} aria-current={active ? "page" : undefined}>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-[#b78d4b]" : "bg-[#e5d7c2]"}`} />
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
