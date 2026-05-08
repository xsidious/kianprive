"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  price: number;
  category?: string | null;
  inventoryQty?: number | null;
  featuredImage?: string | null;
};

const productStatuses = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState("");

  async function loadProducts() {
    const response = await fetch("/api/admin/commerce/products");
    if (!response.ok) return;
    const payload = (await response.json()) as { products: Product[] };
    setProducts(payload.products);
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  async function createProduct(formData: FormData) {
    setStatus("");
    const body = {
      title: String(formData.get("title") || ""),
      slug: String(formData.get("slug") || ""),
      price: Number(formData.get("price") || 0),
      status: String(formData.get("status") || "ACTIVE"),
      category: String(formData.get("category") || "General"),
      featuredImage: String(formData.get("featuredImage") || "/images/beauty.avif"),
      inventoryQty: Number(formData.get("inventoryQty") || 0),
    };
    const response = await fetch("/api/admin/commerce/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setStatus(response.ok ? "Product created." : "Failed to create product.");
    if (response.ok) await loadProducts();
  }

  async function saveProduct(product: Product) {
    const response = await fetch(`/api/admin/commerce/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    setStatus(response.ok ? "Product updated." : "Failed to update product.");
    if (response.ok) await loadProducts();
  }

  async function deleteProduct(id: string) {
    const response = await fetch(`/api/admin/commerce/products/${id}`, { method: "DELETE" });
    setStatus(response.ok ? "Product deleted." : "Failed to delete product.");
    if (response.ok) await loadProducts();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-[#1f1a15]">Products</h1>
        <Link href="/shop" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">
          Preview Shop
        </Link>
      </div>

      <section className="rounded-2xl border border-[#b78d4b2d] bg-white p-5">
        <h2 className="text-xl text-[#1f1a15]">Create Product</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void createProduct(new FormData(event.currentTarget));
          }}
        >
          <input name="title" placeholder="Product title" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <input name="slug" placeholder="Slug" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <input name="price" type="number" step="0.01" placeholder="Price (USD)" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <select name="status" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3">
            {productStatuses.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
          </select>
          <input name="category" placeholder="Category" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <input name="inventoryQty" type="number" placeholder="Inventory quantity" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <input name="featuredImage" placeholder="Featured image URL/path" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 md:col-span-2" />
          <button className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white md:col-span-2">Create Product</button>
        </form>
      </section>

      <section className="grid gap-3">
        {products.map((product) => (
          <article key={product.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <input value={product.title} onChange={(e) => setProducts((prev) => prev.map((row) => row.id === product.id ? { ...row, title: e.target.value } : row))} className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2" />
              <input value={product.slug} onChange={(e) => setProducts((prev) => prev.map((row) => row.id === product.id ? { ...row, slug: e.target.value } : row))} className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2" />
              <input type="number" value={product.price} onChange={(e) => setProducts((prev) => prev.map((row) => row.id === product.id ? { ...row, price: Number(e.target.value) } : row))} className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2" />
              <select value={product.status} onChange={(e) => setProducts((prev) => prev.map((row) => row.id === product.id ? { ...row, status: e.target.value as Product["status"] } : row))} className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2">
                {productStatuses.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
              </select>
              <input value={product.category ?? ""} onChange={(e) => setProducts((prev) => prev.map((row) => row.id === product.id ? { ...row, category: e.target.value } : row))} placeholder="Category" className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2" />
              <input type="number" value={product.inventoryQty ?? 0} onChange={(e) => setProducts((prev) => prev.map((row) => row.id === product.id ? { ...row, inventoryQty: Number(e.target.value) } : row))} placeholder="Inventory" className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2" />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => void saveProduct(product)} className="rounded-full border border-[#b78d4b80] px-3 py-1.5 text-xs text-[#3b3024]">Save Product</button>
              <button onClick={() => void deleteProduct(product.id)} className="rounded-full border border-[#d07b7b80] px-3 py-1.5 text-xs text-[#7c2c2c]">Delete Product</button>
            </div>
          </article>
        ))}
      </section>

      {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}
    </div>
  );
}
