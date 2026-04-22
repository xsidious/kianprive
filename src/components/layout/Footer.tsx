import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-[#b78d4b33] bg-[#f3ece0] px-4 py-12 text-[#5a4c3e] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image src="/images/kianprivelogo.png" alt="KIAN Privé logo" width={58} height={58} />
            <p className="mt-4 text-xs tracking-[0.2em] text-[#8f6f3e]">CONCIERGE WELLNESS</p>
            <p className="mt-2 text-sm">Private. Precise. Performance-centered care for elite outcomes.</p>
          </div>

          <div>
            <p className="text-sm font-medium text-[#3f3327]">Company</p>
            <div className="mt-3 space-y-2 text-sm">
              <Link href="/what-we-do" className="block hover:text-[#8f6f3e] hover:underline">
                What We Do
              </Link>
              <Link href="/about" className="block hover:text-[#8f6f3e] hover:underline">
                About
              </Link>
              <Link href="/corporate-wellness" className="block hover:text-[#8f6f3e] hover:underline">
                Corporate Wellness
              </Link>
              <Link href="/blog" className="block hover:text-[#8f6f3e] hover:underline">
                Blog
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[#3f3327]">Services</p>
            <div className="mt-3 space-y-2 text-sm">
              <Link href="/services" className="block hover:text-[#8f6f3e] hover:underline">
                Privée Services
              </Link>
              <Link href="/icoone-training" className="block hover:text-[#8f6f3e] hover:underline">
                Icoone Training
              </Link>
              <Link href="/practitioners" className="block hover:text-[#8f6f3e] hover:underline">
                Practitioners
              </Link>
              <Link href="/athletes" className="block hover:text-[#8f6f3e] hover:underline">
                Athletes
              </Link>
              <Link href="/book-online" className="block hover:text-[#8f6f3e] hover:underline">
                Book Online
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[#3f3327]">Contact</p>
            <div className="mt-3 space-y-2 text-sm">
              <a href="tel:3059182570" className="block hover:text-[#8f6f3e] hover:underline">
                305-918-2570
              </a>
              <a href="mailto:Contact@KeepingItAllNatural.com" className="block hover:text-[#8f6f3e] hover:underline">
                Contact@KeepingItAllNatural.com
              </a>
              <a
                href="https://facebook.com/keepingitallnatural"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#8f6f3e] hover:underline"
              >
                Facebook
              </a>
              <a
                href="https://instagram.com/keepingitallnatural"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#8f6f3e] hover:underline"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#b78d4b24] pt-4 text-xs text-[#7d6d58]">
          <p>© {new Date().getFullYear()} KIAN Privé. All rights reserved.</p>
          <Link href="/terms-and-conditions" className="hover:text-[#8f6f3e] hover:underline">
            Terms, Privacy & Guarantees
          </Link>
        </div>
      </div>
    </footer>
  );
}
