"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogOut, Menu, ShoppingBag, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";

const LOGO_SRC = "/images/kian-prive-logo.png";

const links = [
  { href: "/events-retreats", label: "Events & Retreats" },
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact Us" },
];

const whatWeDoLinks = [
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
  "font-serif text-[11px] uppercase tracking-[0.22em] text-[#b6a185] transition hover:text-[#8a682e]";

const dropdownLinkClass =
  "block rounded-sm px-3 py-2 font-serif text-[11px] uppercase tracking-[0.18em] text-[#b6a185] transition hover:bg-[#fffaf2] hover:text-[#8a682e]";

export function Navbar() {
  const { data } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const { itemCount, openCart, hydrated } = useCart();
  const displayCount = hydrated ? itemCount : 0;
  const initials = (data?.user?.name ?? data?.user?.email ?? "M").slice(0, 1).toUpperCase();

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

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8dfd0] bg-white/95 backdrop-blur">
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
              {whatWeDoLinks.map((link) => (
                <Link key={link.href} href={link.href} className={dropdownLinkClass}>
                  {link.label}
                </Link>
              ))}
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

        <div className="hidden items-center justify-end gap-2 sm:flex">
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex items-center p-2 text-[#b6a185] transition hover:text-[#8a682e]"
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
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 border border-[#b6a18566] px-2 py-1.5 text-[#b6a185]"
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
                  <Link href="/dashboard" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/profile" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    Profile
                  </Link>
                  <Link href="/dashboard/subscription" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    Subscription
                  </Link>
                  <Link href="/dashboard/services" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    My Services
                  </Link>
                  <Link href="/book-online" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    Book Consultations
                  </Link>
                  {data.user.role === "PARTNER" ? (
                    <Link href="/partner" className="block rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                      Partner Portal
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
              className="rounded-sm border border-[#b6a185] px-4 py-2 font-serif text-[11px] uppercase tracking-[0.16em] text-[#b6a185] transition hover:bg-[#faf6f0] hover:text-[#8a682e]"
            >
              Members
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex h-10 w-10 items-center justify-center text-[#b6a185]"
            aria-label="Open cart"
          >
            <ShoppingBag size={17} aria-hidden />
            {displayCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8a682e] px-1 text-[10px] text-white">
                {displayCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center text-[#b6a185]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#e8dfd0] bg-white px-4 py-4 sm:hidden">
          <div className="grid gap-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-sm px-3 py-2.5 font-serif text-[12px] uppercase tracking-[0.2em] text-[#b6a185] hover:bg-[#faf6f0]"
            >
              Home
            </Link>
            <p className="px-3 pt-2 font-serif text-[10px] uppercase tracking-[0.22em] text-[#8a682e]">What We Do</p>
            {whatWeDoLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-sm px-3 py-2.5 font-serif text-[12px] uppercase tracking-[0.2em] text-[#b6a185] hover:bg-[#faf6f0]"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 rounded-sm border border-[#e8dfd0] p-2">
              <p className="px-2 font-serif text-[10px] uppercase tracking-[0.22em] text-[#8a682e]">Icoone</p>
              <div className="mt-1 grid gap-1">
                {icooneLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-sm px-3 py-2 font-serif text-[12px] uppercase tracking-[0.2em] text-[#b6a185] hover:bg-[#faf6f0]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-sm px-3 py-2.5 font-serif text-[12px] uppercase tracking-[0.2em] text-[#b6a185] hover:bg-[#faf6f0]"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/book-online"
                onClick={() => setMobileOpen(false)}
                className="rounded-sm bg-[#8a682e] px-4 py-3 text-center font-serif text-[11px] uppercase tracking-[0.16em] text-white"
              >
                Book Online
              </Link>
              <Link
                href={data?.user ? "/dashboard" : "/login"}
                onClick={() => setMobileOpen(false)}
                className="rounded-sm border border-[#b6a185] px-4 py-3 text-center font-serif text-[11px] uppercase tracking-[0.16em] text-[#b6a185]"
              >
                Members
              </Link>
            </div>
            {data?.user ? (
              <div className="mt-3 rounded-sm border border-[#e8dfd0] p-2">
                <p className="px-2 font-serif text-[10px] uppercase tracking-[0.2em] text-[#8a682e]">My Account</p>
                <div className="mt-1 grid gap-1">
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#faf6f0]">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/profile" onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#faf6f0]">
                    Profile
                  </Link>
                  <Link href="/dashboard/subscription" onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#faf6f0]">
                    Subscription
                  </Link>
                  <Link href="/dashboard/services" onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#faf6f0]">
                    My Services
                  </Link>
                  {data.user.role === "PARTNER" ? (
                    <Link href="/partner" onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#faf6f0]">
                      Partner Portal
                    </Link>
                  ) : null}
                  {data.user.role === "ADMIN" || data.user.role === "OPERATIONS" || data.user.role === "EDITOR" ? (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#faf6f0]">
                      Admin Dashboard
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#e8dfd0] px-3 py-2 text-[#3b3024] hover:bg-[#faf6f0]"
                  >
                    <User size={14} />
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
