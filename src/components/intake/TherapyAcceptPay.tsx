"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { PaymentCardPreview } from "@/components/commerce/PaymentCardPreview";
import { PaymentReceipt, type PaymentReceiptData } from "@/components/commerce/PaymentReceipt";
import {
  brandLabel,
  cardLast4,
  detectCardBrand,
  digitsOnly,
  formatCardNumber,
  formatExpiryField,
  maxCardDigits,
  maxCvvDigits,
  parseExpiryField,
} from "@/components/commerce/payment-card-utils";
import { type BillTo, splitFullName, US_STATES, validateBillTo } from "@/lib/commerce/billing-address";
import { useCardinalPayerAuth } from "@/components/commerce/use-cardinal-payer-auth";

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
  payerAuthEnabled?: boolean;
  songbirdUrl?: string | null;
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

type FocusField = "number" | "expiry" | "cvv" | "zip" | null;

function fieldClass(active: boolean) {
  return `rounded-xl border bg-white px-3.5 py-3 text-sm text-[#1f1a15] outline-none transition-all duration-200 ${
    active
      ? "border-[#b78d4b] ring-2 ring-[#b78d4b33] shadow-[0_0_0_4px_rgba(183,141,75,0.08)]"
      : "border-[#e7dcc8] hover:border-[#d4c2a0]"
  }`;
}

