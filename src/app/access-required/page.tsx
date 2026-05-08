"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const copyByTarget: Record<string, { title: string; description: string; loginRedirect: string }> = {
  practitioners: {
    title: "To access the Practitioners page, please log in.",
    description:
      "Practitioner training content is available to authenticated members. Sign in to continue to advanced clinical pathways and resources.",
    loginRedirect: "/practitioners",
  },
  athletes: {
    title: "To access the Athletes page, please log in.",
    description:
      "Athlete recovery and performance protocols are members-only. Sign in to continue and unlock personalized athlete resources.",
    loginRedirect: "/athletes",
  },
};

export default function AccessRequiredPage() {
  const params = useSearchParams();
  const target = params.get("target") ?? "practitioners";

  const content = useMemo(
    () =>
      copyByTarget[target] ?? {
        title: "This page requires login.",
        description: "Please sign in with your member account to continue.",
        loginRedirect: "/dashboard",
      },
    [target],
  );

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full overflow-hidden rounded-3xl border border-[#b78d4b3d] bg-white p-8 shadow-[0_26px_60px_-42px_rgba(66,45,14,0.45)] sm:p-10"
      >
        <motion.div
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#d9bf8f55]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.65, 0.45] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#b78d4b2e]"
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />

        <p className="relative text-xs tracking-[0.22em] text-[#8f6f3e]">MEMBER ACCESS</p>
        <h1 className="relative mt-3 text-3xl text-[#1f1a15] sm:text-4xl">{content.title}</h1>
        <p className="relative mt-4 max-w-3xl text-[#6f6251]">{content.description}</p>

        <div className="relative mt-7 flex flex-wrap gap-3">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(content.loginRedirect)}`}
            className="rounded-full bg-[#b78d4b] px-6 py-3 text-sm text-white"
          >
            Login to Continue
          </Link>
          <Link href="/pricing" className="rounded-full border border-[#b78d4b80] bg-white px-6 py-3 text-sm text-[#3b3024]">
            View Membership
          </Link>
          <Link href="/" className="rounded-full border border-[#b78d4b60] bg-[#fffaf2] px-6 py-3 text-sm text-[#3b3024]">
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
