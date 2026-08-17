import Link from "next/link";
import { PortalSignOut } from "@/components/auth/PortalSignOut";
import { PRIVETHERAPEUTICS_URL } from "@/lib/privetherapeutics";

export default function MemberTherapeuticsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f6f3e]">Members</p>
          <h1 className="mt-2 font-serif text-3xl text-[#1f1a15]">Physician-prescribed therapy</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6f6251]">
            Peptide and compound therapies are not sold in the KIAN shop. Browse the catalog on Privé Therapeutics. A
            KIAN Privé physician prescribes them as part of your wellness plan—both the first order and every refill.
            Sterile water, pen tips, and needles stay in the shop.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="rounded-full border border-[#d8cbb5] px-4 py-2 text-sm">
            Dashboard
          </Link>
          <PortalSignOut />
        </div>
      </div>

      <div className="mt-8 space-y-4 rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-6 text-sm leading-relaxed text-[#5f5344]">
        <p>
          Complete secure clinical intake on Privé Therapeutics so your physician can review your history, labs, and
          goals. If a peptide or compound protocol is appropriate, it is prescribed and fulfilled through your
          plan—not as a retail checkout item.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={PRIVETHERAPEUTICS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-sm bg-[#b78d4b] px-5 text-[11px] tracking-[0.16em] text-white"
          >
            START INTAKE
          </a>
          <Link
            href="/shop"
            className="inline-flex min-h-[44px] items-center rounded-sm border border-[#b78d4b80] px-5 text-[11px] tracking-[0.16em] text-[#3b3024]"
          >
            SHOP SUPPLIES
          </Link>
          <Link
            href="/dashboard/intake"
            className="inline-flex min-h-[44px] items-center rounded-sm border border-[#b78d4b80] px-5 text-[11px] tracking-[0.16em] text-[#3b3024]"
          >
            MY INTAKE
          </Link>
          <Link
            href="/services/glp1-peptides"
            className="inline-flex min-h-[44px] items-center rounded-sm border border-[#b78d4b80] px-5 text-[11px] tracking-[0.16em] text-[#3b3024]"
          >
            LEARN MORE
          </Link>
        </div>
      </div>
    </main>
  );
}
