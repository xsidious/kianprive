import type { Metadata } from "next";
import Link from "next/link";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { EditorialEyebrow, EditorialSection } from "@/components/ui/editorial-primitives";

export const metadata: Metadata = buildSeoMetadata({
  title: "Accessibility",
  description:
    "KIAN Privé accessibility commitment, on-site tools, and how to request assistance or accommodations.",
  canonicalPath: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <EditorialSection>
      <EditorialEyebrow>ACCESSIBILITY</EditorialEyebrow>
      <h1 className="mt-3 font-serif text-4xl text-[#1f1a15] md:text-5xl">Our accessibility commitment</h1>
      <div className="mt-8 max-w-3xl space-y-5 text-sm leading-relaxed text-[#5f5344]">
        <p>
          KIAN Privé is committed to providing a website experience that is usable by as many people as possible,
          including visitors who use assistive technologies. We work toward WCAG 2.1 Level AA guidelines as a practical
          target and continue improving pages as we update the site.
        </p>
        <p>
          Use the <strong className="font-medium text-[#3b3024]">Accessibility</strong> tab on any page to enlarge text,
          increase contrast, underline links, or reduce motion. Those preferences stay on this device.
        </p>
        <p>
          If you need help using this site, booking care, or receiving information in an alternate format, contact us:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Email{" "}
            <a className="text-[#8f6f3e] underline underline-offset-2" href="mailto:contact@kianprive.com">
              contact@kianprive.com
            </a>
          </li>
          <li>
            Phone{" "}
            <a className="text-[#8f6f3e] underline underline-offset-2" href="tel:3059182570">
              305-918-2570
            </a>
          </li>
        </ul>
        <p>
          To stop marketing emails, visit{" "}
          <Link href="/email-preferences" className="text-[#8f6f3e] underline underline-offset-2">
            Email preferences
          </Link>
          . Transactional messages about appointments, orders, or clinical intake may still be sent when needed to
          provide the service you requested.
        </p>
      </div>
    </EditorialSection>
  );
}
