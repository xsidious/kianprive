"use client";

import { useState } from "react";
import Link from "next/link";
import { EditorialEyebrow } from "@/components/ui/editorial-primitives";

export default function EmailPreferencesPage() {
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm) {
      setStatus("error");
      setMessage("Confirm that you want to opt out of marketing emails.");
      return;
    }
    setStatus("saving");
    setMessage(null);
    const res = await fetch("/api/email-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, action: "opt_out", source: "email-preferences" }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error || "Could not save your preference.");
      return;
    }
    setStatus("done");
    setMessage(data.message || "You are opted out of marketing emails.");
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <EditorialEyebrow>EMAIL PREFERENCES</EditorialEyebrow>
      <h1 className="mt-3 font-serif text-4xl text-[#1f1a15] md:text-5xl">Opt out of marketing email</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5f5344]">
        Under U.S. law (including CAN-SPAM), we only send promotional email when you have given permission — or when
        another lawful basis applies — and you can opt out at any time. Enter the address you used with KIAN Privé to
        stop marketing messages.
      </p>

      <form onSubmit={onSubmit} className="mt-8 max-w-md space-y-4 rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-6">
        <div>
          <label htmlFor="optout-email" className="text-xs tracking-[0.16em] text-[#7a5c32]">
            EMAIL ADDRESS
          </label>
          <input
            id="optout-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-sm border border-[#e4d9c8] bg-white p-3 text-sm text-[#2b2218]"
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-[#3b3024]">
          <input
            type="checkbox"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
            className="mt-1 size-4 accent-[#8a682e]"
          />
          <span>I want to opt out of KIAN Privé marketing emails and promotional offers.</span>
        </label>
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-sm bg-[#8a682e] px-5 py-3 text-[11px] tracking-[0.16em] text-white disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Confirm opt-out"}
        </button>
        {message ? (
          <p className={`text-sm ${status === "error" ? "text-[#a33]" : "text-[#2e7d32]"}`}>{message}</p>
        ) : null}
      </form>

      <p className="mt-6 max-w-2xl text-xs leading-relaxed text-[#6f6251]">
        Opting out does not cancel appointments or member accounts. We may still send transactional messages (booking
        confirmations, intake updates, receipts, password resets) needed to fulfill a request you made. Questions?{" "}
        <a href="mailto:contact@kianprive.com" className="text-[#8f6f3e] underline underline-offset-2">
          contact@kianprive.com
        </a>
        . See also our{" "}
        <Link href="/accessibility" className="text-[#8f6f3e] underline underline-offset-2">
          accessibility statement
        </Link>
        .
      </p>
    </section>
  );
}
