"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { PaymentCardPreview } from "@/components/commerce/PaymentCardPreview";
import { PaymentReceipt, type PaymentReceiptData } from "@/components/commerce/PaymentReceipt";
import {
  brandLabel,
  cardLast4,
  detectCardBrand,
  digitsOnly,
  formatCardNumber,
} from "@/components/commerce/payment-card-utils";

declare global {
  interface Window {
    Accept?: {
      dispatchData: (
        secureData: unknown,
        callback: (response: {
          messages?: { resultCode?: string; message?: Array<{ code?: string; text?: string }> };
          opaqueData?: { dataDescriptor: string; dataValue: string };
        }) => void,
      ) => void;
    };
  }
}

type AuthConfig = {
  apiLoginId: string;
  clientKey: string;
  env: string;
  configured: boolean;
  testMode: boolean;
  testCard: {
    number: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    zip: string;
    hint: string;
  } | null;
};

type Props = {
  orderId: string;
  total: number;
  orderNumber: string;
  endpoint?: string;
  buttonLabel?: string;
  onPaid?: () => void;
  patientName?: string | null;
  /** Show receipt immediately (e.g. page reload after paid). */
  initialReceipt?: PaymentReceiptData | null;
};

type FocusField = "number" | "expMonth" | "expYear" | "cvv" | "zip" | null;

function fieldClass(active: boolean) {
  return `rounded-xl border bg-white px-3.5 py-3 text-sm text-[#1f1a15] outline-none transition-all duration-200 ${
    active
      ? "border-[#b78d4b] ring-2 ring-[#b78d4b33] shadow-[0_0_0_4px_rgba(183,141,75,0.08)]"
      : "border-[#e7dcc8] hover:border-[#d4c2a0]"
  }`;
}

