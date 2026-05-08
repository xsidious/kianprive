"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock, Minus, Plus, RotateCcw, ShieldCheck, Truck, X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";

const FREE_SHIPPING_THRESHOLD = 150;

export function CartDrawer() {
  const { items, isOpen, itemCount, subtotal, closeCart, removeItem, updateQuantity, clearCart } = useCart();
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <>
      {isOpen ? <button className="fixed inset-0 z-50 bg-black/45" onClick={closeCart} aria-label="Close cart overlay" /> : null}
      <aside
        className={`fixed right-0 top-0 z-[60] h-full w-full max-w-md border-l border-[#b78d4b33] bg-[#fffdf9] shadow-[-12px_0_40px_-30px_rgba(66,45,14,0.65)] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[#b78d4b24] px-5 py-4">
            <div>
              <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">YOUR CART</p>
              <p className="text-sm text-[#5f5344]">{itemCount} item(s)</p>
            </div>
            <button onClick={closeCart} className="rounded-full border border-[#b78d4b40] bg-white p-2 text-[#3b3024]">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-[#b78d4b2d] bg-white p-5 text-center">
                <p className="text-lg text-[#2b2218]">Your cart is empty</p>
                <p className="mt-2 text-sm text-[#6f6251]">Add premium wellness essentials to complete your routine.</p>
                <Link href="/shop" onClick={closeCart} className="mt-4 inline-flex rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
                  Browse Shop
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-3">
                    <div className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#b78d4b2d]">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-[#2b2218]">{item.name}</p>
                        <p className="text-xs text-[#8f6f3e]">{item.category}</p>
                        <p className="mt-1 text-sm text-[#3b3024]">${item.price}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#b78d4b42] px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-[#5f5344]">
                          <Minus size={14} />
                        </button>
                        <span className="min-w-5 text-center text-sm text-[#3b3024]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-[#5f5344]">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-xs text-[#8f6f3e] hover:underline">
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-2 rounded-2xl border border-[#b78d4b2d] bg-[#fff8ef] p-4 text-sm text-[#4f4335]">
              <p>
                {amountToFreeShipping > 0
                  ? `Add $${amountToFreeShipping.toFixed(2)} more for free shipping.`
                  : "Free shipping unlocked."}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-[#ead8bc]">
                <div className="h-full rounded-full bg-[#b78d4b] transition-all duration-300" style={{ width: `${shippingProgress}%` }} />
              </div>
              <p className="inline-flex items-center gap-2"><Truck size={15} className="text-[#8f6f3e]" /> Free delivery on orders over $150</p>
              <p className="inline-flex items-center gap-2"><RotateCcw size={15} className="text-[#8f6f3e]" /> 30-day return support</p>
              <p className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#8f6f3e]" /> Clinically curated quality assurance</p>
              <p className="inline-flex items-center gap-2"><Lock size={15} className="text-[#8f6f3e]" /> Secure encrypted checkout</p>
            </div>
          </div>

          <div className="border-t border-[#b78d4b24] px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm text-[#5f5344]">
              <span>Subtotal</span>
              <span className="text-lg text-[#1f1a15]">${subtotal.toFixed(2)}</span>
            </div>
            <Link href="/checkout" onClick={closeCart} className="block w-full rounded-full bg-[#b78d4b] px-5 py-3 text-center text-sm text-white">
              Proceed to Checkout
            </Link>
            <Link href="/cart" onClick={closeCart} className="mt-2 block w-full rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-5 py-2 text-center text-sm text-[#3b3024]">
              View Cart
            </Link>
            <button onClick={clearCart} className="mt-2 w-full rounded-full border border-[#b78d4b70] bg-white px-5 py-2 text-sm text-[#3b3024]">
              Clear Cart
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
