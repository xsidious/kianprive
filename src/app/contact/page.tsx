import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Globe, Mail, MapPin, Phone, Share2 } from "lucide-react";

export default function ContactPage() {
  return (
    <div>
      <SectionWrapper className="pt-14 sm:pt-16 md:pt-18">
        <div className="grid items-center gap-8 rounded-3xl border border-[#b78d4b2e] bg-white p-5 shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)] sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">CONTACT US</p>
            <h1 className="mt-4 text-3xl text-[#1f1a15] sm:text-4xl md:text-5xl">Request Your Private Concierge Wellness Experience</h1>
            <p className="mt-5 max-w-3xl text-[#6f6251]">
              Connect with the KIAN Privé team for private onboarding, membership support, retreat inquiries, and priority booking requests.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/book-online" className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
                Book Online
              </Link>
            </div>
          </div>
          <div className="relative h-[260px] overflow-hidden rounded-3xl border border-[#b78d4b36] sm:h-[320px] md:h-[360px]">
            <Image src="/images/stock/hero-luxury-clinic.jpg" alt="Contact KIAN Privé concierge team" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-[#b78d4b2d] bg-white p-6 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
            <h2 className="text-2xl text-[#1f1a15]">Send us a message</h2>
            <form className="mt-5 grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Full name" />
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Email" type="email" />
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Phone" />
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Subject" />
              <textarea className="min-h-[130px] rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 md:col-span-2" placeholder="How can we help?" />
              <button type="button" className="rounded-full bg-[#b78d4b] px-6 py-3 text-white md:col-span-2">
                Send Message
              </button>
            </form>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#b78d4b2e] bg-[#fffaf2] p-4">
                <p className="inline-flex items-center gap-2 text-sm text-[#8f6f3e]"><Mail size={14} /> Email</p>
                <a href="mailto:Contact@KeepingItAllNatural.com" className="mt-1 block text-[#2b2218] hover:text-[#8f6f3e]">
                  Contact@KeepingItAllNatural.com
                </a>
              </div>
              <div className="rounded-xl border border-[#b78d4b2e] bg-[#fffaf2] p-4">
                <p className="inline-flex items-center gap-2 text-sm text-[#8f6f3e]"><Phone size={14} /> Phone</p>
                <a href="tel:3059182570" className="mt-1 block text-[#2b2218] hover:text-[#8f6f3e]">
                  305-918-2570
                </a>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <a href="https://facebook.com/keepingitallnatural" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#b78d4b3a] bg-white p-2 text-[#8f6f3e]">
                <Globe size={18} />
              </a>
              <a href="https://instagram.com/keepingitallnatural" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#b78d4b3a] bg-white p-2 text-[#8f6f3e]">
                <Share2 size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#b78d4b3a] bg-white p-2 text-[#8f6f3e]">
                <BadgeCheck size={18} />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-[#b78d4b2d] bg-white p-4 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
            <p className="mb-3 inline-flex items-center gap-2 text-sm text-[#8f6f3e]">
              <MapPin size={14} /> Visit Our Wellness Location
            </p>
            <div className="overflow-hidden rounded-2xl border border-[#b78d4b2d]">
              <iframe
                title="KIAN Prive location map"
                src="https://www.google.com/maps?q=Miami%2C%20Florida&output=embed"
                className="h-[300px] w-full sm:h-[380px] lg:h-[460px]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
