"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, ShoppingBag, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { getPortalHomeForRole, getPortalLabelForRole } from "@/lib/auth-redirect";
import { PRIVETHERAPEUTICS_URL } from "@/lib/privetherapeutics";
import { TherapeuticsAnchor } from "@/components/site/TherapeuticsAnchor";

const LOGO_SRC = "/images/kian-prive-logo.png";

const links = [
  { href: "/events-retreats", label: "Events & Retreats" },
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact Us" },
];

const whatWeDoLinks = [
  { href: PRIVETHERAPEUTICS_URL, label: "GLP Therapy", external: true },
  { href: "/services", label: "Privé Services" },
  { href: "/client-testimonials", label: "Client Testimonials" },
  { href: "/about", label: "About" },
  { href: "/corporate-wellness", label: "Corporate Wellness" },
];

const icooneLinks = [
  { href: "/icoone-training", label: "Overview" },
  { href: "/practitioners", label: "Practitioners" },
  { href: "/athletes", label: "Athletes (Members)" },
];

const navLinkClass =
  "font-serif text-[11px] uppercase tracking-[0.22em] text-[#3b3024] transition hover:text-[#8a682e]";

const dropdownLinkClass =
  "block rounded-sm px-3 py-2 font-serif text-[11px] uppercase tracking-[0.18em] text-[#3b3024] transition hover:bg-[#fffaf2] hover:text-[#8a682e]";

const mobileNavLinkClass =
  "block rounded-sm px-3 py-3 font-serif text-[13px] uppercase tracking-[0.18em] text-[#3b3024] transition active:bg-[#f3ebe0] hover:bg-[#faf6f0] hover:text-[#8a682e]";

const mobileSectionLabelClass =
  "px-3 pb-1 pt-5 font-serif text-[10px] uppercase tracking-[0.28em] text-[#8a682e]";

