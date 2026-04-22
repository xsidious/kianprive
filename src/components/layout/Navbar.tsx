"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, ShoppingBag, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";

const links = [
  { href: "/events-retreats", label: "Events & Retreats" },
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact Us" },
];

const whatWeDoLinks = [
  { href: "/services", label: "Privée Services" },
  { href: "/about", label: "About" },
  { href: "/corporate-wellness", label: "Corporate Wellness" },
  { href: "/icoone-training", label: "Icoone" },
  { href: "/practitioners", label: "Practitioners" },
  { href: "/athletes", label: "Athletes (Members)" },
];

export function Navbar() {
  const { data } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-[#b78d4b33] bg-[#fffdf9e6] backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image src="/images/kianprivelogo.png" alt="KIAN Privé logo" width={52} height={52} />
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-6 text-sm text-[#4f4335] lg:flex">
            <div className="group relative">
              <button className="inline-flex items-center gap-1 transition hover:text-[#b78d4b]">
                What We Do
                <ChevronDown size={14} />
              </button>
              <div className="invisible absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[#b78d4b30] bg-white p-2 opacity-0 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] transition-all group-hover:visible group-hover:opacity-100">
                {whatWeDoLinks.map((link) => (
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
              {itemCount}
            </span>
          </button>
          <Link href="/book-online" className="rounded-full bg-[#b78d4b] px-4 py-2 text-sm text-white">
            Book Online
          </Link>
          <Link
            href={data?.user ? "/dashboard" : "/login"}
            className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]"
          >
            Members
          </Link>
          {data?.user ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hidden rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-[#3b3024] xl:inline-flex"
            >
              Logout
            </button>
          ) : (
            <div />
          )}
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <button onClick={openCart} className="relative inline-flex items-center rounded-full border border-[#b78d4b80] bg-white p-2 text-[#3b3024]">
            <ShoppingBag size={16} />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b78d4b] px-1 text-[10px] text-white">
                {itemCount}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center rounded-full border border-[#b78d4b80] bg-white p-2 text-[#3b3024]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#b78d4b2f] bg-[#fffdf9] px-4 py-4 sm:hidden">
          <div className="grid gap-2 text-sm text-[#4f4335]">
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
            {links
              .filter((link) => link.href !== "/")
              .map((link) => (
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
          </div>
        </div>
      ) : null}
    </header>
  );
}
