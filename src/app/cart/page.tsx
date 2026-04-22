"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { useCart } from "@/components/providers/cart-provider";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

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
            <div className="mt-4 space-y-2 text-sm text-[#5f5344]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{subtotal >= 150 ? "Free" : "$12.00"}</span>
              </div>
            </div>
            <div className="mt-4 border-t border-[#b78d4b24] pt-4">
              <div className="flex justify-between text-[#1f1a15]">
                <span>Total</span>
                <span>${(subtotal + (subtotal >= 150 || subtotal === 0 ? 0 : 12)).toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" className="mt-5 block rounded-full bg-[#b78d4b] px-5 py-3 text-center text-sm text-white">
              Checkout
            </Link>
            <div className="mt-5 space-y-2 text-xs text-[#6f6251]">
              <p className="inline-flex items-center gap-2"><Truck size={14} className="text-[#8f6f3e]" /> Fast delivery support</p>
              <p className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-[#8f6f3e]" /> Secure encrypted checkout</p>
            </div>
          </aside>
        </div>
      </SectionWrapper>
    </div>
  );
}
