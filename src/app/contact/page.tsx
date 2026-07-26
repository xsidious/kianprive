import type { Metadata } from "next";
import { BadgeCheck, Globe, Mail, MapPin, Phone, Share2 } from "lucide-react";
import { CinematicHero } from "@/components/ui/CinematicHero";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialInput,
  editorialPanel,
} from "@/components/ui/editorial-primitives";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildSeoMetadata({
  title: "Contact",
  description:
    "Contact KIAN Privé in North Miami Beach — book concierge wellness, membership support, and private consultations. Call 305-918-2570.",
  canonicalPath: "/contact",
});

export default function ContactPage() {
  return (
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="CONTACT US"
        lineOne="Private concierge."
        lineTwo="Direct access."
        lineThree="Always intentional."
        description="Connect with the KIAN Privé team for private onboarding, membership support, retreat inquiries, and priority booking requests."
        primaryCta={{ label: "Book Online", href: "/book-online" }}
        secondaryCta={{ label: "View Services", href: "/services" }}
        imageSrc="/images/stock/hero-luxury-clinic.jpg"
        imageAlt="Contact KIAN Privé concierge team"
        priority={false}
      />

      <EditorialSection>
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className={`${editorialPanel} p-6`}>
            <EditorialEyebrow>MESSAGE</EditorialEyebrow>
            <h2 className="mt-4 font-serif text-2xl text-[#1f1a15]">Send us a message</h2>
            <form className="mt-5 grid gap-4 md:grid-cols-2">
              <input className={editorialInput} placeholder="Full name" />
              <input className={editorialInput} placeholder="Email" type="email" />
              <input className={editorialInput} placeholder="Phone" />
              <input className={editorialInput} placeholder="Subject" />
              <textarea className={`min-h-[130px] ${editorialInput} md:col-span-2`} placeholder="How can we help?" />
              <button type="button" className={`${editorialCtaPrimary} md:col-span-2`}>
                SEND MESSAGE
              </button>
            </form>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className={`${editorialPanel} p-4`}>
                <p className="inline-flex items-center gap-2 text-sm text-[#7a5c32]">
                  <Mail size={14} aria-hidden /> Email
                </p>
                <a href="mailto:contact@kianprive.com" className="mt-1 block text-[#2b2218] hover:text-[#7a5c32]">
                  contact@kianprive.com
                </a>
              </div>
              <div className={`${editorialPanel} p-4`}>
                <p className="inline-flex items-center gap-2 text-sm text-[#7a5c32]">
                  <Phone size={14} aria-hidden /> Phone
                </p>
                <a href="tel:3059182570" className="mt-1 block text-[#2b2218] hover:text-[#7a5c32]">
                  305-918-2570
                </a>
              </div>
            </div>
            <p className="mt-4 text-sm text-[#4f4335]">North Miami Beach, FL · Serving Miami &amp; Miami-Dade</p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://www.facebook.com/KIAN4Life/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="KIAN Privé on Facebook"
                className="rounded-sm border border-[#b78d4b3a] bg-white p-2 text-[#7a5c32]"
              >
                <Globe size={18} aria-hidden />
              </a>
              <a
                href="https://instagram.com/keepingitallnatural"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="KIAN Privé on Instagram"
                className="rounded-sm border border-[#b78d4b3a] bg-white p-2 text-[#7a5c32]"
              >
                <Share2 size={18} aria-hidden />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="KIAN Privé on LinkedIn"
                className="rounded-sm border border-[#b78d4b3a] bg-white p-2 text-[#7a5c32]"
              >
                <BadgeCheck size={18} aria-hidden />
              </a>
            </div>
          </div>

          <div className={`${editorialPanel} p-4`}>
            <p className="mb-3 inline-flex items-center gap-2 text-sm text-[#7a5c32]">
              <MapPin size={14} aria-hidden /> Visit Our Wellness Location
            </p>
            <div className="overflow-hidden rounded-sm border border-[#e4d9c8]">
              <iframe
                title="KIAN Privé location map — North Miami Beach, Florida"
                src="https://www.google.com/maps?q=North%20Miami%20Beach%2C%20Florida&output=embed"
                className="h-[300px] w-full sm:h-[380px] lg:h-[460px]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </EditorialSection>
    </div>
  );
}
