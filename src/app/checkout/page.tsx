"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { useCart } from "@/components/providers/cart-provider";

function CheckoutForm() {
  const { items, subtotal, shipping, total } = useCart();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCompletePurchase() {
    if (!items.length) {
      setResultMessage("Your cart is empty. Add products from the shop first.");
      return;
    }
    if (!email) {
      setResultMessage("Email is required for checkout.");
      return;
    }

    const cartId = window.localStorage.getItem("kianprive_cart_id");
    if (!cartId) {
      setResultMessage("Syncing cart... please try again in a moment.");
      return;
    }

    setSubmitting(true);
    setResultMessage(null);
    try {
      const response = await fetch("/api/commerce/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId,
          email,
          phone,
          shippingAddress: { firstName, lastName, address, city, zipCode },
          billingAddress: { firstName, lastName, address, city, zipCode },
        }),
      });

      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        setResultMessage(payload.error ?? "Failed to start checkout.");
        return;
      }

      window.location.assign(payload.url);
    } catch {
      setResultMessage("Unexpected error while processing checkout.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#f6f1e8]">
      <SectionWrapper className="py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl text-[#1f1a15]">Checkout</h1>
          <p className="mt-2 text-sm text-[#6f6251]">Secure payment powered by Stripe.</p>
          {canceled ? (
            <p className="mt-3 rounded-xl border border-[#b78d4b40] bg-[#fff7eb] px-4 py-2 text-sm text-[#6f6251]">
              Payment was canceled. Your cart is still saved.
            </p>
          ) : null}
        </div>
      </SectionWrapper>

      <SectionWrapper className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-2xl border border-[#b78d4b2d] bg-white p-5 sm:p-7">
            <h2 className="text-xl text-[#1f1a15]">Contact & Shipping</h2>
            <form className="mt-5 grid gap-4 md:grid-cols-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Email *" type="email" required />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Phone" />
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="First name" />
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="Last name" />
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 md:col-span-2" placeholder="Address" />
              <input value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="City" />
              <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" placeholder="ZIP Code" />
            </form>

            <h2 className="mt-8 text-xl text-[#1f1a15]">Payment</h2>
            <p className="mt-3 text-sm text-[#6f6251]">
              You will be redirected to Stripe to complete your purchase securely.
            </p>

            <button
              type="button"
              onClick={handleCompletePurchase}
              disabled={submitting || items.length === 0}
              className="mt-6 w-full rounded-full bg-[#b78d4b] px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Redirecting to Stripe..." : `Pay $${total.toFixed(2)} with Stripe`}
            </button>
            {resultMessage ? <p className="mt-3 text-sm text-[#6f6251]">{resultMessage}</p> : null}
            <Link href="/shop" className="mt-4 inline-block text-sm text-[#8f6f3e] hover:underline">
              Continue shopping
            </Link>
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="bg-[#f6f1e8] p-10 text-[#6f6251]">Loading checkout...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
