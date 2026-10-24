"use client";

import { useState } from "react";
import Link from "next/link";

export function GetUpdatesSection() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (!consent) {
      setStatus("error");
      setMessage("Please confirm you want marketing emails before subscribing.");
      return;
    }
    const res = await fetch("/api/email-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        action: "subscribe",
        marketingConsent: true,
        source: "get-updates",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error || "Could not subscribe.");
      return;
    }
    setStatus("done");
    setMessage(data.message || "Thank you — you are on the list.");
    setEmail("");
    setConsent(false);
  }

  return (
    <div className="rounded-sm border border-[#e4d9c8] bg-[linear-gradient(180deg,#fffdf9_0%,#fff6e8_100%)] p-6 sm:p-10">
      <p className="text-xs tracking-[0.22em] text-[#7a5c32]">GET UPDATES</p>
      <h2 className="mt-2 font-serif text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Stay connected with KIAN Privé</h2>
      <p className="mt-3 max-w-2xl text-[#6f6251]">
        Join our list for wellness insights, retreat launches, exclusive offers, and event announcements. We only email
        with your permission.
      </p>
      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
        <div className="flex flex-wrap gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            type="email"
            required
            autoComplete="email"
            className="min-w-[220px] flex-1 rounded-sm border border-[#e4d9c8] bg-white p-3 text-sm text-[#2b2218]"
          />
          <button type="submit" className="rounded-sm bg-[#8a682e] px-6 py-3 text-[11px] tracking-[0.16em] text-white">
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
      </form>
      {message ? (
        <p className={`mt-3 text-sm ${status === "error" ? "text-[#a33]" : "text-[#2e7d32]"}`}>{message}</p>
      ) : (
        <p className="mt-3 text-xs text-[#5f5344]">
          Unsubscribe anytime via{" "}
          <Link href="/email-preferences" className="underline underline-offset-2 hover:text-[#8f6f3e]">
            email preferences
          </Link>
          .
        </p>
      )}
    </div>
  );
}
