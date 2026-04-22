"use client";

import Image from "next/image";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { useCart } from "@/components/providers/cart-provider";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <div className="bg-[#f6f1e8]">
      <SectionWrapper className="py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl text-[#1f1a15]">Checkout</h1>
          <p className="mt-2 text-sm text-[#6f6251]">Secure, distraction-free checkout experience.</p>
        </div>
      </SectionWrapper>

      <SectionWrapper className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-2xl border border-[#b78d4b2d] bg-white p-5 sm:p-7">
            <h2 className="text-xl text-[#1f1a15]">Contact & Shipping</h2>
            <form className="mt-5 grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Email" type="email" />
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Phone" />
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="First name" />
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Last name" />
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 md:col-span-2" placeholder="Address" />
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="City" />
              <input className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="ZIP Code" />
            </form>

            <h2 className="mt-8 text-xl text-[#1f1a15]">Payment</h2>
            <div className="mt-4 rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-4 text-sm text-[#6f6251]">
              Card payment placeholder (Stripe checkout flow can be connected here next).
            </div>

            <button className="mt-6 w-full rounded-full bg-[#b78d4b] px-6 py-3 text-white">Complete Purchase</button>
          </div>

          <aside className="h-fit rounded-2xl border border-[#b78d4b2d] bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-lg text-[#1f1a15]">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-[#b78d4b2d]">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#2b2218]">{item.name}</p>
                    <p className="text-xs text-[#8f6f3e]">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm text-[#3b3024]">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-[#b78d4b24] pt-4 text-sm text-[#5f5344]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base text-[#1f1a15]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      </SectionWrapper>
    </div>
  );
}
