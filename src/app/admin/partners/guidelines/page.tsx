"use client";

import { useEffect, useState } from "react";
import { PeptideGuidelinesLibrary } from "@/components/partners/PeptideGuidelinesLibrary";
import { PEPTIDE_GUIDELINES, PEPTIDE_LIBRARY_TITLE } from "@/lib/partners/peptide-guidelines-data";

type Partner = { id: string; displayName: string };
type Guideline = {
  id: string;
  title: string;
  category: string;
  version: string;
  publishedAt: string | null;
  requiresAck: boolean;
  grants: { allPartners: boolean; partnerId: string | null }[];
};

export default function AdminPartnerGuidelinesPage() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [status, setStatus] = useState("");
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [grantAll, setGrantAll] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function load() {
    const [gRes, pRes] = await Promise.all([
      fetch("/api/admin/partners/guidelines"),
      fetch("/api/admin/partners"),
    ]);
    if (gRes.ok) {
      const payload = (await gRes.json()) as { guidelines: Guideline[] };
      setGuidelines(payload.guidelines);
    }
    if (pRes.ok) {
      const payload = (await pRes.json()) as { partners: Partner[] };
      setPartners(payload.partners);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function publishPeptideLibrary() {
    setPublishing(true);
    setStatus("");
    const res = await fetch("/api/admin/partners/guidelines/peptides", { method: "POST" });
    const payload = (await res.json()) as { ok?: boolean; protocols?: number; error?: string };
    setStatus(
      res.ok
        ? `Peptide library published (${payload.protocols ?? PEPTIDE_GUIDELINES.length} protocols) and granted to all partners.`
        : payload.error ?? "Failed to publish peptide library.",
    );
    if (res.ok) await load();
    setPublishing(false);
  }

  async function createGuideline(formData: FormData) {
    const res = await fetch("/api/admin/partners/guidelines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(formData.get("title") || ""),
        category: String(formData.get("category") || "GENERAL"),
        body: String(formData.get("body") || ""),
        documentUrl: String(formData.get("documentUrl") || ""),
        version: String(formData.get("version") || "1.0"),
        requiresAck: formData.get("requiresAck") === "on",
        publish: formData.get("publish") === "on",
        grantAllPartners: grantAll,
        partnerIds: selectedPartners,
      }),
    });
    setStatus(res.ok ? "Guideline saved." : "Failed to save guideline.");
    if (res.ok) {
      setSelectedPartners([]);
      setGrantAll(false);
      await load();
    }
  }

  const libraryPublished = guidelines.some((g) => g.title === PEPTIDE_LIBRARY_TITLE);
  const otherGuidelines = guidelines.filter(
    (g) => g.title !== PEPTIDE_LIBRARY_TITLE && !g.title.startsWith("Peptide Protocol:"),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl text-[#1f1a15]">Partner Guidelines</h1>
          <p className="mt-2 text-[#6f6251]">
            Publish peptide clinical protocols and assign guidelines to partners.
          </p>
        </div>
        <button
          type="button"
          disabled={publishing}
          onClick={() => void publishPeptideLibrary()}
          className="rounded-sm bg-[#b78d4b] px-5 py-3 text-sm text-white disabled:opacity-60"
        >
          {publishing
            ? "Publishing…"
            : libraryPublished
              ? "Refresh peptide library → all partners"
              : "Publish peptide library → all partners"}
        </button>
      </div>
      {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}

      <section className="rounded-sm border border-[#b78d4b2d] bg-[#fffaf4] p-5">
        <p className="text-xs tracking-[0.16em] text-[#8f6f3e]">WELLNESS TECH</p>
        <h2 className="mt-1 text-2xl text-[#1f1a15]">{PEPTIDE_LIBRARY_TITLE}</h2>
        <p className="mt-2 text-sm text-[#6f6251]">
          {PEPTIDE_GUIDELINES.length} protocols · search, category filters, export PDF ·{" "}
          {libraryPublished ? "published & granted to all partners" : "not published yet"}
        </p>
      </section>

      <PeptideGuidelinesLibrary eyebrow="ADMIN PREVIEW" />

      <section className="rounded-sm border border-[#b78d4b2d] bg-white p-5">
        <h2 className="text-xl">Create custom guideline</h2>
        <form action={createGuideline} className="mt-4 grid gap-3">
          <input name="title" placeholder="Title" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <select name="category" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" defaultValue="PEPTIDES">
            <option value="PEPTIDES">Peptides</option>
            <option value="GLP">GLP</option>
            <option value="CLINICAL">Clinical</option>
            <option value="OPERATIONS">Operations</option>
            <option value="GENERAL">General</option>
          </select>
          <textarea name="body" placeholder="Guideline body" className="min-h-[120px] rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <input name="documentUrl" placeholder="Document URL (optional)" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <input name="version" defaultValue="1.0" className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="requiresAck" /> Requires acknowledgment
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="publish" defaultChecked /> Publish now
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={grantAll} onChange={(e) => setGrantAll(e.target.checked)} /> Grant to all
            partners
          </label>
          {!grantAll ? (
            <div className="max-h-40 space-y-1 overflow-auto rounded-sm border border-[#e4d9c8] p-3">
              {partners.map((partner) => (
                <label key={partner.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedPartners.includes(partner.id)}
                    onChange={(e) =>
                      setSelectedPartners((prev) =>
                        e.target.checked ? [...prev, partner.id] : prev.filter((id) => id !== partner.id),
                      )
                    }
                  />
                  {partner.displayName}
                </label>
              ))}
            </div>
          ) : null}
          <button type="submit" className="rounded-sm bg-[#b78d4b] px-5 py-3 text-white">
            Save guideline
          </button>
        </form>
      </section>

      {otherGuidelines.length ? (
        <section className="grid gap-3">
          <h2 className="text-xl text-[#1f1a15]">Other guidelines</h2>
          {otherGuidelines.map((g) => (
            <article key={g.id} className="rounded-sm border border-[#b78d4b2d] bg-white p-4">
              <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">
                {g.category} · v{g.version} · {g.publishedAt ? "Published" : "Draft"}
              </p>
              <h3 className="mt-1 text-xl text-[#1f1a15]">{g.title}</h3>
              <p className="text-sm text-[#6f6251]">
                Grants: {g.grants.some((x) => x.allPartners) ? "All partners" : `${g.grants.length} partner(s)`}
                {g.requiresAck ? " · Ack required" : ""}
              </p>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
