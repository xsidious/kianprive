import Link from "next/link";
import type { ReactNode } from "react";

export const editorialCtaPrimary =
  "inline-flex min-h-[44px] items-center justify-center rounded-sm bg-[#8a682e] px-5 text-[11px] font-medium tracking-[0.18em] text-white transition hover:bg-[#755724] sm:px-6 sm:text-xs";

export const editorialCtaSecondary =
  "inline-flex min-h-[44px] items-center justify-center rounded-sm border border-[#b78d4b80] bg-transparent px-5 text-[11px] font-medium tracking-[0.18em] text-[#3b3024] transition hover:bg-[#fff6e8] sm:px-6 sm:text-xs";

export const editorialCtaGhostLight =
  "inline-flex min-h-[44px] items-center justify-center rounded-sm border border-white/85 bg-transparent px-5 text-[11px] font-medium tracking-[0.18em] text-white transition hover:bg-white/10 sm:px-6 sm:text-xs";

export const editorialPanel =
  "rounded-sm border border-[#e4d9c8] bg-[#fffcf7]";

export const editorialPanelDark =
  "rounded-sm border border-[#c9a86a33] bg-[#221c17]";

export const editorialInput =
  "w-full rounded-sm border border-[#e4d9c8] bg-[#fffaf4] px-3 py-2.5 text-sm text-[#2b2218] outline-none focus:border-[#b78d4b]";

export function EditorialEyebrow({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <p
      className={`flex items-center gap-3 text-[11px] tracking-[0.28em] sm:text-xs ${
        tone === "dark" ? "text-[#c9a86a]" : "text-[#7a5c32]"
      }`}
    >
      <span className={`h-px w-8 ${tone === "dark" ? "bg-[#c9a86a]" : "bg-[#7a5c32]"}`} aria-hidden />
      {children}
    </p>
  );
}

export function EditorialSection({
  id,
  children,
  className = "",
  dark = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16 ${dark ? "bg-[#1a1612] text-[#f7f1e8]" : "bg-[#fffdf9]"} ${className}`}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function EditorialPrimaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${editorialCtaPrimary} ${className}`}>
      {typeof children === "string" ? children.toUpperCase() : children}
    </Link>
  );
}

export function EditorialSecondaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${editorialCtaSecondary} ${className}`}>
      {typeof children === "string" ? children.toUpperCase() : children}
    </Link>
  );
}
