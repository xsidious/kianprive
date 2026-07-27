"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogOut, Menu, ShoppingBag, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";

const LOGO_SRC = "/images/kian-prive-logo.png";

const primaryNav = [
  { href: "/services#all-services", label: "Icoone®" },
  { href: "/services#recovery", label: "Recovery" },
  { href: "/services#face-body-wellness", label: "Skincare" },
  { href: "/shop", label: "Products" },
  { href: "/services#compounding-peptides", label: "Compound Therapy" },
  { href: "/services#physician", label: "Wellness" },
  { href: "/services#policies", label: "Policies" },
];

const moreLinks = [
  { href: "/about", label: "About" },
  { href: "/events-retreats", label: "Events & Retreats" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/corporate-wellness", label: "Corporate Wellness" },
  { href: "/client-testimonials", label: "Testimonials" },
];

const navLinkClass =
  "font-serif text-[11px] uppercase tracking-[0.22em] text-[#b6a185] transition hover:text-[#8a682e]";

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
    <header className="sticky top-0 z-40 border-b border-[#e8dfd0] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
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

        <nav className="hidden flex-1 items-center justify-center gap-x-5 gap-y-2 xl:gap-x-7 lg:flex">
          {primaryNav.map((link) => (
            <Link key={link.label} href={link.href} className={navLinkClass}>
              {link.label}
            </Link>
          ))}
          <div className="group relative">
            <button type="button" className={`${navLinkClass} inline-flex items-center gap-1`} aria-label="More pages">
              More
              <ChevronDown size={12} aria-hidden />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 rounded-sm border border-[#e4d9c8] bg-white p-2 opacity-0 shadow-sm transition-all group-hover:visible group-hover:opacity-100">
              {moreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-sm px-3 py-2 font-serif text-[11px] uppercase tracking-[0.18em] text-[#b6a185] transition hover:bg-[#fffaf2] hover:text-[#8a682e]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
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
            className="inline-flex items-center border border-[#b6a185] px-4 py-2 font-serif text-[11px] uppercase tracking-[0.22em] text-[#b6a185] transition hover:bg-[#faf6f0] hover:text-[#8a682e]"
          >
            Reserve
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
              className="font-serif text-[11px] uppercase tracking-[0.22em] text-[#b6a185] transition hover:text-[#8a682e]"
            >
              Members
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
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
        <div className="border-t border-[#e8dfd0] bg-white px-4 py-4 lg:hidden">
          <div className="grid gap-1">
            {primaryNav.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-sm px-3 py-2.5 font-serif text-[12px] uppercase tracking-[0.2em] text-[#b6a185] hover:bg-[#faf6f0]"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-[#e8dfd0]" />
            {moreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-sm px-3 py-2.5 font-serif text-[12px] uppercase tracking-[0.2em] text-[#b6a185] hover:bg-[#faf6f0]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/book-online"
              onClick={() => setMobileOpen(false)}
              className="mt-3 inline-flex items-center justify-center border border-[#b6a185] px-4 py-3 font-serif text-[12px] uppercase tracking-[0.22em] text-[#b6a185]"
            >
              Reserve
            </Link>
            <Link
              href={data?.user ? "/dashboard" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="mt-2 text-center font-serif text-[12px] uppercase tracking-[0.22em] text-[#b6a185]"
            >
              {data?.user ? "Dashboard" : "Members"}
            </Link>
            {data?.user ? (
              <div className="mt-3 rounded-sm border border-[#e8dfd0] p-2">
                <p className="px-2 font-serif text-[10px] uppercase tracking-[0.2em] text-[#b6a185]">My Account</p>
                <div className="mt-1 grid gap-1">
                  <Link href="/dashboard/profile" onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#faf6f0]">
                    Profile
                  </Link>
                  <Link href="/dashboard/subscription" onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2 text-sm text-[#4f4335] hover:bg-[#faf6f0]">
                    Subscription
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
