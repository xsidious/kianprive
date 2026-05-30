"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogOut, Menu, ShoppingBag, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";

const links = [
  { href: "/events-retreats", label: "Events & Retreats" },
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact Us" },
];

const whatWeDoLinks = [
  { href: "/services", label: "Privé Services" },
  { href: "/about", label: "About" },
  { href: "/corporate-wellness", label: "Corporate Wellness" },
];

const icooneLinks = [
  { href: "/icoone-training", label: "Overview" },
  { href: "/practitioners", label: "Practitioners" },
  { href: "/athletes", label: "Athletes (Members)" },
];

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
    <header className="sticky top-0 z-40 border-b border-[#b78d4b33] bg-[#fffdf9e6] backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image src="/images/kianprivelogo.png" alt="KIAN Privé logo" width={52} height={52} />
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-6 text-sm text-[#4f4335] lg:flex">
            <Link href="/" className="transition hover:text-[#b78d4b]">
              Home
            </Link>
            <div className="group relative">
              <button className="inline-flex items-center gap-1 transition hover:text-[#b78d4b]">
                What We Do
                <ChevronDown size={14} />
              </button>
              <div className="invisible absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-[#b78d4b30] bg-white p-2 opacity-0 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] transition-all group-hover:visible group-hover:opacity-100">
                {whatWeDoLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-xl px-3 py-2 text-[#4f4335] transition hover:bg-[#fffaf2] hover:text-[#8f6f3e]"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="group/icoone relative">
                  <button className="inline-flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[#4f4335] transition hover:bg-[#fffaf2] hover:text-[#8f6f3e]">
                    <span>Icoone</span>
                    <ChevronDown size={14} />
                  </button>
                  <div className="invisible absolute left-full top-0 z-50 ml-2 w-56 rounded-2xl border border-[#b78d4b30] bg-white p-2 opacity-0 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] transition-all group-hover/icoone:visible group-hover/icoone:opacity-100">
                    {icooneLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-xl px-3 py-2 text-[#4f4335] transition hover:bg-[#fffaf2] hover:text-[#8f6f3e]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-[#b78d4b]">
                {link.label}
              </Link>
            ))}
          </nav>

        <div className="hidden items-center justify-end gap-2 text-sm sm:flex">
          <button onClick={openCart} className="relative inline-flex items-center rounded-full border border-[#b78d4b80] bg-white p-2 text-[#3b3024]">
            <ShoppingBag size={17} />
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b78d4b] px-1 text-[10px] text-white">
              {displayCount}
            </span>
          </button>
          <Link href="/book-online" className="rounded-full bg-[#b78d4b] px-4 py-2 text-sm text-white">
            Book Online
          </Link>
          {data?.user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-[#b78d4b80] bg-white px-2 py-1.5 text-sm text-[#3b3024]"
                aria-label="Open account menu"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#b78d4b] text-xs font-semibold text-white">
                  {initials}
                </span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 rounded-2xl border border-[#b78d4b33] bg-white p-2 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.55)]">
                  <div className="mb-1 rounded-xl bg-[#fffaf2] px-3 py-2">
                    <p className="text-sm text-[#1f1a15]">{data.user.name ?? "Member"}</p>
                    <p className="text-xs text-[#6f6251]">{data.user.email}</p>
                  </div>
                  <Link href="/dashboard" className="block rounded-xl px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/profile" className="block rounded-xl px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    Profile
                  </Link>
                  <Link href="/dashboard/subscription" className="block rounded-xl px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    Subscription
                  </Link>
                  <Link href="/dashboard/services" className="block rounded-xl px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    My Services
                  </Link>
                  <Link href="/book-online" className="block rounded-xl px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                    Book Consultations
                  </Link>
                  {data.user.role === "ADMIN" ? (
                    <Link href="/admin" className="block rounded-xl px-3 py-2 text-sm text-[#4f4335] hover:bg-[#fffaf2]">
                      Admin Dashboard
                    </Link>
                  ) : null}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="mt-1 inline-flex w-full items-center gap-2 rounded-xl border border-[#b78d4b33] px-3 py-2 text-sm text-[#3b3024] hover:bg-[#fffaf2]"
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
              className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]"
            >
              Members
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={openCart}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#b78d4b66] bg-white text-[#3b3024] shadow-[0_10px_18px_-14px_rgba(66,45,14,0.55)]"
            aria-label="Open cart"
          >
            <ShoppingBag size={17} />
            {displayCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-[#b78d4b] px-1 text-[10px] text-white">
                {displayCount}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#b78d4b66] bg-white text-[#3b3024] shadow-[0_10px_18px_-14px_rgba(66,45,14,0.55)]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#b78d4b2f] bg-[#fffdf9] px-4 py-4 sm:hidden">
          <div className="grid gap-2 text-sm text-[#4f4335]">
            <Link href="/" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-2 hover:bg-[#fff7eb]">
              Home
            </Link>
            <p className="px-3 pt-1 text-xs tracking-[0.18em] text-[#8f6f3e]">WHAT WE DO</p>
            {whatWeDoLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2 text-[#4f4335] hover:bg-[#fff7eb]"
              >
                {link.label}
              </Link>
            ))}
            <div className="rounded-xl border border-[#b78d4b2f] bg-white p-2">
              <p className="px-2 text-xs tracking-[0.16em] text-[#8f6f3e]">ICOONE</p>
              <div className="mt-1 grid gap-1">
                {icooneLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2 text-[#4f4335] hover:bg-[#fff7eb]"
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
                className="rounded-xl px-3 py-2 hover:bg-[#fff7eb]"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/book-online" onClick={() => setMobileOpen(false)} className="rounded-full bg-[#b78d4b] px-4 py-2 text-center text-white">
                Book Online
              </Link>
              <Link
                href={data?.user ? "/dashboard" : "/login"}
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-center text-[#3b3024]"
              >
                Members
              </Link>
            </div>
            {data?.user ? (
              <div className="mt-3 rounded-xl border border-[#b78d4b2f] bg-white p-2">
                <p className="px-2 text-xs tracking-[0.15em] text-[#8f6f3e]">MY ACCOUNT</p>
                <div className="mt-1 grid gap-1">
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-2 text-[#4f4335] hover:bg-[#fff7eb]">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/profile" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-2 text-[#4f4335] hover:bg-[#fff7eb]">
                    Profile
                  </Link>
                  <Link href="/dashboard/subscription" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-2 text-[#4f4335] hover:bg-[#fff7eb]">
                    Subscription
                  </Link>
                  <Link href="/dashboard/services" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-2 text-[#4f4335] hover:bg-[#fff7eb]">
                    My Services
                  </Link>
                  {data.user.role === "ADMIN" ? (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-2 text-[#4f4335] hover:bg-[#fff7eb]">
                      Admin Dashboard
                    </Link>
                  ) : null}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#b78d4b40] px-3 py-2 text-[#3b3024] hover:bg-[#fff7eb]"
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
