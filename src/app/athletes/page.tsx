import Link from "next/link";
import { CinematicHero } from "@/components/ui/CinematicHero";
import { pageHeroes } from "@/lib/media/heroes";
import { EditorialSection, editorialCtaPrimary } from "@/components/ui/editorial-primitives";

export default function AthletesPage() {
  return (
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="ATHLETES"
        lineOne="Elite performance."
        lineTwo="Private recovery."
        lineThree="Members only."
        description="This members-only portal provides athlete-specific protocols, recovery frameworks, and performance support resources."
        primaryCta={{ label: "Book Athlete Session", href: "/book-online" }}
        secondaryCta={{ label: "View Membership", href: "/pricing" }}
        imageSrc={pageHeroes.athletes.src}
        imageAlt={pageHeroes.athletes.alt}
      />
      <EditorialSection>
        <p className="max-w-2xl text-[#6f6251]">
          Access is reserved for active members. Book a consultation or unlock membership to explore athlete protocols.
        </p>
        <Link href="/login" className={`mt-6 ${editorialCtaPrimary}`}>
          MEMBER LOGIN
        </Link>
      </EditorialSection>
    </div>
  );
}
