"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AuthorizeNetPayForm } from "@/components/commerce/AuthorizeNetPayForm";
import { useCart } from "@/components/providers/cart-provider";
import { readPartnerReferralClient } from "@/lib/partner-referral";

function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, shipping, total, clearCart } = useCart();
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
  const [pendingOrder, setPendingOrder] = useState<{
    orderId: string;
    orderNumber: string;
    total: number;
    cartId: string;
  } | null>(null);

  async function createOrder() {
    if (!items.length) {
      setResultMessage("Your cart is empty. Add products from the shop first.");
      return null;
    }
    if (!email) {
      setResultMessage("Email is required for checkout.");
      return null;
    }

    const cartId = window.localStorage.getItem("kianprive_cart_id");
    if (!cartId) {
      setResultMessage("Syncing cart... please try again in a moment.");
      return null;
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
          partnerCode: readPartnerReferralClient() ?? undefined,
        }),
      });

      const payload = (await response.json()) as {
        orderId?: string;
        orderNumber?: string;
        total?: number;
        cartId?: string;
        error?: string;
      };
      if (!response.ok || !payload.orderId || !payload.orderNumber) {
        setResultMessage(payload.error ?? "Failed to create order.");
        return null;
      }

      const order = {
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        total: Number(payload.total ?? total),
        cartId: payload.cartId || cartId,
      };
      setPendingOrder(order);
      return order;
    } catch {
      setResultMessage("Unexpected error while creating order.");
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStartPayment() {
    if (pendingOrder) return;
    await createOrder();
  }

  return (
    <div className="bg-[#f6f1e8]">
      <SectionWrapper className="py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl text-[#1f1a15]">Checkout</h1>
          <p className="mt-2 text-sm text-[#6f6251]">Secure payment powered by Authorize.net</p>
          {canceled ? (
            <p className="mt-3 rounded-sm border border-[#b78d4b40] bg-[#fff7eb] px-4 py-2 text-sm text-[#6f6251]">
              Payment was canceled. Your cart is still saved.
            </p>
          ) : null}
        </div>
      </SectionWrapper>

      <SectionWrapper className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-sm border border-[#b78d4b2d] bg-white p-5 sm:p-7">
            <h2 className="text-xl text-[#1f1a15]">Contact & Shipping</h2>
            <form className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3"
                placeholder="Email *"
                type="email"
                required
                disabled={Boolean(pendingOrder)}
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3"
                placeholder="Phone"
                disabled={Boolean(pendingOrder)}
              />
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3"
                placeholder="First name"
                disabled={Boolean(pendingOrder)}
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3"
                placeholder="Last name"
                disabled={Boolean(pendingOrder)}
              />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3 md:col-span-2"
                placeholder="Address"
                disabled={Boolean(pendingOrder)}
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3"
                placeholder="City"
                disabled={Boolean(pendingOrder)}
              />
              <input
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3"
                placeholder="ZIP Code"
                disabled={Boolean(pendingOrder)}
              />
            </form>

            <h2 className="mt-8 text-xl text-[#1f1a15]">Payment</h2>

            {!pendingOrder ? (
              <>
                <p className="mt-3 text-sm text-[#6f6251]">
                  Confirm your details, then enter your card. Charges are processed securely with Authorize.net.
                </p>
                <button
                  type="button"
                  onClick={() => void handleStartPayment()}
                  disabled={submitting || items.length === 0}
                  className="mt-6 w-full rounded-sm bg-[#b78d4b] px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Preparing order…" : `Continue to card payment — $${total.toFixed(2)}`}
                </button>
              </>
            ) : (
              <div className="mt-4">
                <p className="mb-3 text-sm text-[#6f6251]">
                  Order <span className="font-medium text-[#1f1a15]">{pendingOrder.orderNumber}</span> ready —
                  complete payment below.
                </p>
                <AuthorizeNetPayForm
                  amountLabel={`$${pendingOrder.total.toFixed(2)}`}
                  defaultZip={zipCode}
                  submitLabel={`Pay $${pendingOrder.total.toFixed(2)}`}
                  testSubmitLabel={`Pay $${pendingOrder.total.toFixed(2)} (test)`}
                  onCharge={async ({ opaqueData, billTo, testCardNumber }) => {
                    const res = await fetch(`/api/commerce/orders/${pendingOrder.orderId}/shop-pay`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        opaqueData,
                        email,
                        cartId: pendingOrder.cartId,
                        billTo: {
                          firstName,
                          lastName,
                          zip: billTo.zip || zipCode,
                        },
                        testCardNumber,
                      }),
                    });
                    const data = (await res.json()) as {
                      error?: string;
                      testMode?: boolean;
                      orderNumber?: string;
                    };
                    if (!res.ok) throw new Error(data.error || "Payment failed.");
                    return {
                      testMode: data.testMode,
                      message: data.testMode
                        ? "Test payment recorded — no real charge."
                        : "Payment successful. Thank you.",
                    };
                  }}
                  onSuccess={() => {
                    clearCart();
                    window.localStorage.removeItem("kianprive_cart_id");
                    router.push(`/checkout/success?order=${encodeURIComponent(pendingOrder.orderNumber)}`);
                  }}
                />
              </div>
            )}

            {resultMessage ? <p className="mt-3 text-sm text-[#6f6251]">{resultMessage}</p> : null}
            <Link href="/shop" className="mt-4 inline-block text-sm text-[#8f6f3e] hover:underline">
              Continue shopping
            </Link>
          </div>

          <aside className="h-fit rounded-sm border border-[#b78d4b2d] bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-lg text-[#1f1a15]">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-sm border border-[#b78d4b2d]">
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
                <span>${(pendingOrder?.total ?? total).toFixed(2)}</span>
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