export function TherapyAcceptPay({
  orderId,
  total,
  orderNumber,
  endpoint,
  buttonLabel,
  onPaid,
  patientName,
  initialReceipt,
}: Props) {
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");
  const [focusField, setFocusField] = useState<FocusField>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceiptData | null>(initialReceipt ?? null);

  const flipped = focusField === "cvv";
  const brand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/commerce/authorize-net/config");
      const data = (await res.json()) as AuthConfig;
      setConfig(data);

      if (data.testMode) {
        setReady(true);
        return;
      }

      const script = document.createElement("script");
      script.src =
        data.env === "production"
          ? "https://js.authorize.net/v1/Accept.js"
          : "https://jstest.authorize.net/v1/Accept.js";
      script.async = true;
      script.onload = () => setReady(true);
      document.body.appendChild(script);
    })();
  }, []);

  function fillTestCard() {
    if (!config?.testCard) return;
    setCardNumber(formatCardNumber(config.testCard.number));
    setExpMonth(config.testCard.expMonth);
    setExpYear(config.testCard.expYear);
    setCvv(config.testCard.cvv);
    setZip(config.testCard.zip);
    setError("");
  }

  async function pay() {
    setBusy(true);
    setError("");

    const digits = digitsOnly(cardNumber);
    if (digits.length < 13) {
      setBusy(false);
      setError("Enter a valid card number.");
      return;
    }
    if (!expMonth || !expYear) {
      setBusy(false);
      setError("Enter the card expiration date.");
      return;
    }
    if (cvv.length < 3) {
      setBusy(false);
      setError("Enter the security code on the back of your card.");
      return;
    }

    const submit = async (opaqueData: { dataDescriptor: string; dataValue: string }) => {
      const res = await fetch(endpoint ?? `/api/commerce/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opaqueData,
          billTo: { zip },
          testCardNumber: config?.testMode ? digits : undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        transId?: string;
        testMode?: boolean;
        amountPaid?: number;
      };
      setBusy(false);
      if (!res.ok) {
        setError(data.error || "Payment failed. Please try again.");
        return;
      }

      const nextReceipt: PaymentReceiptData = {
        orderNumber,
        amount: data.amountPaid ?? total,
        transId: data.transId,
        paidAt: new Date().toISOString(),
        cardLast4: cardLast4(digits),
        cardBrand: brandLabel(brand),
        testMode: data.testMode,
        patientName,
      };
      setReceipt(nextReceipt);
      onPaid?.();
    };

    if (config?.testMode) {
      await submit({
        dataDescriptor: "COMMON.ACCEPT.INAPP.PAYMENT",
        dataValue: `TESTCARD:${digits}`,
      });
      return;
    }

    if (!config?.configured) {
      setBusy(false);
      setError("Live payments are not configured yet. Contact concierge.");
      return;
    }

    if (!ready || !window.Accept) {
      setBusy(false);
      setError("Secure payment is still loading. Please wait a moment.");
      return;
    }

    window.Accept.dispatchData(
      {
        authData: {
          clientKey: config.clientKey,
          apiLoginID: config.apiLoginId,
        },
        cardData: {
          cardNumber: digits,
          month: expMonth,
          year: expYear,
          cardCode: cvv,
          zip,
        },
      },
      (response) => {
        if (response.messages?.resultCode === "Error" || !response.opaqueData) {
          setBusy(false);
          setError(response.messages?.message?.[0]?.text || "Card validation failed.");
          return;
        }
        void submit(response.opaqueData);
      },
    );
  }

  if (receipt) {
    return <PaymentReceipt receipt={receipt} />;
  }

  return (
    <div className="animate-fade-up overflow-hidden rounded-2xl border border-[#e7dcc8] bg-gradient-to-b from-[#fffdf9] to-[#fffaf3] shadow-[0_12px_40px_rgba(31,26,21,0.07)]">
      <div className="border-b border-[#efe4d4] bg-[#fffcf7] px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Secure checkout</p>
            <p className="mt-1 font-serif text-2xl text-[#1f1a15]">${total.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[11px] tracking-wide text-[#8a7d6c]">{orderNumber}</p>
            <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-[#6f6251]">
              <Lock className="h-3 w-3" aria-hidden />
              Encrypted
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-6">
        <PaymentCardPreview
          cardNumber={cardNumber}
          expMonth={expMonth}
          expYear={expYear}
          cvv={cvv}
          flipped={flipped}
          holderName={patientName ?? undefined}
        />

        {config?.testMode ? (
          <div className="rounded-xl border border-[#d4b87a]/60 bg-[#fff8e8] px-4 py-3 text-xs text-[#6f5230]">
            <p className="font-medium">Test mode — no real charge</p>
            <p className="mt-1">{config.testCard?.hint}</p>
            <button
              type="button"
              onClick={fillTestCard}
              className="mt-2 rounded-lg border border-[#b78d4b80] bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[#8f6f3e]"
            >
              Fill test card
            </button>
          </div>
        ) : null}

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Card number</span>
            <input
              className={`${fieldClass(focusField === "number")} w-full font-mono tracking-wider`}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              onFocus={() => setFocusField("number")}
              onBlur={() => setFocusField(null)}
              inputMode="numeric"
              autoComplete="cc-number"
              maxLength={19}
            />
          </label>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Month</span>
              <input
                className={fieldClass(focusField === "expMonth")}
                placeholder="MM"
                value={expMonth}
                onChange={(e) => setExpMonth(digitsOnly(e.target.value).slice(0, 2))}
                onFocus={() => setFocusField("expMonth")}
                onBlur={() => setFocusField(null)}
                inputMode="numeric"
                autoComplete="cc-exp-month"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Year</span>
              <input
                className={fieldClass(focusField === "expYear")}
                placeholder="YYYY"
                value={expYear}
                onChange={(e) => setExpYear(digitsOnly(e.target.value).slice(0, 4))}
                onFocus={() => setFocusField("expYear")}
                onBlur={() => setFocusField(null)}
                inputMode="numeric"
                autoComplete="cc-exp-year"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">CVV</span>
              <input
                className={fieldClass(focusField === "cvv")}
                placeholder="•••"
                value={cvv}
                onChange={(e) => setCvv(digitsOnly(e.target.value).slice(0, brand === "amex" ? 4 : 3))}
                onFocus={() => setFocusField("cvv")}
                onBlur={() => setFocusField(null)}
                inputMode="numeric"
                autoComplete="cc-csc"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">ZIP</span>
              <input
                className={fieldClass(focusField === "zip")}
                placeholder="33160"
                value={zip}
                onChange={(e) => setZip(e.target.value.slice(0, 10))}
                onFocus={() => setFocusField("zip")}
                onBlur={() => setFocusField(null)}
                autoComplete="postal-code"
              />
            </label>
          </div>
        </div>

        {error ? (
          <p className="rounded-xl border border-[#f0d4d4] bg-[#fff6f6] px-4 py-3 text-sm text-[#7c2c2c]">{error}</p>
        ) : null}

        <button
          type="button"
          disabled={busy}
          onClick={() => void pay()}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#a67c32] via-[#b78d4b] to-[#a67c32] px-4 py-4 text-sm font-medium tracking-[0.06em] text-white shadow-[0_8px_24px_rgba(183,141,75,0.35)] disabled:opacity-60"
        >
          <span
            className={`relative z-10 inline-flex items-center justify-center gap-2 ${busy ? "animate-pulse-soft" : ""}`}
          >
            {busy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing payment…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" aria-hidden />
                {config?.testMode ? `${buttonLabel ?? "Accept & pay"} (test)` : buttonLabel ?? "Accept & pay"}
              </>
            )}
          </span>
          {!busy ? (
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          ) : null}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-[#8a7d6c]">
          Your card details are encrypted and never stored on our servers.
        </p>
      </div>
    </div>
  );
}
