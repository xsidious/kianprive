"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSoft,
  adminEyebrow,
  adminInput,
  adminMuted,
  adminPanel,
  adminSelect,
  adminTextarea,
  adminTitle,
  money,
  statusTone,
} from "@/components/admin/ui";

type Variant = {
  id?: string;
  title: string;
  sku?: string | null;
  price: number;
  inventoryQty: number;
  image?: string | null;
  options?: Record<string, string> | null;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  price: number | string;
  category?: string | null;
  inventoryQty?: number | null;
  featuredImage?: string | null;
  galleryImages?: string[];
  hasVariants?: boolean;
  sku?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  variants?: Variant[];
};

const productStatuses = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

const emptyVariant = (): Variant => ({
  title: "",
  sku: "",
  price: 0,
  inventoryQty: 0,
  image: "",
  options: { Size: "", Color: "" },
});

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    status: "ACTIVE",
    category: "General",
    featuredImage: "/images/beauty.avif",
    galleryImages: "",
    inventoryQty: "0",
    sku: "",
    hasVariants: false,
    seoTitle: "",
    seoDescription: "",
    variants: [emptyVariant()] as Variant[],
  });

  async function loadProducts() {
    const response = await fetch("/api/admin/commerce/products");
    if (!response.ok) return;
    const payload = (await response.json()) as { products: Product[] };
    setProducts(payload.products);
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  function openCreate() {
    setEditing(null);
    setDraft({
      title: "",
      slug: "",
      description: "",
      price: "",
      status: "ACTIVE",
      category: "General",
      featuredImage: "/images/beauty.avif",
      galleryImages: "",
      inventoryQty: "0",
      sku: "",
      hasVariants: false,
      seoTitle: "",
      seoDescription: "",
      variants: [emptyVariant()],
    });
    setEditorOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setDraft({
      title: product.title,
      slug: product.slug,
      description: product.description ?? "",
      price: String(product.price),
      status: product.status,
      category: product.category ?? "General",
      featuredImage: product.featuredImage ?? "",
      galleryImages: (product.galleryImages ?? []).join("\n"),
      inventoryQty: String(product.inventoryQty ?? 0),
      sku: product.sku ?? "",
      hasVariants: Boolean(product.hasVariants),
      seoTitle: product.seoTitle ?? "",
      seoDescription: product.seoDescription ?? "",
      variants: product.variants?.length
        ? product.variants.map((v) => ({
            id: v.id,
            title: v.title,
            sku: v.sku ?? "",
            price: Number(v.price),
            inventoryQty: v.inventoryQty,
            image: v.image ?? "",
            options: (v.options as Record<string, string>) ?? { Size: "", Color: "" },
          }))
        : [emptyVariant()],
    });
    setEditorOpen(true);
  }

  async function saveProduct() {
    setStatus("");
    const body = {
      title: draft.title,
      slug: draft.slug,
      description: draft.description,
      price: Number(draft.price || 0),
      status: draft.status,
      category: draft.category,
      featuredImage: draft.featuredImage,
      galleryImages: draft.galleryImages,
      inventoryQty: Number(draft.inventoryQty || 0),
      sku: draft.sku,
      hasVariants: draft.hasVariants,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
      variants: draft.hasVariants
        ? draft.variants
            .filter((v) => v.title.trim())
            .map((v) => ({
              id: v.id,
              title: v.title,
              sku: v.sku || null,
              price: Number(v.price || 0),
              inventoryQty: Number(v.inventoryQty || 0),
              image: v.image || null,
              options: v.options,
            }))
        : [],
    };

    const response = await fetch(editing ? `/api/admin/commerce/products/${editing.id}` : "/api/admin/commerce/products", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setStatus(response.ok ? (editing ? "Product updated." : "Product created.") : "Could not save product.");
    if (response.ok) {
      setEditorOpen(false);
      await loadProducts();
    }
  }

  async function deleteProduct(id: string) {
    if (!window.confirm("Delete this product?")) return;
    const response = await fetch(`/api/admin/commerce/products/${id}`, { method: "DELETE" });
    setStatus(response.ok ? "Product deleted." : "Failed to delete product.");
    if (response.ok) await loadProducts();
  }

  const activeCount = useMemo(() => products.filter((p) => p.status === "ACTIVE").length, [products]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={adminEyebrow}>Catalog</p>
          <h1 className={adminTitle}>Products</h1>
          <p className={adminMuted}>
            Manage images, simple or variable products, inventory, and product SEO in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/shop" className={adminBtnGhost}>
            Preview shop
          </Link>
          <button type="button" className={adminBtnPrimary} onClick={openCreate}>
            Add product
          </button>
        </div>
      </div>

      {status ? <p className="text-sm text-[#1b6568]">{status}</p> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Products</p>
          <p className="mt-2 font-serif text-3xl">{products.length}</p>
        </div>
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Active</p>
          <p className="mt-2 font-serif text-3xl">{activeCount}</p>
        </div>
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Variable</p>
          <p className="mt-2 font-serif text-3xl">{products.filter((p) => p.hasVariants).length}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className={`${adminPanel} overflow-hidden`}>
            <div className="relative aspect-[4/3] bg-[#f5eee4]">
              {product.featuredImage ? (
                <Image src={product.featuredImage} alt={product.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#8f6f3e]">No image</div>
              )}
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-serif text-xl text-[#1f1a15]">{product.title}</h2>
                  <p className="text-xs text-[#6f6251]">/{product.slug}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(product.status)}`}>
                  {product.status}
                </span>
              </div>
              <p className="text-sm text-[#2b2218]">{money(product.price)}</p>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-[#8f6f3e]">
                <span className={adminBtnSoft}>{product.category || "General"}</span>
                {product.hasVariants ? <span className={adminBtnSoft}>Variable · {product.variants?.length ?? 0}</span> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={adminBtnPrimary} onClick={() => openEdit(product)}>
                  Edit
                </button>
                <button type="button" className={adminBtnGhost} onClick={() => void deleteProduct(product.id)}>
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <AdminModal
        open={editorOpen}
        title={editing ? "Edit product" : "Add product"}
        eyebrow="Commerce"
        wide
        onClose={() => setEditorOpen(false)}
      >
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            <input className={adminInput} placeholder="Title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            <input className={adminInput} placeholder="Slug" value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} />
            <input className={adminInput} placeholder="Price" type="number" step="0.01" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} />
            <select className={adminSelect} value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>
              {productStatuses.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
            <input className={adminInput} placeholder="Category" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} />
            <input className={adminInput} placeholder="SKU" value={draft.sku} onChange={(e) => setDraft((d) => ({ ...d, sku: e.target.value }))} />
            <input className={adminInput} placeholder="Inventory" type="number" value={draft.inventoryQty} onChange={(e) => setDraft((d) => ({ ...d, inventoryQty: e.target.value }))} />
            <input className={adminInput} placeholder="Featured image URL or /images/..." value={draft.featuredImage} onChange={(e) => setDraft((d) => ({ ...d, featuredImage: e.target.value }))} />
          </div>

          {draft.featuredImage ? (
            <div className="relative h-40 overflow-hidden rounded-2xl border border-[#efe4d4] bg-[#f7f1e8]">
              <Image src={draft.featuredImage} alt="Preview" fill className="object-cover" unoptimized />
            </div>
          ) : null}

          <textarea
            className={adminTextarea}
            placeholder="Description"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
          <textarea
            className={adminTextarea}
            placeholder="Gallery image URLs (one per line)"
            value={draft.galleryImages}
            onChange={(e) => setDraft((d) => ({ ...d, galleryImages: e.target.value }))}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <input className={adminInput} placeholder="SEO title" value={draft.seoTitle} onChange={(e) => setDraft((d) => ({ ...d, seoTitle: e.target.value }))} />
            <input className={adminInput} placeholder="SEO description" value={draft.seoDescription} onChange={(e) => setDraft((d) => ({ ...d, seoDescription: e.target.value }))} />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-[#efe4d4] bg-[#fffaf3] px-4 py-3 text-sm text-[#2b2218]">
            <input
              type="checkbox"
              checked={draft.hasVariants}
              onChange={(e) => setDraft((d) => ({ ...d, hasVariants: e.target.checked }))}
            />
            This is a variable product (size, color, etc.)
          </label>

          {draft.hasVariants ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-[#1f1a15]">Variations</h3>
                <button
                  type="button"
                  className={adminBtnGhost}
                  onClick={() => setDraft((d) => ({ ...d, variants: [...d.variants, emptyVariant()] }))}
                >
                  Add variation
                </button>
              </div>
              {draft.variants.map((variant, index) => (
                <div key={variant.id ?? index} className="grid gap-2 rounded-2xl border border-[#efe4d4] bg-white p-3 md:grid-cols-2">
                  <input
                    className={adminInput}
                    placeholder="Variation title (e.g. Medium / Gold)"
                    value={variant.title}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        variants: d.variants.map((row, i) => (i === index ? { ...row, title: e.target.value } : row)),
                      }))
                    }
                  />
                  <input
                    className={adminInput}
                    placeholder="SKU"
                    value={variant.sku ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        variants: d.variants.map((row, i) => (i === index ? { ...row, sku: e.target.value } : row)),
                      }))
                    }
                  />
                  <input
                    className={adminInput}
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={variant.price}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        variants: d.variants.map((row, i) => (i === index ? { ...row, price: Number(e.target.value) } : row)),
                      }))
                    }
                  />
                  <input
                    className={adminInput}
                    type="number"
                    placeholder="Stock"
                    value={variant.inventoryQty}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        variants: d.variants.map((row, i) =>
                          i === index ? { ...row, inventoryQty: Number(e.target.value) } : row,
                        ),
                      }))
                    }
                  />
                  <input
                    className={`${adminInput} md:col-span-2`}
                    placeholder="Variation image URL"
                    value={variant.image ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        variants: d.variants.map((row, i) => (i === index ? { ...row, image: e.target.value } : row)),
                      }))
                    }
                  />
                  <input
                    className={adminInput}
                    placeholder="Size"
                    value={variant.options?.Size ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        variants: d.variants.map((row, i) =>
                          i === index ? { ...row, options: { ...row.options, Size: e.target.value } } : row,
                        ),
                      }))
                    }
                  />
                  <input
                    className={adminInput}
                    placeholder="Color"
                    value={variant.options?.Color ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        variants: d.variants.map((row, i) =>
                          i === index ? { ...row, options: { ...row.options, Color: e.target.value } } : row,
                        ),
                      }))
                    }
                  />
                  <button
                    type="button"
                    className={`${adminBtnGhost} md:col-span-2`}
                    onClick={() => setDraft((d) => ({ ...d, variants: d.variants.filter((_, i) => i !== index) }))}
                  >
                    Remove variation
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button type="button" className={adminBtnPrimary} onClick={() => void saveProduct()}>
              {editing ? "Save changes" : "Create product"}
            </button>
            <button type="button" className={adminBtnGhost} onClick={() => setEditorOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
