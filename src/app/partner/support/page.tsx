import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, conciergeEmail } from "@/lib/contact";
import { partnerEyebrow, partnerMuted, partnerPanel, partnerTitle } from "@/components/partner/ui";

export default async function PartnerSupportPage() {
  const session = await auth();
  const partner = session?.user?.id
    ? await prisma.partnerProfile.findUnique({ where: { userId: session.user.id } })
    : null;

  const name = partner?.displayName ?? session?.user?.name ?? "Partner";
  const code = partner?.partnerCode ? ` (${partner.partnerCode})` : "";
  const whatsapp = buildWhatsAppUrl(
    `Hi KIAN Privé team — partner support from ${name}${code}. I need help with: `,
  );
  const mailto = `mailto:${conciergeEmail}?subject=${encodeURIComponent(
    `Partner support — ${name}${code}`,
  )}&body=${encodeURIComponent(
    `Hello Concierge,\n\nPartner: ${name}${code}\nI need help with:\n\n`,
  )}`;

  return (
    <div className="space-y-6">
      <div>
        <p className={partnerEyebrow}>HELP</p>
        <h1 className={partnerTitle}>Support</h1>
        <p className={partnerMuted}>
          Reach KIAN Privé concierge for payouts, assignments, refunds, or account issues. Partners cannot process
          refunds or manage other accounts — we handle that for you.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className={`${partnerPanel} block p-6 transition hover:border-[#b78d4b80]`}
        >
          <p className="text-xs tracking-[0.16em] text-[#8f6f3e]">WHATSAPP</p>
          <h2 className="mt-2 text-2xl text-[#1f1a15]">Chat with concierge</h2>
          <p className="mt-2 text-sm text-[#6f6251]">Fastest for booking conflicts and same-day questions.</p>
        </a>
        <a href={mailto} className={`${partnerPanel} block p-6 transition hover:border-[#b78d4b80]`}>
          <p className="text-xs tracking-[0.16em] text-[#8f6f3e]">EMAIL</p>
          <h2 className="mt-2 text-2xl text-[#1f1a15]">{conciergeEmail}</h2>
          <p className="mt-2 text-sm text-[#6f6251]">Best for payout documentation and written requests.</p>
        </a>
      </div>

      <section className={`${partnerPanel} p-5`}>
        <h2 className="text-xl text-[#1f1a15]">Common requests</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#4f4335]">
          <li>
            Need a new service or product assignment? Ask admin via{" "}
            <Link href="/partner/support" className="text-[#8f6f3e] underline">
              support
            </Link>{" "}
            — assignments are admin-controlled.
          </li>
          <li>
            Missing a commission? Check{" "}
            <Link href="/partner/earnings" className="text-[#8f6f3e] underline">
              Earnings
            </Link>{" "}
            then contact us with the booking or order number.
          </li>
          <li>
            Client refunds and global site settings are handled by KIAN operations — not available in this portal.
          </li>
        </ul>
      </section>
    </div>
  );
}
