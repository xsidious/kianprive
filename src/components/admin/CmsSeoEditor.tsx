"use client";

import { useState } from "react";

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
    <div className="mt-8">
      <h2 className="text-xl text-[#1f1a15]">Page SEO</h2>
      <p className="mt-1 text-sm text-[#6f6251]">Edit title, description, image, canonical, and noindex without a deploy.</p>
      <div className="mt-4 grid gap-3">
        {pages.map((page) => (
          <article key={page.id} className="rounded-sm border border-[#b78d4b2d] bg-white p-4">
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
                className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm"
              />
              <input
                value={page.seoImage ?? ""}
                onChange={(e) =>
                  setPages((prev) => prev.map((row) => (row.id === page.id ? { ...row, seoImage: e.target.value } : row)))
                }
                placeholder="SEO image path"
                className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm"
              />
              <textarea
                value={page.seoDescription ?? ""}
                onChange={(e) =>
                  setPages((prev) =>
                    prev.map((row) => (row.id === page.id ? { ...row, seoDescription: e.target.value } : row)),
                  )
                }
                placeholder="SEO description"
                className="min-h-[72px] rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm md:col-span-2"
              />
              <input
                value={page.canonicalUrl ?? ""}
                onChange={(e) =>
                  setPages((prev) =>
                    prev.map((row) => (row.id === page.id ? { ...row, canonicalUrl: e.target.value } : row)),
                  )
                }
                placeholder="Canonical URL (optional)"
                className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm"
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
            <button
              type="button"
              onClick={() => void savePage(page)}
              className="mt-3 rounded-sm border border-[#b78d4b80] px-3 py-1.5 text-xs text-[#3b3024]"
            >
              Save SEO
            </button>
          </article>
        ))}
      </div>
      {status ? <p className="mt-3 text-sm text-[#7a5c32]">{status}</p> : null}
    </div>
  );
}
