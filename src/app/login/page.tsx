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
    <div className="mx-auto grid max-w-5xl gap-8 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="rounded-3xl border border-[#b78d4b2e] bg-white p-8 shadow-[0_18px_45px_-35px_rgba(72,49,14,0.45)]">
        <div className="relative h-14 w-14">
          <Image src="/images/kianprivelogo.png" alt="KIAN Privé logo" fill className="object-contain" />
        </div>
        <h1 className="mt-6 text-4xl text-[#1f1a15]">Member Login</h1>
        <p className="mt-3 text-[#6f6251]">
          Access premium training, subscription content, and your private wellness dashboard.
        </p>
        <div className="mt-8 space-y-3 text-sm text-[#5f5344]">
          <p className="rounded-xl border border-[#b78d4b30] bg-[#fffaf2] px-4 py-3">Trusted by physicians, med spas, and advanced practitioners.</p>
          <p className="rounded-xl border border-[#b78d4b30] bg-[#fffaf2] px-4 py-3">8,000+ hands-on treatment hours behind our education methodology.</p>
          <p className="rounded-xl border border-[#b78d4b30] bg-[#fffaf2] px-4 py-3">Secure credential login with role-based premium access.</p>
        </div>
      </aside>

      <div className="rounded-3xl border border-[#b78d4b2e] bg-white p-8 shadow-[0_18px_45px_-35px_rgba(72,49,14,0.45)]">
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full rounded-xl border border-[#b78d4b3a] bg-[#fffaf4] p-3 text-[#2b2218] outline-none focus:border-[#b78d4b]"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-[#b78d4b3a] bg-[#fffaf4] p-3 text-[#2b2218] outline-none focus:border-[#b78d4b]"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button className="w-full rounded-full bg-[#b78d4b] py-3 text-white shadow-sm">Login</button>
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
  );
}
