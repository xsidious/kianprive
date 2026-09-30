"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useCanViewServicePrices } from "@/hooks/use-can-view-service-prices";
import { MEMBER_PRICING_LABEL } from "@/lib/member-pricing-access";
import { MemberPriceNotice } from "@/components/pricing/MemberPriceNotice";
import { CinematicHero } from "@/components/ui/CinematicHero";
import { pageHeroes } from "@/lib/media/heroes";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialInput,
  editorialPanel,
} from "@/components/ui/editorial-primitives";
import type { CatalogProduct } from "@/lib/commerce/products";
import {
  getCatalogDisplayPrice,
  isCatalogProductComingSoon,
  isCatalogProductPriced,
  PEPTIDE_THERAPY_CATEGORY,
  shopCategoryList,
} from "@/lib/commerce/products";
import { PEPTIDES_MEMBER_CATEGORY } from "@/lib/commerce/peptide-orders";
import { PRIVETHERAPEUTICS_URL } from "@/lib/privetherapeutics";
import { TherapeuticsAnchor } from "@/components/site/TherapeuticsAnchor";

export function ShopPageClient({
  products,
  peptideProducts = [],
  peptidesUnlocked = false,
}: {
  products: CatalogProduct[];
  peptideProducts?: CatalogProduct[];
  peptidesUnlocked?: boolean;
}) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const { itemCount, addItem, openCart, subtotal } = useCart();
  const { canViewPrices, status } = useCanViewServicePrices();
  const router = useRouter();
  const refreshedPeptides = useRef(false);

  useEffect(() => {
    if (refreshedPeptides.current) return;
    if (status === "authenticated" && canViewPrices && !peptidesUnlocked) {
      refreshedPeptides.current = true;
      router.refresh();
    }
  }, [status, canViewPrices, peptidesUnlocked, router]);
  const categories = useMemo(() => shopCategoryList(products), [products]);

  const viewingPeptides = category === PEPTIDES_MEMBER_CATEGORY;
  const peptidesLocked = viewingPeptides && !peptidesUnlocked;

  const filteredProducts = useMemo(() => {
    const source = viewingPeptides ? (peptidesUnlocked ? peptideProducts : []) : products;
    let list = source.filter((p) =>
      viewingPeptides || category === "All" ? true : p.category === category,
    );
    list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === "price-asc") {
      list = [...list].sort((a, b) => getCatalogDisplayPrice(a) - getCatalogDisplayPrice(b));
    }
    if (sort === "price-desc") {
      list = [...list].sort((a, b) => getCatalogDisplayPrice(b) - getCatalogDisplayPrice(a));
    }
    return list;
  }, [products, peptideProducts, category, search, sort, viewingPeptides, peptidesUnlocked]);

  return (
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="SHOP"
        lineOne="Curated essentials."
        lineTwo="Home continuum."
        lineThree="Physician-guided care."
        description="Hand-selected retail products designed to extend your in-clinic results at home—from nutraceutical support to skin performance essentials."
        primaryCta={{ label: "Browse Products", href: "#products" }}
        secondaryCta={{ label: "View Cart", href: "/cart" }}
        imageSrc={pageHeroes.shop.src}
        imageAlt={pageHeroes.shop.alt}
        priority={false}
      />

      <EditorialSection id="products">
        {!canViewPrices ? (
          <div className="mb-6">
            <MemberPriceNotice />
          </div>
        ) : null}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <EditorialEyebrow>CATALOG</EditorialEyebrow>
            <h2 className="mt-3 font-serif text-3xl text-[#1f1a15]">Wellness, beauty &amp; supplies</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#6f6251]">
              Retail skincare, nutrients, and injection supplies. Peptides are a membership category: your physician
              places the order, and you track each shipment in My Orders.
            </p>
            <TherapeuticsAnchor
              href={PRIVETHERAPEUTICS_URL}
              className="mt-3 inline-flex min-h-[40px] items-center text-[11px] tracking-[0.16em] text-[#8f6f3e] underline-offset-4 hover:underline"
            >
              BROWSE PEPTIDES ON PRIVÉ THERAPEUTICS
            </TherapeuticsAnchor>
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
              <div className="mt-2 grid max-h-80 gap-2 overflow-y-auto pr-1">
                {categories.map((value) => {
                  const itemClass =
                    "rounded-sm border px-3 py-2 text-left text-sm border-[#e4d9c8] bg-white text-[#4f4335]";
                  if (value === PEPTIDE_THERAPY_CATEGORY) {
                    return (
                      <TherapeuticsAnchor key={value} href={PRIVETHERAPEUTICS_URL} className={itemClass}>
                        {value}
                      </TherapeuticsAnchor>
                    );
                  }
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCategory(value)}
                      className={`rounded-sm border px-3 py-2 text-left text-sm ${
                        category === value
                          ? "border-[#b78d4b] bg-[#fff6e8] text-[#8f6f3e]"
                          : "border-[#e4d9c8] bg-white text-[#4f4335]"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span>{value}</span>
                        {value === PEPTIDES_MEMBER_CATEGORY ? (
                          <span className="text-[10px] uppercase tracking-[0.12em] text-[#8f6f3e]">Members</span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-[#3b3024]">Sort</p>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={`mt-2 ${editorialInput}`}>
                <option value="featured">Featured</option>
                {canViewPrices ? (
                  <>
                    <option value="price-asc">Price Low to High</option>
                    <option value="price-desc">Price High to Low</option>
                  </>
                ) : null}
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
              {canViewPrices ? (
                <p className="text-sm text-[#6f6251]">Subtotal ${subtotal.toFixed(2)}</p>
              ) : (
                <p className="text-sm text-[#8f6f3e]">{MEMBER_PRICING_LABEL}</p>
              )}
              <button type="button" onClick={openCart} className={`mt-3 w-full ${editorialCtaPrimary}`}>
                OPEN SIDE CART
              </button>
            </div>
          </aside>

          <div>
            {peptidesLocked ? (
              <div className="mb-4">
                <MemberPriceNotice />
                <p className="mt-3 text-sm text-[#6f6251]">
                  The Peptides category opens after membership approval. Peptide orders are tracked in My Orders once
                  your physician sends the plan.
                </p>
              </div>
            ) : null}
            <div className={`mb-4 flex items-center justify-between ${editorialPanel} px-4 py-3 text-sm text-[#6f6251]`}>
              <span>
                {peptidesLocked ? "Members only" : `${filteredProducts.length} products`}
              </span>
              <button type="button" onClick={openCart} className={editorialCtaSecondary}>
                VIEW CART ({itemCount})
              </button>
            </div>
            {peptidesLocked ? null : filteredProducts.length === 0 && viewingPeptides ? (
              <div className={`${editorialPanel} p-8 text-sm text-[#6f6251]`}>
                No peptide compounds are in the catalog yet. When your physician orders one, track the shipment in My
                Orders.
              </div>
            ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const comingSoon = isCatalogProductComingSoon(product);
                const prescribed = Boolean(product.membershipOnly);
                return (
                  <article key={product.id} className={`overflow-hidden ${editorialPanel}`}>
                    {prescribed ? (
                      <div className="relative block h-56 bg-[#f3ebe0]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          quality={80}
                          className="object-contain p-3"
                        />
                        <span className="absolute left-3 top-3 rounded-sm bg-[#1f1a15]/85 px-2.5 py-1 text-[10px] tracking-[0.16em] text-white">
                          MEMBERS
                        </span>
                      </div>
                    ) : (
                    <Link href={`/shop/${product.slug}`} className="relative block h-56 bg-[#f3ebe0]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        quality={80}
                        className={`object-contain p-3 ${comingSoon ? "opacity-70" : "transition hover:scale-[1.02]"}`}
                      />
                      {comingSoon ? (
                        <span className="absolute left-3 top-3 rounded-sm bg-[#1f1a15]/85 px-2.5 py-1 text-[10px] tracking-[0.16em] text-white">
                          COMING SOON
                        </span>
                      ) : null}
                    </Link>
                    )}
                    <div className="p-5">
                      <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">{product.category.toUpperCase()}</p>
                      {prescribed ? (
                        <h2 className="mt-2 font-serif text-xl text-[#2b2218]">{product.name}</h2>
                      ) : (
                      <Link href={`/shop/${product.slug}`}>
                        <h2 className="mt-2 font-serif text-xl text-[#2b2218] transition hover:text-[#8a682e]">
                          {product.name}
                        </h2>
                      </Link>
                      )}
                      {product.summary ? (
                        <p className="mt-2 line-clamp-2 text-sm text-[#6f6251]">{product.summary}</p>
                      ) : null}
                      {prescribed ? (
                        <p className="mt-3 text-sm text-[#8f6f3e]">Physician ordered</p>
                      ) : product.redirectUrl ? (
                        <p className="mt-3 text-sm text-[#6f6251]">Variable options on product page.</p>
                      ) : comingSoon ? (
                        <p className="mt-3 text-sm text-[#8f6f3e]">Coming soon</p>
                      ) : product.options?.length ? (
                        <p className="mt-3 text-sm text-[#6f6251]">
                          {canViewPrices
                            ? `From $${getCatalogDisplayPrice(product)} · choose size`
                            : MEMBER_PRICING_LABEL}
                        </p>
                      ) : canViewPrices ? (
                        <p className="mt-3 text-2xl text-[#1f1a15]">${product.price}</p>
                      ) : (
                        <p className="mt-3 text-sm text-[#8f6f3e]">{MEMBER_PRICING_LABEL}</p>
                      )}
                      <div className="mt-4 flex flex-col gap-2">
                        {prescribed ? (
                          <>
                            <p className="text-sm text-[#6f6251]">
                              Your physician places this order. Track the shipment in My Orders.
                            </p>
                            <Link href="/dashboard/orders?kind=peptides" className={editorialCtaPrimary}>
                              TRACK PEPTIDE ORDERS
                            </Link>
                          </>
                        ) : (
                          <>
                        <Link href={`/shop/${product.slug}`} className={editorialCtaSecondary}>
                          VIEW DETAILS
                        </Link>
                        {product.redirectUrl?.includes("privetherapeutics.solutions") ? (
                          <TherapeuticsAnchor href={product.redirectUrl} className={editorialCtaPrimary}>
                            GO TO PRODUCT
                          </TherapeuticsAnchor>
                        ) : product.redirectUrl ? (
                          <a href={product.redirectUrl} target="_blank" rel="noreferrer" className={editorialCtaPrimary}>
                            GO TO PRODUCT
                          </a>
                        ) : comingSoon ? (
                          <span className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-[#e4d9c8] px-5 text-[11px] tracking-[0.16em] text-[#8a7a66]">
                            COMING SOON
                          </span>
                        ) : product.options?.length && isCatalogProductPriced(product) ? (
                          canViewPrices ? (
                            <Link href={`/shop/${product.slug}`} className={editorialCtaPrimary}>
                              SELECT SIZE
                            </Link>
                          ) : (
                            <Link href="/login?callbackUrl=/shop" className={editorialCtaPrimary}>
                              SIGN IN TO SHOP
                            </Link>
                          )
                        ) : isCatalogProductPriced(product) ? (
                          canViewPrices ? (
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
                              className={editorialCtaPrimary}
                            >
                              ADD TO CART
                            </button>
                          ) : (
                            <Link href="/login?callbackUrl=/shop" className={editorialCtaPrimary}>
                              SIGN IN TO SHOP
                            </Link>
                          )
                        ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            )}
          </div>
        </div>
      </EditorialSection>
    </div>
  );
}
