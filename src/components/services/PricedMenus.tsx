import Link from "next/link";
import type { PricedMenuItem, IvDripItem, LabPanelMenuItem } from "@/lib/services/pricing-menus";
import { formatUsd } from "@/lib/services/pricing-menus";

const primaryCta =
  "inline-flex min-h-[44px] items-center justify-center rounded-sm bg-[#b78d4b] px-5 text-[11px] tracking-[0.16em] text-white transition hover:bg-[#a67d42]";
const secondaryCta =
  "inline-flex min-h-[44px] items-center justify-center rounded-sm border border-[#b78d4b80] px-5 text-[11px] tracking-[0.16em] text-[#3b3024] transition hover:bg-[#fff6e8]";

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="max-w-3xl">
      <p className="flex items-center gap-3 text-[11px] tracking-[0.28em] text-[#b78d4b] sm:text-xs">
        <span className="h-px w-8 bg-[#b78d4b]" aria-hidden />
        {eyebrow}
      </p>
      <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] sm:text-4xl md:text-[2.6rem]">{title}</h2>
      {description ? (
        <p className="mt-4 text-sm leading-relaxed text-[#6f6251] sm:text-base">{description}</p>
      ) : null}
    </header>
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
      <Link href={bookHref} className={primaryCta}>
        {bookLabel.toUpperCase()}
      </Link>
      {detailsHref ? (
        <Link href={detailsHref} className={secondaryCta}>
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
    <div className="flex h-full flex-col rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-5 sm:p-6">
      <h3 className="font-serif text-2xl text-[#1f1a15] sm:text-[1.65rem]">{title}</h3>
      <ul className="mt-5 flex-1 divide-y divide-[#e8dfd0] border-y border-[#e8dfd0]">
        {items.map((item) => (
          <li key={item.name} className="flex items-start justify-between gap-4 py-3.5">
            <div className="min-w-0">
              <p className="font-serif text-[15px] text-[#2b2218]">{item.name}</p>
              {item.note ? <p className="mt-1 text-xs text-[#8a7a66]">{item.note}</p> : null}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-medium text-[#1f1a15]">{formatUsd(item.guest)}</p>
              <p className="text-xs text-[#8f6f3e]">
                {item.member === 0 ? "Included" : `Member ${formatUsd(item.member)}`}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {footnote ? <p className="mt-3 text-xs leading-relaxed text-[#8a7a66]">{footnote}</p> : null}
      {bookHref ? (
        <Link href={bookHref} className={`${primaryCta} mt-5 w-full`}>
          BOOK
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
    <div className="rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-5 sm:p-6">
      <h3 className="font-serif text-2xl text-[#1f1a15] sm:text-[1.65rem]">{title}</h3>
      <ul className="mt-5 divide-y divide-[#e8dfd0] border-y border-[#e8dfd0]">
        {items.map((item) => (
          <li key={item.name} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-serif text-[15px] text-[#2b2218]">{item.name}</p>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
              <p className="font-medium text-[#1f1a15]">{formatUsd(item.retail)}</p>
              <p className="text-[#8f6f3e]">Member {formatUsd(item.save20)}</p>
              <p className="text-xs text-[#8a7a66]">
                2× {formatUsd(item.save10)} · 3× {formatUsd(item.save15)}
              </p>
            </div>
          </li>
        ))}
      </ul>
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
          <p className="mt-4 flex-1 text-xs leading-relaxed text-[#8a7a66]">{panel.tests}</p>
          {panel.note ? <p className="mt-3 text-xs italic text-[#8a7a66]">{panel.note}</p> : null}
          <div className="mt-5 flex flex-col gap-4 border-t border-[#e8dfd0] pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-lg font-medium text-[#1f1a15]">{formatUsd(panel.guest)}</p>
              <p className="text-sm text-[#8f6f3e]">Member {formatUsd(panel.member)}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/services/${panel.slug}`} className={secondaryCta}>
                DETAILS
              </Link>
              <Link href={`/book-online?service=${panel.slug}`} className={primaryCta}>
                ORDER
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
      ) : (
        <p className="mt-4 text-sm text-[#8f6f3e]">Physician consult required</p>
      )}
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
        <Link href={bookHref} className={`${primaryCta} flex-1`}>
          {bookLabel.toUpperCase()}
        </Link>
        <Link href={detailsHref} className={secondaryCta}>
          DETAILS
        </Link>
      </div>
    </article>
  );
}

