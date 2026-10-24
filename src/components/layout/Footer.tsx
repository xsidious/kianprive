"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setError(null);
    if (!consent) {
      setError("Please confirm you want marketing emails before subscribing.");
      return;
    }
    const res = await fetch("/api/email-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        action: "subscribe",
        marketingConsent: true,
        source: "footer",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    if (!res.ok) {
      setError(data.error || "Could not subscribe.");
      return;
    }
    setStatus(data.message || "Subscribed.");
    setEmail("");
    setConsent(false);
  }

  return (
    <footer className="border-t border-[#b78d4b33] bg-[#f3ece0] px-4 py-12 text-[#5a4c3e] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-5 sm:p-6">
          <p className="text-xs tracking-[0.2em] text-[#7a5c32]">GET UPDATES</p>
          <h3 className="mt-2 font-serif text-2xl text-[#2b2218]">Stay connected with KIAN Privé</h3>
          <p className="mt-2 text-sm text-[#6f6251]">
            Join our list for wellness insights, retreat launches, exclusive offers, and event announcements. We only
            email with your permission.
          </p>
          <form className="mt-4 space-y-3" onSubmit={onSubscribe}>
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                className="min-w-[230px] flex-1 rounded-sm border border-[#e4d9c8] bg-white p-3 text-sm text-[#2b2218]"
              />
              <button type="submit" className="rounded-sm bg-[#8a682e] px-5 py-2 text-[11px] tracking-[0.16em] text-white">
                SUBSCRIBE
              </button>
            </div>
            <label className="flex items-start gap-2 text-xs text-[#5f5344]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-4 accent-[#8a682e]"
              />
              <span>
                I agree to receive marketing emails from KIAN Privé. I can{" "}
                <Link href="/email-preferences" className="underline underline-offset-2 hover:text-[#8f6f3e]">
                  opt out anytime
                </Link>
                .
              </span>
            </label>
            {error ? <p className="text-xs text-[#a33]">{error}</p> : null}
            {status ? <p className="text-xs text-[#2e7d32]">{status}</p> : null}
          </form>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image src="/images/kian-prive-logo.png" alt="KIAN Privé logo" width={120} height={96} className="h-14 w-auto object-contain" />
            <p className="mt-4 text-xs tracking-[0.2em] text-[#7a5c32]">CONCIERGE WELLNESS</p>
            <p className="mt-2 text-sm">Private. Precise. Performance-centered care for elite outcomes.</p>
          </div>

          <div>
            <p className="text-sm font-medium text-[#3f3327]">Company</p>
            <div className="mt-3 space-y-2 text-sm">
              <Link href="/what-we-do" className="block hover:text-[#8f6f3e] hover:underline">
                What We Do
              </Link>
              <Link href="/about" className="block hover:text-[#8f6f3e] hover:underline">
                About
              </Link>
              <Link href="/corporate-wellness" className="block hover:text-[#8f6f3e] hover:underline">
                Corporate Wellness
              </Link>
              <Link href="/blog" className="block hover:text-[#8f6f3e] hover:underline">
                Blog
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[#3f3327]">Services</p>
            <div className="mt-3 space-y-2 text-sm">
              <Link href="/services" className="block hover:text-[#8f6f3e] hover:underline">
                Privé Services
              </Link>
              <Link href="/icoone-training" className="block hover:text-[#8f6f3e] hover:underline">
                Icoone Training
              </Link>
              <Link href="/practitioners" className="block hover:text-[#8f6f3e] hover:underline">
                Practitioners
              </Link>
              <Link href="/athletes" className="block hover:text-[#8f6f3e] hover:underline">
                Athletes
              </Link>
              <Link href="/book-online" className="block hover:text-[#8f6f3e] hover:underline">
                Book Online
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[#3f3327]">Contact</p>
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-[#4f4335]">North Miami Beach, FL</p>
              <p className="text-[#4f4335]">Serving Miami &amp; Miami-Dade</p>
              <a href="tel:3059182570" className="block hover:text-[#7a5c32] hover:underline">
                305-918-2570
              </a>
              <a href="mailto:contact@kianprive.com" className="block hover:text-[#7a5c32] hover:underline">
                contact@kianprive.com
              </a>
              <a
                href="https://www.facebook.com/KIAN4Life/"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#7a5c32] hover:underline"
              >
                Facebook
              </a>
              <a
                href="https://instagram.com/keepingitallnatural"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#7a5c32] hover:underline"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#b78d4b24] pt-4 text-xs text-[#5f5344]">
          <p>© {new Date().getFullYear()} KIAN Privé. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/accessibility" className="hover:text-[#7a5c32] hover:underline">
              Accessibility
            </Link>
            <Link href="/email-preferences" className="hover:text-[#7a5c32] hover:underline">
              Email opt-out
            </Link>
            <Link href="/payment-policies" className="hover:text-[#7a5c32] hover:underline">
              Payment & Policies
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-[#7a5c32] hover:underline">
              Retreats & Events Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
