import type { ReactNode } from "react";
import Link from "next/link";

export function EditorialEyebrow({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <p
      className={`flex items-center gap-3 text-[11px] tracking-[0.28em] sm:text-xs ${
        tone === "dark" ? "text-[#c9a86a]" : "text-[#b78d4b]"
      }`}
    >
      <span className={`h-px w-8 ${tone === "dark" ? "bg-[#c9a86a]" : "bg-[#b78d4b]"}`} aria-hidden />
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
      className={`scroll-mt-40 px-4 py-14 sm:scroll-mt-44 sm:px-6 sm:py-16 ${dark ? "bg-[#1a1612] text-[#f7f1e8]" : "bg-[#fffdf9]"} ${className}`}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function ServiceMenuTable({
  title,
  services,
  footnote,
}: {
  title: string;
  services: string[];
  footnote?: string;
}) {
  return (
    <div>
      <h3 className="font-serif text-2xl text-[#1f1a15] sm:text-[1.65rem]">{title}</h3>
      <div className="mt-5 overflow-hidden rounded-sm border border-[#e8dfd0]">
        <div className="bg-[#2b2218] px-4 py-3 text-[11px] tracking-[0.22em] text-white">SERVICE</div>
        <ul>
          {services.map((service, index) => (
            <li
              key={service}
              className={`border-t border-[#e8dfd0] px-4 py-3.5 font-serif text-[15px] text-[#2b2218] ${
                index % 2 === 1 ? "bg-[#f5efe4]" : "bg-[#fffdf9]"
              }`}
            >
              {service}
            </li>
          ))}
        </ul>
      </div>
      {footnote ? <p className="mt-3 text-xs leading-relaxed text-[#8a7a66]">{footnote}</p> : null}
    </div>
  );
}

export function ProtocolCard({
  eyebrow,
  title,
  items,
  featured = false,
  bookHref,
  bookLabel = "Book now",
}: {
  eyebrow: string;
  title: string;
  items: string[];
  featured?: boolean;
  bookHref?: string;
  bookLabel?: string;
}) {
  return (
    <article
      className={`relative flex h-full flex-col rounded-sm border bg-[#fffcf7] p-6 sm:p-7 ${
        featured ? "border-[#b78d4b]" : "border-[#e4d9c8]"
      }`}
    >
      {featured ? (
        <span className="absolute -top-3 left-6 rounded-sm bg-[#b78d4b] px-3 py-1 text-[10px] tracking-[0.2em] text-white">
          SIGNATURE
        </span>
      ) : null}
      <p className="text-[11px] tracking-[0.22em] text-[#b78d4b]">{eyebrow}</p>
      <h3 className="mt-3 font-serif text-3xl text-[#1f1a15]">{title}</h3>
      <ul className="mt-6 flex-1 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-[#5f5344]">
            <span className="mt-1 text-[#b78d4b]" aria-hidden>
              ✦
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {bookHref ? (
        <Link
          href={bookHref}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-sm bg-[#b78d4b] px-4 text-[11px] tracking-[0.16em] text-white transition hover:bg-[#a67d42]"
        >
          {bookLabel.toUpperCase()}
        </Link>
      ) : null}
    </article>
  );
}

export function WellnessInfoCard({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <article className="rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-6 sm:p-7">
      <p className="text-[11px] tracking-[0.22em] text-[#b78d4b]">{eyebrow}</p>
      <h3 className="mt-3 font-serif text-2xl text-[#1f1a15] sm:text-[1.75rem]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#6f6251]">{description}</p>
      <div className="mt-5 border-t border-[#e8dfd0] pt-4">
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item} className="text-sm text-[#3b3024]">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function PeptideCategoryCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-5 sm:p-6">
      <p className="text-[10px] tracking-[0.22em] text-[#b78d4b]">PEPTIDE CATEGORY</p>
      <h3 className="mt-3 font-serif text-xl text-[#1f1a15]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#6f6251]">{description}</p>
    </article>
  );
}

export function TakeHomeCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-sm border border-[#c9a86a33] bg-[#221c17] p-5 sm:p-6">
      <h3 className="font-serif text-xl text-[#f7f1e8]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#cbbba5]">{description}</p>
    </article>
  );
}

export function EditorialCtaLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-6 inline-flex items-center border border-[#c9a86a] px-5 py-2.5 text-[11px] tracking-[0.2em] text-[#c9a86a] transition hover:bg-[#c9a86a18]"
    >
      {children}
    </Link>
  );
}
