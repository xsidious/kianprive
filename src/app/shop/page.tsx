"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { catalogProducts } from "@/lib/commerce/products";

export default function ShopPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const { itemCount, addItem, openCart, subtotal } = useCart();

  const filteredProducts = useMemo(() => {
    let list = catalogProducts.filter((p) => (category === "All" ? true : p.category === category));
    list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, search, sort]);

  return (
    <div>
      <SectionWrapper className="pt-14 sm:pt-16 md:pt-18">
        <div className="grid items-center gap-8 rounded-3xl border border-[#b78d4b2e] bg-white p-5 shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)] sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">SHOP</p>
            <h1 className="mt-4 text-3xl text-[#1f1a15] sm:text-4xl md:text-5xl">Curated Wellness and Beauty Essentials</h1>
            <p className="mt-5 text-[#6f6251]">
              Hand-selected products designed to extend your in-clinic results at home. From nutraceutical support to skin performance
              essentials, each item is chosen with clinical intent.
            </p>
            <div className="mt-7 inline-flex rounded-full border border-[#b78d4b38] bg-[#fff8ef] px-4 py-2 text-sm text-[#3b3024]">
              Cart Items: <span className="ml-1 text-[#8f6f3e]">{itemCount}</span>
            </div>
          </div>
          <div className="relative h-[260px] overflow-hidden rounded-3xl border border-[#b78d4b36] sm:h-[320px] md:h-[360px]">
            <Image src="/images/beauty.avif" alt="Premium wellness products" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-[#b78d4b2d] bg-white p-4 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)] lg:sticky lg:top-24">
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">FILTERS</p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="mt-3 w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3"
            />
            <div className="mt-4">
              <p className="text-sm text-[#3b3024]">Category</p>
              <div className="mt-2 grid gap-2">
                {["All", "Skincare", "Nutrients", "Professional"].map((value) => (
                  <button
                    key={value}
                    onClick={() => setCategory(value)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm ${
                      category === value ? "border-[#b78d4b] bg-[#fff6e8] text-[#8f6f3e]" : "border-[#b78d4b35] bg-white text-[#4f4335]"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-[#3b3024]">Sort</p>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-2 w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3">
                <option value="featured">Featured</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
              </select>
            </div>
            <div className="mt-5 rounded-xl border border-[#b78d4b2d] bg-[#fff8ef] p-3 text-sm text-[#5f5344]">
              <p className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#8f6f3e]" /> Verified premium suppliers</p>
              <p className="mt-2 inline-flex items-center gap-2"><Truck size={15} className="text-[#8f6f3e]" /> Fast concierge delivery</p>
            </div>
            <div className="mt-5 rounded-xl border border-[#b78d4b2d] bg-white p-3">
              <p className="text-sm text-[#5f5344]">Cart preview</p>
              <p className="mt-1 text-lg text-[#1f1a15]">{itemCount} items</p>
              <p className="text-sm text-[#6f6251]">Subtotal ${subtotal.toFixed(2)}</p>
              <button onClick={openCart} className="mt-3 w-full rounded-full bg-[#b78d4b] px-4 py-2 text-sm text-white">
                Open Side Cart
              </button>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#b78d4b2e] bg-white px-4 py-3 text-sm text-[#6f6251]">
              <span>{filteredProducts.length} products</span>
              <button onClick={openCart} className="rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-4 py-1.5 text-[#3b3024]">
                View Cart ({itemCount})
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article key={product.id} className="overflow-hidden rounded-3xl border border-[#b78d4b2d] bg-white shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)]">
                  <div className="relative h-56">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">{product.category}</p>
                    <h2 className="mt-2 text-xl text-[#2b2218]">{product.name}</h2>
                    {product.redirectUrl ? (
                      <p className="mt-3 text-sm text-[#6f6251]">Redirects to external product page.</p>
                    ) : (
                      <p className="mt-3 text-2xl text-[#1f1a15]">${product.price}</p>
                    )}
                    {product.redirectUrl ? (
                      <a
                        href={product.redirectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white"
                      >
                        Go to Product
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            category: product.category,
                          });
                          openCart();
                        }}
                        className="mt-4 rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
