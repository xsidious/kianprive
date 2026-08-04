"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PortalSignOut } from "@/components/auth/PortalSignOut";

type Product = {
  id: string;
  title: string;
  category?: string | null;
  subcategory?: string | null;
  featuredImage?: string | null;
  form?: string | null;
  strength?: string | null;
  isPrescription?: boolean;
  description?: string | null;
};

export default function MemberTherapeuticsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/clinical/products");
      if (!res.ok) {
        setError("Could not load therapeutics catalog. Sign in required.");
        return;
      }
      const data = (await res.json()) as { products: Product[]; categories: string[] };
      setProducts(data.products ?? []);
      setCategories(data.categories ?? []);
    })();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q.trim()) return true;
      return `${p.title} ${p.description ?? ""}`.toLowerCase().includes(q.trim().toLowerCase());
    });
  }, [products, category, q]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f6f3e]">Members</p>
          <h1 className="mt-2 font-serif text-3xl text-[#1f1a15]">Therapeutics catalog</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#6f6251]">
            Browse clinical therapies available through KIAN Privé. Pricing is provided only when your clinician
            recommends a plan for you.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/intake" className="rounded-full border border-[#d8cbb5] px-4 py-2 text-sm">
            My intake
          </Link>
          <Link href="/dashboard" className="rounded-full border border-[#d8cbb5] px-4 py-2 text-sm">
            Dashboard
          </Link>
          <PortalSignOut />
        </div>
      </div>

      {error ? <p className="mt-6 text-sm text-red-700">{error}</p> : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="min-w-[200px] flex-1 rounded-sm border border-[#e4d9c8] bg-white px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-sm border border-[#e4d9c8] bg-white px-3 py-2 text-sm"
        >
          <option value="All">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-2xl border border-[#e7dcc8] bg-white">
            <div className="relative h-40 bg-[#f3ebe0]">
              {product.featuredImage ? (
                <Image src={product.featuredImage} alt="" fill className="object-cover" unoptimized />
              ) : null}
            </div>
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
                {product.category || "Clinical"}
                {product.isPrescription ? " · Rx" : ""}
              </p>
              <h2 className="mt-1 font-serif text-lg text-[#1f1a15]">{product.title}</h2>
              {product.strength || product.form ? (
                <p className="mt-1 text-xs text-[#6f6251]">
                  {[product.form, product.strength].filter(Boolean).join(" · ")}
                </p>
              ) : null}
              {product.description ? (
                <p className="mt-2 line-clamp-3 text-sm text-[#5f5344]">{product.description}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && !error ? <p className="mt-8 text-sm text-[#6f6251]">No products in this view.</p> : null}
    </main>
  );
}
