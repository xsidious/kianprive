"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { IntakeMessageThread } from "@/components/intake/IntakeMessageThread";

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
    if (ref) setReferenceId(ref.toUpperCase());
    if (em) setEmail(em);
  }, [search]);

  useEffect(() => {
    const ref = search.get("ref") || search.get("referenceId") || "";
    const em = search.get("email") || "";
    if (!ref || !em) return;
    let cancelled = false;
    void (async () => {
      setBusy(true);
      setMessage("");
      const res = await fetch("/api/intake/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em, referenceId: ref }),
      });
      const data = await res.json();
      if (cancelled) return;
      setBusy(false);
      if (!res.ok) {
        setMessage(data.error || "Could not find that request.");
        return;
      }
      setResult(data.intake as TrackResult);
    })();
    return () => {
      cancelled = true;
    };
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
        Use the email and request code from your confirmation (example: KP-7F3A-9C2E). Tracking links
        from your thank-you page already carry these for you.
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
            Request code
            <input
              required
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value.toUpperCase())}
              className="mt-1.5 w-full rounded-lg border border-[#e0d4c0] bg-white px-3 py-2.5 font-mono text-sm tracking-[0.12em] text-[#1f1a15]"
              placeholder="KP-XXXX-XXXX"
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
            Request code
            <input
              required
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value.toUpperCase())}
              className="mt-1.5 w-full rounded-lg border border-[#e0d4c0] bg-white px-3 py-2.5 font-mono text-sm tracking-[0.12em] text-[#1f1a15]"
              placeholder="KP-XXXX-XXXX"
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
            {result.fullName} · <span className="font-mono tracking-[0.12em]">{result.referenceId}</span>
          </p>
          {result.statusNote ? (
            <p className="rounded-lg border border-[#e7dcc8] bg-[#fcfaf6] px-3 py-2 text-sm text-[#1f1a15]">
              Latest clinical note: {result.statusNote}
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

      {result ? (
        <div className="mt-6">
          <IntakeMessageThread
            title="Messages on this request"
            hint="Your clinical team can ask for labs or documents here. Reply on this same request."
            placeholder="Type your reply for the clinical team…"
            submitLabel="Send reply"
            reloadKey={result.referenceId}
            loadMessages={async () => {
              const res = await fetch(
                `/api/intake/messages?email=${encodeURIComponent(email)}&referenceId=${encodeURIComponent(referenceId)}`,
              );
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Could not load messages.");
              return data.messages ?? [];
            }}
            sendMessage={async (body) => {
              const res = await fetch("/api/intake/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, referenceId, body }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Could not send reply.");
              return data.message;
            }}
          />
        </div>
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
