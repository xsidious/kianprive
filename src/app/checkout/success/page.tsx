"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { useCart } from "@/components/providers/cart-provider";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const { clearCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clearCart();
  }, [clearCart]);

  return (
    <SectionWrapper className="py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#b78d4b2d] bg-white p-8 text-center shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)]">
        <CheckCircle2 className="mx-auto text-[#8f6f3e]" size={48} />
        <h1 className="mt-4 text-3xl text-[#1f1a15]">Thank You</h1>
        <p className="mt-3 text-[#6f6251]">
          Your payment was received{orderNumber ? ` for order ${orderNumber}` : ""}. We will send confirmation and shipping updates to your email.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
            Continue Shopping
          </Link>
          <Link href="/contact" className="rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-5 py-2 text-sm text-[#3b3024]">
            Contact Concierge
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-[#6f6251]">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
