"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { CinematicHero } from "@/components/ui/CinematicHero";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialInput,
  editorialPanel,
} from "@/components/ui/editorial-primitives";
import { catalogProducts } from "@/lib/commerce/products";

export function ShopPageClient() {
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
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="SHOP"
        lineOne="Curated essentials."
        lineTwo="Clinical intent."
        lineThree="Home continuum."
        description="Hand-selected products designed to extend your in-clinic results at home—from nutraceutical support to skin performance essentials."
        primaryCta={{ label: "Browse Products", href: "#products" }}
        secondaryCta={{ label: "View Cart", href: "/cart" }}
        imageSrc="/images/facial-treatments.webp"
        imageAlt="Premium wellness products"
        priority={false}
      />

      <EditorialSection id="products">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <EditorialEyebrow>CATALOG</EditorialEyebrow>
            <h2 className="mt-3 font-serif text-3xl text-[#1f1a15]">Wellness &amp; beauty</h2>
          </div>
          <p className={`${editorialPanel} px-4 py-2 text-sm text-[#3b3024]`}>
            Cart Items: <span className="text-[#8f6f3e]">{itemCount}</span>
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className={`h-fit ${editorialPanel} p-4 lg:sticky lg:top-24`}>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">FILTERS</p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className={`mt-3 ${editorialInput}`}
            />
            <div className="mt-4">
              <p className="text-sm text-[#3b3024]">Category</p>
              <div className="mt-2 grid gap-2">
                {["All", "Skincare", "Nutrients", "Professional"].map((value) => (
                  <button
                    key={value}
                    onClick={() => setCategory(value)}
                    className={`rounded-sm border px-3 py-2 text-left text-sm ${
                      category === value ? "border-[#b78d4b] bg-[#fff6e8] text-[#8f6f3e]" : "border-[#e4d9c8] bg-white text-[#4f4335]"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-[#3b3024]">Sort</p>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={`mt-2 ${editorialInput}`}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
              </select>
            </div>
            <div className={`mt-5 ${editorialPanel} p-3 text-sm text-[#5f5344]`}>
              <p className="inline-flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#8f6f3e]" /> Verified premium suppliers
              </p>
              <p className="mt-2 inline-flex items-center gap-2">
                <Truck size={15} className="text-[#8f6f3e]" /> Fast concierge delivery
              </p>
            </div>
            <div className={`mt-5 ${editorialPanel} p-3`}>
              <p className="text-sm text-[#5f5344]">Cart preview</p>
              <p className="mt-1 text-lg text-[#1f1a15]">{itemCount} items</p>
              <p className="text-sm text-[#6f6251]">Subtotal ${subtotal.toFixed(2)}</p>
              <button onClick={openCart} className={`mt-3 w-full ${editorialCtaPrimary}`}>
                OPEN SIDE CART
              </button>
            </div>
          </aside>

          <div>
            <div className={`mb-4 flex items-center justify-between ${editorialPanel} px-4 py-3 text-sm text-[#6f6251]`}>
              <span>{filteredProducts.length} products</span>
              <button onClick={openCart} className={editorialCtaSecondary}>
                VIEW CART ({itemCount})
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article key={product.id} className={`overflow-hidden ${editorialPanel}`}>
                  <div className="relative h-56">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      quality={70}
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">{product.category}</p>
                    <h2 className="mt-2 font-serif text-xl text-[#2b2218]">{product.name}</h2>
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
                        className={`mt-4 ${editorialCtaPrimary}`}
                      >
                        GO TO PRODUCT
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
                        className={`mt-4 ${editorialCtaPrimary}`}
                      >
                        ADD TO CART
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </EditorialSection>
    </div>
  );
}
