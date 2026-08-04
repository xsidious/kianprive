"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  adminBtnGhost,
  adminEyebrow,
  adminMuted,
  adminTitle,
} from "@/components/admin/ui";

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

export default function ProviderTherapeuticsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/clinical/products");
      if (!res.ok) {
        setError("Could not load clinical catalog.");
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
      const hay = `${p.title} ${p.subcategory ?? ""} ${p.form ?? ""} ${p.strength ?? ""}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
  }, [products, category, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={adminEyebrow}>Clinical</p>
          <h1 className={adminTitle}>Therapeutics library</h1>
          <p className={adminMuted}>
            Browse products as cards. To recommend therapy, open an intake and use Build therapy.
          </p>
        </div>
        <Link href="/provider/intake" className={adminBtnGhost}>
          Intake queue
        </Link>
      </div>

      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-xl border border-[#efe4d4] bg-white">
            <div className="relative h-40 bg-[#f3ebe0]">
              {product.featuredImage ? (
                <Image src={product.featuredImage} alt="" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#8f6f3e]">No image</div>
              )}
            </div>
            <div className="space-y-1 p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
                {product.category || "Clinical"}
                {product.isPrescription ? " · Rx" : ""}
              </p>
              <h2 className="font-serif text-lg text-[#1f1a15]">{product.title}</h2>
              {product.strength || product.form ? (
                <p className="text-xs text-[#6f6251]">
                  {[product.form, product.strength].filter(Boolean).join(" · ")}
                </p>
              ) : null}
              {product.description ? (
                <p className="line-clamp-2 text-sm text-[#5f5344]">{product.description}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && !error ? <p className="text-sm text-[#6f6251]">No products in this view.</p> : null}
    </div>
  );
}
