"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });
    if (result?.error) setError("Invalid credentials.");
    if (result?.url) window.location.href = result.url;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#b78d4b2d] bg-white p-6 shadow-[0_28px_70px_-46px_rgba(72,49,14,0.45)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f2dfbf66]" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#ead0a366]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <aside className="rounded-3xl border border-[#b78d4b2e] bg-[linear-gradient(160deg,#fffdfa_20%,#f8efe2_100%)] p-6 sm:p-8">
            <div className="relative h-14 w-14">
              <Image src="/images/kianprivelogo.png" alt="KIAN Privé logo" fill className="object-contain" />
            </div>
            <p className="mt-5 inline-flex rounded-full border border-[#b78d4b5e] bg-white px-4 py-1 text-xs tracking-[0.18em] text-[#8f6f3e]">
              MEMBERS PORTAL
            </p>
            <h1 className="mt-4 text-4xl text-[#1f1a15] sm:text-5xl">Welcome Back</h1>
            <p className="mt-3 max-w-xl text-[#6f6251]">
              Log in to access your private dashboard, premium protocols, orders, and concierge service activity.
            </p>
            <div className="mt-7 grid gap-3 text-sm text-[#5f5344]">
              <p className="rounded-xl border border-[#b78d4b30] bg-white/80 px-4 py-3">Trusted by physicians, med spas, advanced practitioners, clients, and patients.</p>
              <p className="rounded-xl border border-[#b78d4b30] bg-white/80 px-4 py-3">8,000+ hands-on treatment hours behind our education methodology.</p>
              <p className="rounded-xl border border-[#b78d4b30] bg-white/80 px-4 py-3">Secure credential login with role-based premium access.</p>
            </div>
          </aside>

          <div className="rounded-3xl border border-[#b78d4b2e] bg-white p-6 shadow-[0_18px_45px_-35px_rgba(72,49,14,0.45)] sm:p-8">
            <h2 className="text-2xl text-[#1f1a15]">Member Sign In</h2>
            <p className="mt-2 text-sm text-[#6f6251]">Use your account credentials to continue.</p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <input
                className="w-full rounded-xl border border-[#b78d4b3a] bg-[#fffaf4] p-3 text-[#2b2218] outline-none focus:border-[#b78d4b] focus:ring-2 focus:ring-[#b78d4b33]"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full rounded-xl border border-[#b78d4b3a] bg-[#fffaf4] p-3 text-[#2b2218] outline-none focus:border-[#b78d4b] focus:ring-2 focus:ring-[#b78d4b33]"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button className="w-full rounded-full bg-gradient-to-r from-[#b78d4b] to-[#a57b3e] py-3 text-white shadow-[0_12px_28px_-18px_rgba(66,45,14,0.6)]">
                Login
              </button>
            </form>
            <p className="mt-5 text-sm text-[#6f6251]">
              Need an account?{" "}
              <Link href="/signup" className="text-[#8f6f3e] hover:underline">
                Create one here
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
