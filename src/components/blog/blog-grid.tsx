"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { BlogPost } from "@/lib/content";

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = useMemo(() => ["All", ...Array.from(new Set(posts.map((post) => post.category)))], [posts]);
  const filtered = useMemo(
    () =>
      posts.filter(
        (p) =>
          (selectedCategory === "All" || p.category === selectedCategory) &&
          (p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.excerpt.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())),
      ),
    [posts, query, selectedCategory],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-[#b78d4b2d] bg-white p-4 lg:sticky lg:top-24">
        <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">CATEGORIES</p>
        <div className="mt-3 grid gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-xl border px-3 py-2 text-left text-sm ${
                selectedCategory === category ? "border-[#b78d4b] bg-[#fff6e8] text-[#8f6f3e]" : "border-[#b78d4b35] bg-white text-[#4f4335]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </aside>

      <div>
      <div className="mb-6 grid gap-3 rounded-2xl border border-[#b78d4b2e] bg-white p-4 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search blog posts..."
          className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3"
        />
        <div className="flex items-center justify-end text-sm text-[#6f6251]">{filtered.length} posts</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((post) => (
          <article
            key={post.slug}
            className="overflow-hidden rounded-3xl border border-[#b78d4b2d] bg-white shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)]"
          >
            <div className="relative h-52">
              <Image src={post.image} alt={post.title} fill className="object-cover" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-xs text-[#8f6f3e]">
                <span>{post.category}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="mt-3 text-2xl text-[#2b2218]">{post.title}</h2>
              <p className="mt-3 text-[#6f6251]">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex rounded-full bg-[#b78d4b] px-4 py-2 text-sm text-white">
                Read Article
              </Link>
            </div>
          </article>
        ))}
      </div>
      </div>
    </div>
  );
}
