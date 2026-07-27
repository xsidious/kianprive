"use client";

import { useState } from "react";
import { adminBtnPrimary, adminInput, adminPanel, adminTextarea } from "@/components/admin/ui";

type CmsPageSeo = {
  id: string;
  title: string;
  slug: string;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
};

export function CmsSeoEditor({ initialPages }: { initialPages: CmsPageSeo[] }) {
  const [pages, setPages] = useState(initialPages);
  const [status, setStatus] = useState("");

  async function savePage(page: CmsPageSeo) {
    const response = await fetch(`/api/admin/cms/pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: page.title,
        slug: page.slug,
        status: page.status,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        seoImage: page.seoImage,
        canonicalUrl: page.canonicalUrl,
        noIndex: page.noIndex,
        revisionNote: "SEO fields update",
      }),
    });
    setStatus(response.ok ? `Saved SEO for /${page.slug}` : "Failed to save SEO fields.");
  }

  return (
    <section className={`${adminPanel} p-5`}>
      <h2 className="font-serif text-2xl text-[#1f1a15]">Page SEO</h2>
      <p className="mt-1 text-sm text-[#6f6251]">Edit title, description, image, canonical, and noindex without a deploy.</p>
      <div className="mt-4 grid gap-4">
        {pages.map((page) => (
          <article key={page.id} className="rounded-2xl border border-[#efe4d4] bg-[#fffaf3] p-4">
            <p className="text-sm font-medium text-[#1f1a15]">
              {page.title} <span className="text-[#6f6251]">/{page.slug}</span>
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <input
                value={page.seoTitle ?? ""}
                onChange={(e) =>
                  setPages((prev) => prev.map((row) => (row.id === page.id ? { ...row, seoTitle: e.target.value } : row)))
                }
                placeholder="SEO title"
                className={adminInput}
              />
              <input
                value={page.seoImage ?? ""}
                onChange={(e) =>
                  setPages((prev) => prev.map((row) => (row.id === page.id ? { ...row, seoImage: e.target.value } : row)))
                }
                placeholder="SEO image path"
                className={adminInput}
              />
              <textarea
                value={page.seoDescription ?? ""}
                onChange={(e) =>
                  setPages((prev) =>
                    prev.map((row) => (row.id === page.id ? { ...row, seoDescription: e.target.value } : row)),
                  )
                }
                placeholder="SEO description"
                className={`${adminTextarea} md:col-span-2`}
              />
              <input
                value={page.canonicalUrl ?? ""}
                onChange={(e) =>
                  setPages((prev) =>
                    prev.map((row) => (row.id === page.id ? { ...row, canonicalUrl: e.target.value } : row)),
                  )
                }
                placeholder="Canonical URL (optional)"
                className={adminInput}
              />
              <label className="inline-flex items-center gap-2 text-sm text-[#4f4335]">
                <input
                  type="checkbox"
                  checked={page.noIndex}
                  onChange={(e) =>
                    setPages((prev) =>
                      prev.map((row) => (row.id === page.id ? { ...row, noIndex: e.target.checked } : row)),
                    )
                  }
                />
                noIndex
              </label>
            </div>
            <button type="button" onClick={() => void savePage(page)} className={`${adminBtnPrimary} mt-3`}>
              Save SEO
            </button>
          </article>
        ))}
      </div>
      {status ? <p className="mt-3 text-sm text-[#1b6568]">{status}</p> : null}
    </section>
  );
}
