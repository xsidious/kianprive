"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  excerpt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
};

const statuses = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState("");

  async function loadPosts() {
    const response = await fetch("/api/admin/blog/posts");
    if (!response.ok) return;
    const payload = (await response.json()) as { posts: Post[] };
    setPosts(payload.posts);
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  async function savePost(post: Post) {
    const response = await fetch(`/api/admin/blog/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: post.title,
        slug: post.slug,
        status: post.status,
        excerpt: post.excerpt ?? "",
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        seoImage: post.seoImage,
        canonicalUrl: post.canonicalUrl,
        noIndex: post.noIndex,
      }),
    });
    setStatus(response.ok ? "Post updated." : "Failed to update post.");
    if (response.ok) await loadPosts();
  }

  async function deletePost(id: string) {
    const response = await fetch(`/api/admin/blog/posts/${id}`, { method: "DELETE" });
    setStatus(response.ok ? "Post deleted." : "Failed to delete post.");
    if (response.ok) await loadPosts();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-[#1f1a15]">Blog Manager</h1>
        <div className="flex gap-2">
          <Link href="/blog" className="rounded-sm border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">
            Preview Blog
          </Link>
          <Link href="/admin/operations" className="rounded-sm bg-[#b78d4b] px-4 py-2 text-sm text-white">
            New Post
          </Link>
        </div>
      </div>
      <div className="mt-6 grid gap-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-sm border border-[#b78d4b2d] bg-white p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_140px_auto] md:items-start">
              <div>
                <input
                  value={post.title}
                  onChange={(event) =>
                    setPosts((prev) => prev.map((row) => (row.id === post.id ? { ...row, title: event.target.value } : row)))
                  }
                  className="w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2"
                />
                <input
                  value={post.slug}
                  onChange={(event) =>
                    setPosts((prev) => prev.map((row) => (row.id === post.id ? { ...row, slug: event.target.value } : row)))
                  }
                  className="mt-2 w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm"
                />
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <input
                    value={post.seoTitle ?? ""}
                    onChange={(event) =>
                      setPosts((prev) =>
                        prev.map((row) => (row.id === post.id ? { ...row, seoTitle: event.target.value } : row)),
                      )
                    }
                    placeholder="SEO title"
                    className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm"
                  />
                  <input
                    value={post.seoImage ?? ""}
                    onChange={(event) =>
                      setPosts((prev) =>
                        prev.map((row) => (row.id === post.id ? { ...row, seoImage: event.target.value } : row)),
                      )
                    }
                    placeholder="SEO image path"
                    className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm"
                  />
                  <textarea
                    value={post.seoDescription ?? ""}
                    onChange={(event) =>
                      setPosts((prev) =>
                        prev.map((row) => (row.id === post.id ? { ...row, seoDescription: event.target.value } : row)),
                      )
                    }
                    placeholder="SEO description"
                    className="min-h-[64px] rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm md:col-span-2"
                  />
                  <input
                    value={post.canonicalUrl ?? ""}
                    onChange={(event) =>
                      setPosts((prev) =>
                        prev.map((row) => (row.id === post.id ? { ...row, canonicalUrl: event.target.value } : row)),
                      )
                    }
                    placeholder="Canonical URL"
                    className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm"
                  />
                  <label className="inline-flex items-center gap-2 text-sm text-[#4f4335]">
                    <input
                      type="checkbox"
                      checked={Boolean(post.noIndex)}
                      onChange={(event) =>
                        setPosts((prev) =>
                          prev.map((row) => (row.id === post.id ? { ...row, noIndex: event.target.checked } : row)),
                        )
                      }
                    />
                    noIndex
                  </label>
                </div>
              </div>
              <select
                value={post.status}
                onChange={(event) =>
                  setPosts((prev) =>
                    prev.map((row) =>
                      row.id === post.id ? { ...row, status: event.target.value as Post["status"] } : row,
                    ),
                  )
                }
                className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2"
              >
                {statuses.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <Link href={`/blog/${post.slug}`} className="rounded-sm border border-[#b78d4b80] px-3 py-1.5 text-xs text-[#3b3024]">
                  Preview
                </Link>
                <button
                  type="button"
                  onClick={() => void savePost(post)}
                  className="rounded-sm border border-[#b78d4b80] px-3 py-1.5 text-xs text-[#3b3024]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => void deletePost(post.id)}
                  className="rounded-sm border border-[#d07b7b80] px-3 py-1.5 text-xs text-[#7c2c2c]"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {status ? <p className="mt-3 text-sm text-[#7a5c32]">{status}</p> : null}
    </div>
  );
}
