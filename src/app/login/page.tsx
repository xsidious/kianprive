"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialInput,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

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
    <div className="-mt-[1px]">
      <EditorialSection>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <aside className={`${editorialPanel} p-6 sm:p-8`}>
            <div className="relative h-14 w-14">
              <Image src="/images/kianprivelogo.png" alt="KIAN Privé logo" fill className="object-contain" />
            </div>
            <div className="mt-6">
              <EditorialEyebrow>MEMBERS PORTAL</EditorialEyebrow>
            </div>
            <h1 className="mt-4 font-serif text-4xl text-[#1f1a15] sm:text-5xl">Welcome Back</h1>
            <p className="mt-3 max-w-xl text-[#6f6251]">
              Existing approved members can sign in and continue directly to their dashboard and subscription tools.
            </p>
            <div className="mt-7 grid gap-3 text-sm text-[#5f5344]">
              <p className={`${editorialPanel} px-4 py-3`}>Fast access for approved private members.</p>
              <p className={`${editorialPanel} px-4 py-3`}>Secure credential login with role-based access.</p>
              <p className={`${editorialPanel} px-4 py-3`}>Onboarding for new members is consultation-led.</p>
            </div>
          </aside>

          <div className="space-y-4">
            <div className={`${editorialPanel} p-6 sm:p-8`}>
              <h2 className="font-serif text-2xl text-[#1f1a15]">Member Sign In</h2>
              <p className="mt-2 text-sm text-[#6f6251]">Use your approved account credentials to continue.</p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <input
                  className={editorialInput}
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  className={editorialInput}
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error ? <p className="text-sm text-red-500">{error}</p> : null}
                <button type="submit" className={`w-full ${editorialCtaPrimary}`}>
                  LOGIN
                </button>
              </form>
            </div>

            <div className={`${editorialPanel} p-6 sm:p-8`}>
              <h3 className="font-serif text-xl text-[#1f1a15]">No account yet?</h3>
              <p className="mt-2 text-sm text-[#6f6251]">
                New membership accounts are set up after consultation, onboarding fee payment, and approval.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/book-online?service=telemedicine" className={editorialCtaPrimary}>
                  BOOK CONSULTATION
                </Link>
                <Link href="/signup" className={editorialCtaSecondary}>
                  VIEW ONBOARDING STEPS
                </Link>
                <Link href="/pricing" className={editorialCtaSecondary}>
                  MEMBERSHIP PRICING
                </Link>
              </div>
            </div>
          </div>
        </div>
      </EditorialSection>
    </div>
  );
}
