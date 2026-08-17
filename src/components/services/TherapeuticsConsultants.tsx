import { EditorialEyebrow, editorialCtaPrimary, editorialPanel } from "@/components/ui/editorial-primitives";
import { PEPTIDE_CONSULTANTS_HASH, peptideConsultants } from "@/lib/services/peptide-consultants";
import { PRIVETHERAPEUTICS_URL } from "@/lib/privetherapeutics";

export function TherapeuticsConsultants() {
  return (
    <section id={PEPTIDE_CONSULTANTS_HASH} className="scroll-mt-28">
      <EditorialEyebrow>CONSULTANTS</EditorialEyebrow>
      <h2 className="mt-3 font-serif text-2xl text-[#1f1a15] sm:text-3xl">Meet your wellness consultants</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5f5344]">
        Choose a consultant for guidance on peptides, fitness, and nutrition alongside your physician-prescribed plan.
        Then complete intake on Privé Therapeutics so a KIAN Privé physician can review eligibility.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {peptideConsultants.map((consultant) => (
          <article key={consultant.id} className={`${editorialPanel} p-5 sm:p-6`}>
            <h3 className="font-serif text-xl text-[#2b2218]">{consultant.name}</h3>
            <p className="mt-1 text-sm italic text-[#8f6f3e]">{consultant.title}</p>
            {consultant.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="mt-3 text-sm leading-relaxed text-[#5f5344]">
                {paragraph}
              </p>
            ))}
            <div className="mt-5">
              <a href={PRIVETHERAPEUTICS_URL} target="_blank" rel="noreferrer" className={editorialCtaPrimary}>
                START INTAKE
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