export function Navbar() {
  const { data } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const { itemCount, openCart, hydrated } = useCart();
  const displayCount = hydrated ? itemCount : 0;
  const initials = (data?.user?.name ?? data?.user?.email ?? "M").slice(0, 1).toUpperCase();
  const portalHome = getPortalHomeForRole(data?.user?.role);
  const portalLabel = getPortalLabelForRole(data?.user?.role);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.removeAttribute("data-mobile-nav-open");
      document.body.style.removeProperty("overflow");
      return;
    }
    document.body.setAttribute("data-mobile-nav-open", "true");
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.removeAttribute("data-mobile-nav-open");
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-[70] border-b border-[#e8dfd0] bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
        <div className="flex items-center">
          <Link href="/" className="relative flex shrink-0 items-center">
            <Image
              src={LOGO_SRC}
              alt="KIAN Privé"
              width={148}
              height={120}
              className="h-12 w-auto object-contain sm:h-14"
              priority
            />
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-6 lg:flex">
          <Link href="/" className={navLinkClass}>
            Home
          </Link>
          <Link href="/book-online" className={navLinkClass}>
            Book Online
          </Link>
          <div className="group relative">
            <button
              type="button"
              className={`${navLinkClass} inline-flex items-center gap-1`}
              aria-label="What We Do menu"
            >
              What We Do
              <ChevronDown size={12} aria-hidden />
            </button>
            <div className="invisible absolute left-0 top-full z-50 mt-2 w-72 rounded-sm border border-[#e4d9c8] bg-white p-2 opacity-0 shadow-sm transition-all group-hover:visible group-hover:opacity-100">
              {whatWeDoLinks.map((link) =>
                "external" in link && link.external ? (
                  <TherapeuticsAnchor key={link.href} href={link.href} className={dropdownLinkClass}>
                    {link.label}
                  </TherapeuticsAnchor>
                ) : (
                  <Link key={link.href} href={link.href} className={dropdownLinkClass}>
                    {link.label}
                  </Link>
                ),
              )}
              <div className="group/icoone relative">
                <button
                  type="button"
                  className={`${dropdownLinkClass} inline-flex w-full items-center justify-between text-left`}
                  aria-label="Icoone submenu"
                >
                  <span>Icoone</span>
                  <ChevronDown size={12} aria-hidden />
                </button>
                <div className="invisible absolute left-full top-0 z-50 ml-2 w-56 rounded-sm border border-[#e4d9c8] bg-white p-2 opacity-0 shadow-sm transition-all group-hover/icoone:visible group-hover/icoone:opacity-100">
                  {icooneLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={dropdownLinkClass}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex items-center p-2 text-[#5c4a32] transition hover:text-[#8a682e]"
            aria-label={`Open cart${displayCount > 0 ? `, ${displayCount} items` : ""}`}
          >
            <ShoppingBag size={17} aria-hidden />
            {displayCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8a682e] px-1 text-[10px] text-white">
                {displayCount}
              </span>
            ) : null}
          </button>
          <Link
            href="/book-online"
            className="rounded-sm bg-[#8a682e] px-4 py-2 font-serif text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-[#735624]"
          >
            Book Online
          </Link>
          {data?.user ? (
            <Link
              href={portalHome}
              className="rounded-sm border border-[#8a682e] px-4 py-2 font-serif text-[11px] uppercase tracking-[0.16em] text-[#3b3024] transition hover:bg-[#faf6f0] hover:text-[#8a682e]"
            >
              {portalLabel}
            </Link>
          ) : null}
          {data?.user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 border border-[#8a682e66] px-2 py-1.5 text-[#3b3024]"
                aria-label="Open account menu"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8a682e] text-xs font-semibold text-white">
                  {initials}
                </span>
                <ChevronDown size={14} aria-hidden />
              </button>
              {userMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 rounded-sm border border-[#e4d9c8] bg-white p-2 shadow-sm">
                  <div className="mb-1 rounded-sm bg-[#fffaf2] px-3 py-2">
                    <p className="text-sm text-[#1f1a15]">{data.user.name ?? "Member"}</p>
                    <p className="text-xs text-[#6f6251]">{data.user.email}</p>
                  </div>
                  <Link href={portalHome} className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    {portalLabel}
                  </Link>
                  {portalHome !== "/dashboard" ? (
                    <Link href="/dashboard" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                      Member dashboard
                    </Link>
                  ) : null}
                  {data.user.role === "MEMBER" ||
                  data.user.role === "GUEST" ||
                  data.user.role === "PROVIDER" ||
                  data.user.portals?.includes("practitioner") ? (
                    <>
                      <Link href="/dashboard/profile" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                        Profile
                      </Link>
                      <Link href="/dashboard/subscription" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                        Subscription
                      </Link>
                      <Link href="/dashboard/services" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                        My Services
                      </Link>
                    </>
                  ) : null}
                  <Link href="/book-online" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    Book Consultations
                  </Link>
                  <Link href="/" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    Public website
                  </Link>
                  {data.user.portals?.includes("partner") || data.user.role === "PARTNER" ? (
                    <Link href="/partner" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                      Partner Portal
                    </Link>
                  ) : null}
                  {data.user.portals?.includes("ambassador") || data.user.role === "AMBASSADOR" ? (
                    <Link href="/ambassador" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                      Ambassador Portal
                    </Link>
                  ) : null}
                  {data.user.portals?.includes("practitioner") || data.user.role === "PROVIDER" ? (
                    <Link href="/provider" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                      Practitioner Portal
                    </Link>
                  ) : null}
                  {data.user.role === "ADMIN" || data.user.role === "OPERATIONS" || data.user.role === "EDITOR" ? (
                    <Link href="/admin" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                      Admin Dashboard
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="mt-1 inline-flex w-full items-center gap-2 rounded-sm border border-[#e4d9c8] px-3 py-2 text-sm text-[#3b3024] hover:bg-[#fffaf2]"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-sm border border-[#8a682e] px-4 py-2 font-serif text-[11px] uppercase tracking-[0.16em] text-[#3b3024] transition hover:bg-[#faf6f0] hover:text-[#8a682e]"
            >
              Members
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex h-11 w-11 items-center justify-center text-[#3b3024]"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} aria-hidden />
            {displayCount > 0 ? (
              <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8a682e] px-1 text-[10px] text-white">
                {displayCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center text-[#3b3024]"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[80] flex flex-col lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-[#1f1a15]/45 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />

          <div
            className="relative z-[1] flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#fdf9f2] shadow-[0_24px_80px_-28px_rgba(31,26,21,0.55)]"
            style={{
              backgroundImage:
                "radial-gradient(900px 420px at 0% 0%, #f7ecda 0%, transparent 55%), radial-gradient(700px 360px at 100% 0%, #f1e6d4 0%, transparent 50%)",
            }}
          >
            <div className="shrink-0 border-b border-[#e8dfd0]/90 bg-white/80 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <Link href="/" onClick={() => setMobileOpen(false)} className="relative flex shrink-0 items-center">
                  <Image
                    src={LOGO_SRC}
                    alt="KIAN Privé"
                    width={148}
                    height={120}
                    className="h-11 w-auto object-contain"
                    priority
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-[#e4d9c8] bg-white text-[#3b3024]"
                  aria-label="Close menu"
                >
                  <X size={18} aria-hidden />
                </button>
              </div>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2">
              <div className="mx-auto flex max-w-lg flex-col pb-6">
                <Link href="/" onClick={() => setMobileOpen(false)} className={mobileNavLinkClass}>
                  Home
                </Link>
                <Link href="/book-online" onClick={() => setMobileOpen(false)} className={mobileNavLinkClass}>
                  Book Online
                </Link>

                <p className={mobileSectionLabelClass}>What We Do</p>
                <div className="grid gap-0.5 rounded-sm border border-[#e8dfd0] bg-white/70 p-1.5">
                  {whatWeDoLinks.map((link) =>
                    "external" in link && link.external ? (
                      <TherapeuticsAnchor key={link.href} href={link.href} className={mobileNavLinkClass}>
                        {link.label}
                      </TherapeuticsAnchor>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={mobileNavLinkClass}
                      >
                        {link.label}
                      </Link>
                    ),
                  )}
                </div>

                <p className={mobileSectionLabelClass}>Icoone</p>
                <div className="grid gap-0.5 rounded-sm border border-[#e8dfd0] bg-white/70 p-1.5">
                  {icooneLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={mobileNavLinkClass}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <p className={mobileSectionLabelClass}>Explore</p>
                <div className="grid gap-0.5">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={mobileNavLinkClass}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {data?.user ? (
                  <>
                    <p className={mobileSectionLabelClass}>My Account</p>
                    <div className="grid gap-0.5 rounded-sm border border-[#e8dfd0] bg-white/70 p-1.5">
                      <div className="mb-1 rounded-sm bg-[#fffaf2] px-3 py-2.5">
                        <p className="text-sm text-[#1f1a15]">{data.user.name ?? "Member"}</p>
                        <p className="truncate text-xs text-[#6f6251]">{data.user.email}</p>
                      </div>
                      <Link
                        href={portalHome}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-sm px-3 py-2.5 text-sm text-[#4f4335] hover:bg-[#faf6f0]"
                      >
                        {portalLabel}
                      </Link>
                      {portalHome !== "/dashboard" ? (
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-sm px-3 py-2.5 text-sm text-[#4f4335] hover:bg-[#faf6f0]"
                        >
                          Member dashboard
                        </Link>
                      ) : null}
                      {(data.user.role === "MEMBER" ||
                        data.user.role === "GUEST" ||
                        data.user.role === "PROVIDER" ||
                        data.user.portals?.includes("practitioner")) && (
                        <>
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setMobileOpen(false)}
                            className="rounded-sm px-3 py-2.5 text-sm text-[#4f4335] hover:bg-[#faf6f0]"
                          >
                            Profile
                          </Link>
                          <Link
                            href="/dashboard/subscription"
                            onClick={() => setMobileOpen(false)}
                            className="rounded-sm px-3 py-2.5 text-sm text-[#4f4335] hover:bg-[#faf6f0]"
                          >
                            Subscription
                          </Link>
                          <Link
                            href="/dashboard/services"
                            onClick={() => setMobileOpen(false)}
                            className="rounded-sm px-3 py-2.5 text-sm text-[#4f4335] hover:bg-[#faf6f0]"
                          >
                            My Services
                          </Link>
                        </>
                      )}
                      {data.user.portals?.includes("partner") || data.user.role === "PARTNER" ? (
                        <Link
                          href="/partner"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-sm px-3 py-2.5 text-sm text-[#4f4335] hover:bg-[#faf6f0]"
                        >
                          Partner Portal
                        </Link>
                      ) : null}
                      {data.user.portals?.includes("ambassador") || data.user.role === "AMBASSADOR" ? (
                        <Link
                          href="/ambassador"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-sm px-3 py-2.5 text-sm text-[#4f4335] hover:bg-[#faf6f0]"
                        >
                          Ambassador Portal
                        </Link>
                      ) : null}
                      {data.user.portals?.includes("practitioner") || data.user.role === "PROVIDER" ? (
                        <Link
                          href="/provider"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-sm px-3 py-2.5 text-sm text-[#4f4335] hover:bg-[#faf6f0]"
                        >
                          Practitioner Portal
                        </Link>
                      ) : null}
                      {data.user.role === "ADMIN" ||
                      data.user.role === "OPERATIONS" ||
                      data.user.role === "EDITOR" ? (
                        <Link
                          href="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-sm px-3 py-2.5 text-sm text-[#4f4335] hover:bg-[#faf6f0]"
                        >
                          Admin Dashboard
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="mt-1 inline-flex items-center justify-center gap-2 rounded-sm border border-[#e8dfd0] px-3 py-2.5 text-sm text-[#3b3024] hover:bg-[#faf6f0]"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </nav>

            <div className="shrink-0 border-t border-[#e8dfd0] bg-white/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
              <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
                <Link
                  href="/book-online"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-sm bg-[#8a682e] px-4 py-3.5 text-center font-serif text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-[#735624]"
                >
                  Book Online
                </Link>
                <Link
                  href={data?.user ? portalHome : "/login"}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-sm border border-[#8a682e] bg-white px-4 py-3.5 text-center font-serif text-[11px] uppercase tracking-[0.16em] text-[#3b3024] transition hover:bg-[#faf6f0]"
                >
                  {data?.user ? portalLabel : "Members"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
