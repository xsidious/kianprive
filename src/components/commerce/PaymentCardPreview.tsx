"use client";

import { detectCardBrand, formatExpiry, displayCardNumber, brandLabel } from "@/components/commerce/payment-card-utils";

type Props = {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  flipped: boolean;
  holderName?: string;
};

function BrandMark({ brand }: { brand: ReturnType<typeof detectCardBrand> }) {
  if (brand === "visa") {
    return <span className="font-serif text-lg font-bold italic tracking-tight text-white/95">VISA</span>;
  }
  if (brand === "mastercard") {
    return (
      <div className="flex -space-x-2">
        <span className="h-7 w-7 rounded-full bg-[#eb001b]/90" />
        <span className="h-7 w-7 rounded-full bg-[#f79e1b]/90" />
      </div>
    );
  }
  if (brand === "amex") {
    return <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">Amex</span>;
  }
  return <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">KIAN</span>;
}

export function PaymentCardPreview({ cardNumber, expMonth, expYear, cvv, flipped, holderName }: Props) {
  const brand = detectCardBrand(cardNumber);
  const displayNumber = displayCardNumber(cardNumber);
  const expiry = formatExpiry(expMonth, expYear);

  return (
    <div className="payment-card-scene mx-auto w-full max-w-[340px]">
      <div className={`payment-card-inner relative h-[200px] w-full ${flipped ? "is-flipped" : ""}`}>
        {/* Front */}
        <div className="payment-card-face absolute inset-0 overflow-hidden rounded-2xl border border-[#c9a86a]/40 bg-gradient-to-br from-[#3d3228] via-[#2a221b] to-[#1a1510] p-5 shadow-[0_18px_40px_rgba(31,26,21,0.35)] payment-card-shimmer">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#b78d4b]/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-[#8f6f3e]/15 blur-2xl" />

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="h-9 w-12 rounded-md bg-gradient-to-br from-[#e8c882] via-[#d4a853] to-[#a67c32] shadow-inner" />
              <BrandMark brand={brand} />
            </div>

            <div>
              <p className="font-mono text-[19px] tracking-[0.18em] text-white/95 sm:text-[21px]">{displayNumber}</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/45">Cardholder</p>
                  <p className="mt-0.5 truncate font-serif text-sm uppercase tracking-wide text-white/85">
                    {holderName?.trim() || "Your name"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/45">Expires</p>
                  <p className="mt-0.5 font-mono text-sm text-white/90">{expiry}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="payment-card-face payment-card-back absolute inset-0 overflow-hidden rounded-2xl border border-[#c9a86a]/40 bg-gradient-to-br from-[#2f2720] to-[#15110e] shadow-[0_18px_40px_rgba(31,26,21,0.35)]">
          <div className="mt-6 h-10 w-full bg-[#0d0b09]" />
          <div className="px-5 pt-5">
            <div className="flex items-center justify-end gap-3">
              <div className="rounded-md bg-[#fffaf3] px-4 py-2 font-mono text-sm tracking-[0.3em] text-[#1f1a15]">
                {cvv ? cvv.replace(/./g, "•") : "•••"}
              </div>
            </div>
            <p className="mt-6 text-[10px] leading-relaxed text-white/40">
              Authorized use only. Secure payment processed by KIAN Privé via Authorize.net.
            </p>
            <p className="mt-2 text-right text-[10px] uppercase tracking-[0.18em] text-white/35">{brandLabel(brand)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
