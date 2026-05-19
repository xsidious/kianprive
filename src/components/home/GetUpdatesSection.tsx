"use client";

import { useState } from "react";

export function GetUpdatesSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="rounded-3xl border border-[#b78d4b30] bg-gradient-to-b from-[#fff8ed] to-[#f1e7d7] p-6 shadow-[0_18px_45px_-35px_rgba(72,49,14,0.45)] sm:p-8">
      <p className="text-xs tracking-[0.22em] text-[#8f6f3e]">GET UPDATES</p>
      <h2 className="mt-2 text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Stay connected with KIAN Privé</h2>
      <p className="mt-3 max-w-2xl text-[#6f6251]">
        Join our list for wellness insights, retreat launches, exclusive offers, and event announcements.
      </p>
      <form
        className="mt-5 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.trim()) return;
          setSubscribed(true);
        }}
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          type="email"
          required
          className="min-w-[220px] flex-1 rounded-xl border border-[#b78d4b35] bg-white p-3 text-sm text-[#2b2218]"
        />
        <button type="submit" className="rounded-full bg-[#b78d4b] px-6 py-3 text-sm text-white">
          Subscribe
        </button>
      </form>
      {subscribed ? (
        <p className="mt-3 text-sm text-[#2e7d32]">Thank you — you&apos;re on the list.</p>
      ) : (
        <p className="mt-3 text-xs text-[#8a7a66]">Unsubscribe anytime. See our terms for privacy details.</p>
      )}
    </div>
  );
}
