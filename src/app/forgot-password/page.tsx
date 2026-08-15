"use client";

import Link from "next/link";
import { useState } from "react";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialInput,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setMessage("If that email is on file, a reset link is on its way.");
  }

  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <div className={`${editorialPanel} p-6 sm:p-8`}>
          <EditorialEyebrow>ACCOUNT</EditorialEyebrow>
          <h1 className="mt-4 font-serif text-4xl text-[#1f1a15]">Reset your password</h1>
          <p className="mt-3 max-w-xl text-[#6f6251]">
            Enter the email on your KIAN Privé account. We will send a secure link so you can choose a new password.
          </p>
        </div>
        <form className={`mt-8 space-y-4 ${editorialPanel} p-6`} onSubmit={(e) => void onSubmit(e)}>
          <input
            className={editorialInput}
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {message ? <p className="text-sm text-[#1b6568]">{message}</p> : null}
          <button disabled={loading} className={`w-full ${editorialCtaPrimary}`}>
            {loading ? "SENDING…" : "SEND RESET LINK"}
          </button>
          <Link href="/login" className={editorialCtaSecondary}>
            BACK TO SIGN IN
          </Link>
        </form>
      </EditorialSection>
    </div>
  );
}
