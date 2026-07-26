import Link from "next/link";

const serviceNavLinks = [
  { href: "/services#all-services", label: "Icoone®" },
  { href: "/services#recovery", label: "Recovery" },
  { href: "/services#face-body-wellness", label: "Skincare" },
  { href: "/shop", label: "Products" },
  { href: "/services#compounding-peptides", label: "Peptides" },
  { href: "/services#physician", label: "Wellness" },
  { href: "/services#policies", label: "Policies" },
];

export function ServicesPageNav() {
  return (
    <nav
      aria-label="Service categories"
      className="sticky top-[65px] z-30 border-b border-[#b78d4b22] bg-[#fffdf9]/95 backdrop-blur-sm sm:top-[72px]"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex flex-1 flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-7">
          {serviceNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[10px] tracking-[0.22em] text-[#8a7a66] transition hover:text-[#b78d4b] sm:text-[11px]"
            >
              {link.label.toUpperCase()}
            </Link>
          ))}
        </div>
        <Link
          href="/book-online"
          className="hidden shrink-0 rounded-sm border border-[#b78d4b] px-4 py-2 text-[10px] tracking-[0.2em] text-[#b78d4b] transition hover:bg-[#fff6e8] sm:inline-flex sm:text-[11px]"
        >
          RESERVE
        </Link>
      </div>
    </nav>
  );
}
