"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Could not create account.");
      return;
    }
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-4xl">Create Your Private Account</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input className="w-full rounded-xl border border-[#d7b6764d] bg-[#171310] p-3" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full rounded-xl border border-[#d7b6764d] bg-[#171310] p-3" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-xl border border-[#d7b6764d] bg-[#171310] p-3" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button className="w-full rounded-full bg-[#d7b676] py-3 text-black">Sign Up</button>
      </form>
    </div>
  );
}
