"use client";

/** Lightweight CSS fade — no framer-motion on the marketing bundle. */
export function FadeIn({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
