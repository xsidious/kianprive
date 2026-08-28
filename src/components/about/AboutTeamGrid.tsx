"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { editorialCtaSecondary, editorialPanel } from "@/components/ui/editorial-primitives";
import { aboutTeam, type AboutTeamMember } from "@/lib/about-team";

export function AboutTeamGrid() {
  const [selected, setSelected] = useState<AboutTeamMember | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  return (
    <>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {aboutTeam.map((member) => (
          <article key={member.name} className={`${editorialPanel} p-4`}>
            <div
              className="relative aspect-[3/4] overflow-hidden rounded-sm border border-[#e4d9c8]"
              style={{ backgroundColor: member.imageBackground ?? "#f7efe3" }}
            >
              {member.image ? (
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={member.imageClassName ?? "object-cover object-top"}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-serif text-5xl text-[#b78d4b]">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <p className="mt-4 font-serif text-xl text-[#2b2218]">{member.name}</p>
            <p className="text-sm text-[#6f6251]">{member.title}</p>
            <p className="text-xs text-[#8f6f3e]">{member.subtitle}</p>
            {member.bio ? (
              <button type="button" onClick={() => setSelected(member)} className={`${editorialCtaSecondary} mt-4`}>
                VIEW MORE
              </button>
            ) : null}
          </article>
        ))}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#14100bb3] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-bio-title"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="team-bio-title" className="font-serif text-2xl text-[#2b2218]">
                  {selected.name}
                </h3>
                <p className="mt-1 text-sm text-[#6f6251]">{selected.title}</p>
                <p className="text-xs text-[#8f6f3e]">{selected.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-sm border border-[#b78d4b80] px-3 py-1 text-xs tracking-[0.14em] text-[#3b3024]"
              >
                CLOSE
              </button>
            </div>
            {selected.image ? (
              <div
                className="relative mx-auto mt-5 aspect-[3/4] max-w-[220px] overflow-hidden rounded-sm border border-[#e4d9c8]"
                style={{ backgroundColor: selected.imageBackground ?? "#f7efe3" }}
              >
                <Image
                  src={selected.image}
                  alt={selected.name}
                  fill
                  sizes="220px"
                  className={selected.imageClassName ?? "object-cover object-top"}
                />
              </div>
            ) : null}
            {selected.bio ? (
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#5f5344] sm:text-base">
                {(Array.isArray(selected.bio) ? selected.bio : [selected.bio]).map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
