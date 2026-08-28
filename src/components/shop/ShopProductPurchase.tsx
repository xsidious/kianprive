"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";
import { useCanViewServicePrices } from "@/hooks/use-can-view-service-prices";
import { MEMBER_PRICING_LABEL } from "@/lib/member-pricing-access";
import {
  editorialCtaPrimary,
  editorialCtaSecondary,
} from "@/components/ui/editorial-primitives";
import type { CatalogProduct } from "@/lib/commerce/products";
import { isCatalogProductPriced } from "@/lib/commerce/products";

type Props = {
  product: CatalogProduct;
};

export function ShopProductPurchase({ product }: Props) {
  const { addItem, openCart } = useCart();
  const { canViewPrices } = useCanViewServicePrices();
  const options = product.options ?? [];
  const [selectedId, setSelectedId] = useState(options[0]?.id ?? product.id);

  const selected = options.find((option) => option.id === selectedId) ?? null;
  const price = selected?.price ?? product.price;
  const cartName = selected ? `${product.name} — ${selected.label}` : product.name;
  const cartId = selected?.id ?? product.id;

  const canPurchase = isCatalogProductPriced(product) && price > 0;

  return (
    <div className="mt-6 space-y-5">
      {options.length ? (
        <div>
          <p className="text-xs tracking-[0.16em] text-[#8f6f3e]">SIZE</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {options.map((option) => {
              const active = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedId(option.id)}
                  className={`rounded-sm border px-3 py-3 text-left transition ${
                    active
                      ? "border-[#8a682e] bg-[#fff6e8] ring-1 ring-[#8a682e33]"
                      : "border-[#e4d9c8] bg-white hover:border-[#b78d4b80]"
                  }`}
                >
                  <span className="block text-sm text-[#1f1a15]">{option.label}</span>
                  {canViewPrices ? (
                    <span className="mt-1 block text-lg text-[#1f1a15]">${option.price}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {canPurchase && canViewPrices ? (
        <p className="text-3xl text-[#1f1a15]">${price.toFixed(2)}</p>
      ) : canPurchase ? (
        <p className="text-sm tracking-[0.08em] text-[#8f6f3e]">{MEMBER_PRICING_LABEL}</p>
      ) : (
        <p className="text-sm tracking-[0.08em] text-[#8f6f3e]">COMING SOON</p>
      )}

      <div className="flex flex-wrap gap-3">
        {product.redirectUrl ? (
          <a href={product.redirectUrl} target="_blank" rel="noreferrer" className={editorialCtaPrimary}>
            GO TO PRODUCT
          </a>
        ) : canPurchase && canViewPrices ? (
          <button
            type="button"
            className={editorialCtaPrimary}
            onClick={() => {
              addItem({
                id: cartId,
                name: cartName,
                price,
                image: product.image,
                category: product.category,
              });
              openCart();
            }}
          >
            ADD TO CART
          </button>
        ) : canPurchase ? (
          <Link href="/login?callbackUrl=/shop" className={editorialCtaPrimary}>
            SIGN IN TO PURCHASE
          </Link>
        ) : null}
        <Link href="/shop#products" className={editorialCtaSecondary}>
          BACK TO CATALOG
        </Link>
      </div>
    </div>
  );
}