function focusInput(ref: React.RefObject<HTMLInputElement | null>) {
  requestAnimationFrame(() => {
    ref.current?.focus();
    ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

function useFieldFocus(
  setFocusField: React.Dispatch<React.SetStateAction<FocusField>>,
  blurTimerRef: React.RefObject<number | null>,
) {
  return {
    onFocus(field: FocusField, afterFocus?: () => void) {
      if (blurTimerRef.current) {
        window.clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }
      setFocusField(field);
      afterFocus?.();
    },
    onBlur(field: FocusField) {
      blurTimerRef.current = window.setTimeout(() => {
        setFocusField((current) => (current === field ? null : current));
      }, 120);
    },
  };
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
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("FL");
  const [zip, setZip] = useState("");
  const [focusField, setFocusField] = useState<FocusField>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceiptData | null>(initialReceipt ?? null);

  const cardRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const cardPreviewRef = useRef<HTMLDivElement>(null);
  const blurTimerRef = useRef<number | null>(null);

  const { month: expMonth, year: expYear } = parseExpiryField(expiry);
  const flipped = focusField === "cvv";
  const brand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);
  const fieldFocus = useFieldFocus(setFocusField, blurTimerRef);
  const holderName = [firstName, lastName].filter(Boolean).join(" ") || patientName || undefined;
  const payerAuth = useCardinalPayerAuth(Boolean(config?.payerAuthEnabled), config?.songbirdUrl ?? null);

  useEffect(() => {
    const split = splitFullName(patientName);
    setFirstName((current) => current || split.firstName);
    setLastName((current) => current || split.lastName);
  }, [patientName]);

  useEffect(() => {
    if (!config?.payerAuthEnabled || !payerAuth.ready) return;
    void payerAuth.initSession(orderNumber).catch(() => {
      /* 3DS optional — checkout still works without it */
    });
  }, [config?.payerAuthEnabled, orderNumber, payerAuth.ready, payerAuth.initSession]);

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
    setExpiry(formatExpiryField(`${config.testCard.expMonth}${config.testCard.expYear.slice(-2)}`));
    setCvv(config.testCard.cvv);
    setZip(config.testCard.zip);
    setAddress("123 Main Street");
    setCity("Miami");
    setState("FL");
    setError("");
  }

  function handleCardNumberChange(raw: string) {
    const digits = digitsOnly(raw);
    const max = maxCardDigits(detectCardBrand(digits));
    const next = formatCardNumber(digits.slice(0, max));
    setCardNumber(next);
    if (digitsOnly(next).length >= max) {
      focusInput(expiryRef);
    }
  }

  function handleExpiryChange(raw: string) {
    const digits = digitsOnly(raw).slice(0, 4);
    setExpiry(formatExpiryField(digits));
    if (digits.length >= 4) {
      focusInput(cvvRef);
    }
  }

  function handleCvvChange(raw: string) {
    const digits = digitsOnly(raw).slice(0, maxCvvDigits(brand));
    setCvv(digits);
    if (digits.length >= maxCvvDigits(brand)) {
      focusInput(addressRef);
    }
  }

  function handleFieldKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    value: string,
    previous?: React.RefObject<HTMLInputElement | null>,
  ) {
    if (e.key !== "Backspace" || value.length > 0) return;
    e.preventDefault();
    if (previous) focusInput(previous);
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

    const billing = validateBillTo({ firstName, lastName, address, city, state, zip, country: "US" });
    if (!billing.ok) {
      setBusy(false);
      setError(billing.error);
      return;
    }

    const submit = async (
      opaqueData: { dataDescriptor: string; dataValue: string },
      payerAuthentication?: { cavv?: string; eciFlag?: string },
    ) => {
      const res = await fetch(endpoint ?? `/api/commerce/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opaqueData,
          billTo: billing.value,
          payerAuthentication,
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

    const runAcceptJs = async (payerAuthentication?: { cavv?: string; eciFlag?: string }) => {
      if (config?.testMode) {
        await submit(
          {
            dataDescriptor: "COMMON.ACCEPT.INAPP.PAYMENT",
            dataValue: `TESTCARD:${digits}`,
          },
          payerAuthentication,
        );
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
            fullName: `${billing.value.firstName} ${billing.value.lastName}`.trim(),
            address: billing.value.address,
            city: billing.value.city,
            state: billing.value.state,
            zip: billing.value.zip,
            country: "US",
          },
        },
        (response) => {
          if (response.messages?.resultCode === "Error" || !response.opaqueData) {
            setBusy(false);
            setError(response.messages?.message?.[0]?.text || "Card validation failed.");
            return;
          }
          void submit(response.opaqueData, payerAuthentication);
        },
      );
    };

    try {
      if (config?.payerAuthEnabled && payerAuth.ready) {
        setError("");
        const authResult = await payerAuth.startAuthentication({
          orderNumber,
          amount: total,
          cardNumber,
          expiry,
          billTo: billing.value,
        });
        await runAcceptJs(
          authResult?.cavv && authResult?.eciFlag
            ? { cavv: authResult.cavv, eciFlag: authResult.eciFlag }
            : undefined,
        );
        return;
      }

      await runAcceptJs();
    } catch (authError) {
      setBusy(false);
      setError(authError instanceof Error ? authError.message : "Bank verification failed.");
    }
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
        <div ref={cardPreviewRef} className="transition-transform duration-300">
          <PaymentCardPreview
            cardNumber={cardNumber}
            expMonth={expMonth}
            expYear={expYear}
            cvv={cvv}
            flipped={flipped}
            holderName={holderName}
          />
        </div>

        {config?.payerAuthEnabled ? (
          <p className="rounded-xl border border-[#dbe8f2] bg-[#f5faff] px-4 py-3 text-xs leading-relaxed text-[#4a6278]">
            Bank verification (3D Secure) is enabled. If your card issuer requires it, you may see a confirmation
            code or approval step from your bank during checkout.
          </p>
        ) : null}

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
              ref={cardRef}
              className={`${fieldClass(focusField === "number")} w-full font-mono tracking-wider`}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              onFocus={() => fieldFocus.onFocus("number")}
              onBlur={() => fieldFocus.onBlur("number")}
              onKeyDown={(e) => handleFieldKeyDown(e, cardNumber)}
              inputMode="numeric"
              autoComplete="cc-number"
              maxLength={19}
            />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="col-span-1 block sm:col-span-1">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Expires</span>
              <input
                ref={expiryRef}
                className={`${fieldClass(focusField === "expiry")} w-full font-mono tracking-widest`}
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => handleExpiryChange(e.target.value)}
                onFocus={() => fieldFocus.onFocus("expiry")}
                onBlur={() => fieldFocus.onBlur("expiry")}
                onKeyDown={(e) => handleFieldKeyDown(e, expiry, cardRef)}
                inputMode="numeric"
                autoComplete="cc-exp"
                maxLength={7}
              />
            </label>
            <label className="col-span-2 block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">CVV</span>
              <input
                ref={cvvRef}
                className={`${fieldClass(focusField === "cvv")} w-full font-mono tracking-widest`}
                placeholder="•••"
                value={cvv}
                onChange={(e) => handleCvvChange(e.target.value)}
                onFocus={() =>
                  fieldFocus.onFocus("cvv", () => {
                    cardPreviewRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
                  })
                }
                onBlur={() => fieldFocus.onBlur("cvv")}
                onKeyDown={(e) => handleFieldKeyDown(e, cvv, expiryRef)}
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={brand === "amex" ? 4 : 3}
              />
            </label>
          </div>

          <div className="rounded-xl border border-[#efe4d4] bg-[#fffcf7] p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Billing address</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#8a7d6c]">
              Must match the address on your card statement. This helps your bank approve the charge.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">First name</span>
                <input
                  className={`${fieldClass(false)} w-full`}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="billing given-name"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Last name</span>
                <input
                  className={`${fieldClass(false)} w-full`}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="billing family-name"
                />
              </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Street address</span>
              <input
                ref={addressRef}
                className={`${fieldClass(false)} w-full`}
                placeholder="123 Ocean Drive"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="billing address-line1"
              />
            </label>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="block sm:col-span-1">
                <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">City</span>
                <input
                  className={`${fieldClass(false)} w-full`}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  autoComplete="billing address-level2"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">State</span>
                <select
                  className={`${fieldClass(false)} w-full`}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  autoComplete="billing address-level1"
                >
                  {US_STATES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">ZIP</span>
                <input
                  ref={zipRef}
                  className={`${fieldClass(focusField === "zip")} w-full`}
                  placeholder="33160"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/[^\d-]/g, "").slice(0, 10))}
                  onFocus={() => fieldFocus.onFocus("zip")}
                  onBlur={() => fieldFocus.onBlur("zip")}
                  autoComplete="billing postal-code"
                  inputMode="numeric"
                />
              </label>
            </div>
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
