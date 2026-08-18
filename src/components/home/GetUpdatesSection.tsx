"use client";

import { useState } from "react";

export function GetUpdatesSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="rounded-sm border border-[#e4d9c8] bg-[linear-gradient(180deg,#fffdf9_0%,#fff6e8_100%)] p-6 sm:p-10">
      <p className="text-xs tracking-[0.22em] text-[#7a5c32]">GET UPDATES</p>
      <h2 className="mt-2 font-serif text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">Stay connected with KIAN Privé</h2>
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
          className="min-w-[220px] flex-1 rounded-sm border border-[#e4d9c8] bg-white p-3 text-sm text-[#2b2218]"
        />
        <button type="submit" className="rounded-sm bg-[#8a682e] px-6 py-3 text-[11px] tracking-[0.16em] text-white">
          SUBSCRIBE
        </button>
      </form>
      {subscribed ? (
        <p className="mt-3 text-sm text-[#2e7d32]">Thank you — you&apos;re on the list.</p>
      ) : (
        <p className="mt-3 text-xs text-[#5f5344]">Unsubscribe anytime. See our terms for privacy details.</p>
      )}
    </div>
  );
}
