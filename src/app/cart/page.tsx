"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { useCart } from "@/components/providers/cart-provider";
import { catalogProducts } from "@/lib/commerce/products";

const FREE_SHIPPING_THRESHOLD = 150;

export default function CartPage() {
  const { items, subtotal, shipping, total, updateQuantity, removeItem, addItem } = useCart();
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const recommendedProducts = useMemo(() => {
    const cartIds = new Set(items.map((item) => item.id));
    const cartCategories = new Set(items.map((item) => item.category));
    const categoryMatches = catalogProducts.filter((product) => !cartIds.has(product.id) && cartCategories.has(product.category));
    const fallback = catalogProducts.filter((product) => !cartIds.has(product.id) && !cartCategories.has(product.category));
    return [...categoryMatches, ...fallback].slice(0, 3);
  }, [items]);

  return (
    <div>
      <SectionWrapper className="pt-14 sm:pt-16 md:pt-18">
        <h1 className="text-3xl text-[#1f1a15] sm:text-4xl">Your Cart</h1>
        <p className="mt-2 text-[#6f6251]">Review your items before secure checkout.</p>
      </SectionWrapper>

      <SectionWrapper>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-[#b78d4b2d] bg-white p-6">
                <p className="text-[#2b2218]">Your cart is currently empty.</p>
                <Link href="/shop" className="mt-4 inline-flex rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
                  <div className="grid gap-4 sm:grid-cols-[110px_1fr_auto] sm:items-center">
                    <div className="relative h-24 overflow-hidden rounded-xl border border-[#b78d4b2d]">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-lg text-[#2b2218]">{item.name}</p>
                      <p className="text-sm text-[#8f6f3e]">{item.category}</p>
                      <button onClick={() => removeItem(item.id)} className="mt-2 text-xs text-[#8f6f3e] hover:underline">
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="text-lg text-[#1f1a15]">${(item.price * item.quantity).toFixed(2)}</p>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#b78d4b42] px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-[#5f5344]">
                          <Minus size={14} />
                        </button>
                        <span className="min-w-5 text-center text-sm text-[#3b3024]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-[#5f5344]">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-[#b78d4b2d] bg-white p-5 lg:sticky lg:top-24">
            <h2 className="text-xl text-[#1f1a15]">Order Summary</h2>
            <div className="mt-4 rounded-xl border border-[#b78d4b2d] bg-[#fff8ef] p-3">
              <p className="text-sm text-[#4f4335]">
                {amountToFreeShipping > 0
                  ? `Add $${amountToFreeShipping.toFixed(2)} to unlock free shipping.`
                  : "You unlocked free shipping!"}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ead8bc]">
                <div
                  className="h-full rounded-full bg-[#b78d4b] transition-all duration-300"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-[#5f5344]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>
            <div className="mt-4 border-t border-[#b78d4b24] pt-4">
              <div className="flex justify-between text-[#1f1a15]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" className="mt-5 block rounded-full bg-[#b78d4b] px-5 py-3 text-center text-sm text-white">
              Checkout
            </Link>
            <p className="mt-3 text-center text-xs text-[#8f6f3e]">Most members complete checkout in under 60 seconds.</p>
            <div className="mt-5 space-y-2 text-xs text-[#6f6251]">
              <p className="inline-flex items-center gap-2"><Truck size={14} className="text-[#8f6f3e]" /> Fast delivery support</p>
              <p className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-[#8f6f3e]" /> Secure encrypted checkout</p>
            </div>
          </aside>
        </div>
      </SectionWrapper>

      {items.length > 0 ? (
        <SectionWrapper className="pt-0">
          <div className="rounded-2xl border border-[#b78d4b2d] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-2xl text-[#1f1a15]">Recommended For Your Cart</h2>
              <p className="text-sm text-[#8f6f3e]">Frequently bought together</p>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {recommendedProducts.map((product) => (
                <article key={product.id} className="rounded-2xl border border-[#b78d4b2d] bg-[#fffdf9] p-3">
                  <div className="relative h-36 overflow-hidden rounded-xl border border-[#b78d4b2d]">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <p className="mt-3 text-xs tracking-[0.14em] text-[#8f6f3e]">{product.category}</p>
                  <p className="mt-1 text-[#2b2218]">{product.name}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-lg text-[#1f1a15]">${product.price}</p>
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          category: product.category,
                        })
                      }
                      className="rounded-full bg-[#b78d4b] px-4 py-2 text-xs text-white"
                    >
                      Add
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </SectionWrapper>
      ) : null}
    </div>
  );
}
