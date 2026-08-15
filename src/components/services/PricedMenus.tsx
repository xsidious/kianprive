import Link from "next/link";
import type { PricedMenuItem, IvDripItem, LabPanelMenuItem } from "@/lib/services/pricing-menus";
import { formatUsd } from "@/lib/services/pricing-menus";

export function ServiceJumpNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  return (
    <nav aria-label="Service categories" className="flex flex-wrap gap-2">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="inline-flex min-h-[40px] items-center rounded-sm border border-[#e4d9c8] bg-white px-3 text-[11px] tracking-[0.16em] text-[#3b3024] transition hover:border-[#b78d4b] hover:text-[#8a682e]"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export function SectionCtaBar({
  bookHref,
  detailsHref,
  bookLabel = "Book this service",
  detailsLabel = "View details",
}: {
  bookHref: string;
  detailsHref?: string;
  bookLabel?: string;
  detailsLabel?: string;
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href={bookHref}
        className="inline-flex min-h-[44px] items-center rounded-sm bg-[#b78d4b] px-5 text-[11px] tracking-[0.18em] text-white transition hover:bg-[#a67d42]"
      >
        {bookLabel.toUpperCase()}
      </Link>
      {detailsHref ? (
        <Link
          href={detailsHref}
          className="inline-flex min-h-[44px] items-center rounded-sm border border-[#b78d4b80] px-5 text-[11px] tracking-[0.18em] text-[#3b3024] transition hover:bg-[#fff6e8]"
        >
          {detailsLabel.toUpperCase()}
        </Link>
      ) : null}
    </div>
  );
}

export function PricedMenuTable({
  title,
  items,
  footnote,
  bookHref,
}: {
  title: string;
  items: PricedMenuItem[];
  footnote?: string;
  bookHref?: string;
}) {
  return (
    <div>
      <h3 className="font-serif text-2xl text-[#1f1a15] sm:text-[1.65rem]">{title}</h3>
      <div className="mt-5 overflow-hidden rounded-sm border border-[#e8dfd0]">
        <div className="grid grid-cols-[1fr_auto_auto] bg-[#2b2218] px-4 py-3 text-[11px] tracking-[0.18em] text-white">
          <span>SERVICE</span>
          <span className="px-3 text-right">GUEST</span>
          <span className="text-right">MEMBER</span>
        </div>
        <ul>
          {items.map((item, index) => (
            <li
              key={item.name}
              className={`grid grid-cols-[1fr_auto_auto] items-baseline gap-3 border-t border-[#e8dfd0] px-4 py-3.5 ${
                index % 2 === 1 ? "bg-[#f5efe4]" : "bg-[#fffdf9]"
              }`}
            >
              <div>
                <p className="font-serif text-[15px] text-[#2b2218]">{item.name}</p>
                {item.note ? <p className="mt-1 text-xs text-[#8a7a66]">{item.note}</p> : null}
              </div>
              <p className="px-3 text-right text-sm font-medium text-[#3b3024]">{formatUsd(item.guest)}</p>
              <p className="text-right text-sm text-[#8f6f3e]">
                {item.member === 0 ? "Included" : formatUsd(item.member)}
              </p>
            </li>
          ))}
        </ul>
      </div>
      {footnote ? <p className="mt-3 text-xs leading-relaxed text-[#8a7a66]">{footnote}</p> : null}
      {bookHref ? (
        <Link
          href={bookHref}
          className="mt-4 inline-flex min-h-[44px] items-center text-sm font-medium text-[#b78d4b] underline underline-offset-4"
        >
          Book {title.toLowerCase()} →
        </Link>
      ) : null}
    </div>
  );
}

export function IvPricingTable({
  title,
  items,
}: {
  title: string;
  items: IvDripItem[];
}) {
  return (
    <div className="overflow-x-auto">
      <h3 className="font-serif text-2xl text-[#1f1a15] sm:text-[1.65rem]">{title}</h3>
      <div className="mt-5 min-w-[640px] overflow-hidden rounded-sm border border-[#e8dfd0]">
        <div className="grid grid-cols-[1.4fr_repeat(4,0.7fr)] bg-[#2b2218] px-4 py-3 text-[10px] tracking-[0.16em] text-white sm:text-[11px]">
          <span>TREATMENT</span>
          <span className="text-right">NON-MEMBER</span>
          <span className="text-right">2× · 10%</span>
          <span className="text-right">3× · 15%</span>
          <span className="text-right">4× / MEMBER</span>
        </div>
        <ul>
          {items.map((item, index) => (
            <li
              key={item.name}
              className={`grid grid-cols-[1.4fr_repeat(4,0.7fr)] items-center border-t border-[#e8dfd0] px-4 py-3 ${
                index % 2 === 1 ? "bg-[#f5efe4]" : "bg-[#fffdf9]"
              }`}
            >
              <p className="font-serif text-[15px] text-[#2b2218]">{item.name}</p>
              <p className="text-right text-sm text-[#3b3024]">{formatUsd(item.retail)}</p>
              <p className="text-right text-sm text-[#5f5344]">{formatUsd(item.save10)}</p>
              <p className="text-right text-sm text-[#5f5344]">{formatUsd(item.save15)}</p>
              <p className="text-right text-sm font-medium text-[#8f6f3e]">{formatUsd(item.save20)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function LabPanelCards({
  panels,
  eyebrow,
}: {
  panels: LabPanelMenuItem[];
  eyebrow: string;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {panels.map((panel) => (
        <article key={panel.slug} className="flex flex-col rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-6">
          <p className="text-[11px] tracking-[0.22em] text-[#b78d4b]">{eyebrow}</p>
          <h3 className="mt-3 font-serif text-2xl text-[#1f1a15]">{panel.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#6f6251]">{panel.purpose}</p>
          <p className="mt-4 text-xs leading-relaxed text-[#8a7a66]">{panel.tests}</p>
          {panel.note ? <p className="mt-3 text-xs italic text-[#8a7a66]">{panel.note}</p> : null}
          <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#e8dfd0] pt-4">
            <div>
              <p className="text-lg font-medium text-[#1f1a15]">{formatUsd(panel.guest)}</p>
              <p className="text-sm text-[#8f6f3e]">Member {formatUsd(panel.member)}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/services/${panel.slug}`}
                className="inline-flex min-h-[40px] items-center justify-center rounded-sm border border-[#b78d4b80] px-3 text-[10px] tracking-[0.14em] text-[#3b3024]"
              >
                DETAILS
              </Link>
              <Link
                href={`/book-online?service=${panel.slug}`}
                className="inline-flex min-h-[40px] items-center justify-center rounded-sm bg-[#b78d4b] px-3 text-[10px] tracking-[0.14em] text-white"
              >
                ORDER PANEL
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ServicePriceCtaCard({
  eyebrow,
  title,
  description,
  guestPrice,
  memberPrice,
  items,
  detailsHref,
  bookHref,
  bookLabel = "Book now",
}: {
  eyebrow: string;
  title: string;
  description: string;
  guestPrice?: number;
  memberPrice?: number;
  items?: string[];
  detailsHref: string;
  bookHref: string;
  bookLabel?: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-6 sm:p-7">
      <p className="text-[11px] tracking-[0.22em] text-[#b78d4b]">{eyebrow}</p>
      <h3 className="mt-3 font-serif text-2xl text-[#1f1a15] sm:text-[1.75rem]">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-[#6f6251]">{description}</p>
      {guestPrice != null ? (
        <p className="mt-4 text-lg text-[#1f1a15]">
          From {formatUsd(guestPrice)}
          {memberPrice != null ? (
            <span className="ml-2 text-sm text-[#8f6f3e]">
              {memberPrice === 0 ? "· Included for members" : `· Member ${formatUsd(memberPrice)}`}
            </span>
          ) : null}
        </p>
      ) : null}
      {items?.length ? (
        <ul className="mt-4 space-y-2 border-t border-[#e8dfd0] pt-4">
          {items.map((item) => (
            <li key={item} className="text-sm text-[#3b3024]">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={bookHref}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-sm bg-[#b78d4b] px-4 text-[11px] tracking-[0.16em] text-white"
        >
          {bookLabel.toUpperCase()}
        </Link>
        <Link
          href={detailsHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-[#b78d4b80] px-4 text-[11px] tracking-[0.16em] text-[#3b3024]"
        >
          DETAILS
        </Link>
      </div>
    </article>
  );
}
