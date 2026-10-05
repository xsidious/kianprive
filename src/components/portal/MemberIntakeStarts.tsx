import Link from "next/link";
import { CLINICAL_INTAKE_URL } from "@/lib/privetherapeutics";

const forms = [
  {
    title: "Full body wellness intake",
    description: "The compounded wellness form for physician visits and telemedicine. Medications, history, GLP therapy, and contraindications.",
    href: CLINICAL_INTAKE_URL,
    external: true,
    action: "Start wellness intake",
  },
  {
    title: "Icoone lymphatic drainage",
    description: "Complete this before an Icoone appointment. Height, weight, and the protocol are filled in at the visit.",
    href: "/intake/icoone",
    external: false,
    action: "Start Icoone intake",
  },
  {
    title: "Celexo intake",
    description: "Korean exosome therapy intake for microneedling or topical Celexo.",
    href: "/intake/celexo",
    external: false,
    action: "Start Celexo intake",
  },
  {
    title: "Peptide and GLP intake",
    description: "Comprehensive therapeutics intake for peptide and GLP programs.",
    href: "/intake/peptides-glp",
    external: false,
    action: "Start peptide intake",
  },
] as const;

export function MemberIntakeStarts() {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {forms.map((form) => {
        const className = "rounded-2xl border border-[#e7dcc8] bg-[#fcfaf6] p-4 transition hover:border-[#d4c4a8]";
        const body = (
          <>
            <p className="font-serif text-xl text-[#1f1a15]">{form.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#6f6251]">{form.description}</p>
            <p className="mt-3 text-sm text-[#8f6f3e] underline underline-offset-2">{form.action}</p>
          </>
        );
        return form.external ? (
          <a key={form.title} href={form.href} className={className}>
            {body}
          </a>
        ) : (
          <Link key={form.title} href={form.href} className={className}>
            {body}
          </Link>
        );
      })}
    </div>
  );
}

const intakeByService: Record<string, { href: string; label: string; external?: boolean }> = {
  "icoone-laser": { href: "/intake/icoone", label: "Complete the Icoone intake" },
  "microneedling-with-exosomes": { href: "/intake/celexo", label: "Complete the Celexo intake" },
  "glp1-peptides": { href: "/intake/peptides-glp", label: "Complete the peptide intake" },
  telemedicine: { href: CLINICAL_INTAKE_URL, label: "Complete the full body wellness intake", external: true },
  "physician-visit": { href: CLINICAL_INTAKE_URL, label: "Complete the full body wellness intake", external: true },
};

export function intakeLinksForServices(serviceIds: string[]) {
  const seen = new Set<string>();
  return serviceIds.flatMap((id) => {
    const link = intakeByService[id];
    if (!link || seen.has(link.href)) return [];
    seen.add(link.href);
    return [link];
  });
}
