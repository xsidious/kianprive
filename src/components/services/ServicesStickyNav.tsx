"use client";

import Link from "next/link";

export function ServicesStickyNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  return (
    <div className="sticky top-[4.25rem] z-30 border-b border-[#e8dfd0] bg-[#fffdf9]/95 backdrop-blur sm:top-[4.75rem]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <nav
          aria-label="Service categories"
          className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex shrink-0 items-center rounded-sm border border-[#e4d9c8] bg-white px-3 py-2 text-[10px] tracking-[0.16em] text-[#3b3024] transition hover:border-[#b78d4b] hover:text-[#8a682e] sm:text-[11px]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <Link
          href="/book-online"
          className="inline-flex shrink-0 items-center rounded-sm bg-[#b78d4b] px-4 py-2 text-[10px] tracking-[0.16em] text-white transition hover:bg-[#a67d42] sm:px-5 sm:text-[11px]"
        >
          BOOK
        </Link>
      </div>
    </div>
  );
}
