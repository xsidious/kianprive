"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

type TrackResult = {
  referenceId: string;
  fullName: string;
  email: string;
  status: string;
  statusLabel: string;
  statusNote: string | null;
  submittedAt: string;
  updatedAt: string;
  hasAccount: boolean;
  orders: Array<{
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
  }>;
};

function TrackIntakeForm() {
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"track" | "create">("track");

  useEffect(() => {
    const ref = search.get("ref") || search.get("referenceId") || "";
    const em = search.get("email") || "";
    if (ref) setReferenceId(ref);
    if (em) setEmail(em);
  }, [search]);

  async function onTrack(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setResult(null);
    const res = await fetch("/api/intake/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, referenceId }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "Could not find that request.");
      return;
    }
    setResult(data.intake as TrackResult);
  }

  async function onCreateAccount(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/intake/claim-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, referenceId, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "Could not create account.");
      return;
    }
    setMessage(
      data.linkedExisting
        ? "Account updated and linked. You can sign in now."
        : "Account created. You can sign in now.",
    );
    setMode("track");
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-xl px-4 py-16">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f6f3e]">Patient portal</p>
      <h1 className="mt-2 font-serif text-3xl text-[#1f1a15]">Track your intake request</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#6f6251]">
        Use the email and reference ID from your confirmation message. You can also create a member
        account to follow progress in your dashboard.
      </p>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("track")}
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] ${
            mode === "track"
              ? "border-[#8f6f3e] bg-[#8f6f3e] text-white"
              : "border-[#d8cbb5] text-[#6f6251]"
          }`}
        >
          Check status
        </button>
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] ${
            mode === "create"
              ? "border-[#8f6f3e] bg-[#8f6f3e] text-white"
              : "border-[#d8cbb5] text-[#6f6251]"
          }`}
        >
          Create account
        </button>
      </div>

      {mode === "track" ? (
        <form onSubmit={onTrack} className="mt-6 space-y-4 rounded-2xl border border-[#e7dcc8] bg-[#fcfaf6] p-5">
          <label className="block text-xs uppercase tracking-[0.16em] text-[#8f6f3e]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#e0d4c0] bg-white px-3 py-2.5 text-sm text-[#1f1a15]"
            />
          </label>
          <label className="block text-xs uppercase tracking-[0.16em] text-[#8f6f3e]">
            Reference ID
            <input
              required
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#e0d4c0] bg-white px-3 py-2.5 text-sm text-[#1f1a15]"
              placeholder="From your confirmation email"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full border border-[#8f6f3e] bg-[#8f6f3e] px-5 py-2.5 text-sm text-white disabled:opacity-60"
          >
            {busy ? "Checking…" : "Check status"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={onCreateAccount}
          className="mt-6 space-y-4 rounded-2xl border border-[#e7dcc8] bg-[#fcfaf6] p-5"
        >
          <p className="text-sm text-[#6f6251]">
            Create a member login using the same email that submitted the intake.
          </p>
          <label className="block text-xs uppercase tracking-[0.16em] text-[#8f6f3e]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#e0d4c0] bg-white px-3 py-2.5 text-sm text-[#1f1a15]"
            />
          </label>
          <label className="block text-xs uppercase tracking-[0.16em] text-[#8f6f3e]">
            Reference ID
            <input
              required
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#e0d4c0] bg-white px-3 py-2.5 text-sm text-[#1f1a15]"
            />
          </label>
          <label className="block text-xs uppercase tracking-[0.16em] text-[#8f6f3e]">
            Choose a password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#e0d4c0] bg-white px-3 py-2.5 text-sm text-[#1f1a15]"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full border border-[#8f6f3e] bg-[#8f6f3e] px-5 py-2.5 text-sm text-white disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
      )}

      {message ? <p className="mt-4 text-sm text-[#1b6568]">{message}</p> : null}

      {result ? (
        <section className="mt-8 space-y-3 rounded-2xl border border-[#e7dcc8] bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Current status</p>
          <h2 className="font-serif text-2xl text-[#1f1a15]">{result.statusLabel}</h2>
          <p className="text-sm text-[#6f6251]">
            {result.fullName} · Ref {result.referenceId}
          </p>
          {result.statusNote ? (
            <p className="rounded-lg border border-[#e7dcc8] bg-[#fcfaf6] px-3 py-2 text-sm text-[#1f1a15]">
              Provider note: {result.statusNote}
            </p>
          ) : null}
          <p className="text-xs text-[#8a7d6c]">
            Submitted {new Date(result.submittedAt).toLocaleString()} · Updated{" "}
            {new Date(result.updatedAt).toLocaleString()}
          </p>
          {result.orders.length > 0 ? (
            <div className="pt-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8f6f3e]">Linked orders</p>
              <ul className="mt-2 space-y-1 text-sm text-[#1f1a15]">
                {result.orders.map((order) => (
                  <li key={order.orderNumber}>
                    {order.orderNumber} — {order.paymentStatus} / {order.status}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-2">
            {result.hasAccount ? (
              <Link
                href="/login?callbackUrl=/dashboard/intake"
                className="rounded-full border border-[#8f6f3e] bg-[#8f6f3e] px-4 py-2 text-sm text-white"
              >
                Sign in to dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setMode("create")}
                className="rounded-full border border-[#8f6f3e] px-4 py-2 text-sm text-[#8f6f3e]"
              >
                Create account to track online
              </button>
            )}
            <Link href="/shop" className="rounded-full border border-[#d8cbb5] px-4 py-2 text-sm text-[#6f6251]">
              Visit shop
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default function TrackIntakePage() {
  return (
    <Suspense fallback={<main className="px-4 py-16 text-center text-sm text-[#6f6251]">Loading…</main>}>
      <TrackIntakeForm />
    </Suspense>
  );
}
