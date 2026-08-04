"use client";

import { useEffect, useState } from "react";

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
  onPaid?: () => void;
};

export function TherapyAcceptPay({ orderId, total, orderNumber, onPaid }: Props) {
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

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
    setCardNumber(config.testCard.number);
    setExpMonth(config.testCard.expMonth);
    setExpYear(config.testCard.expYear);
    setCvv(config.testCard.cvv);
    setZip(config.testCard.zip);
    setStatus("");
  }

  async function pay() {
    setBusy(true);
    setStatus("");

    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 13) {
      setBusy(false);
      setStatus("Enter a card number (use the test card button in test mode).");
      return;
    }

    const submit = async (opaqueData: { dataDescriptor: string; dataValue: string }) => {
      const res = await fetch(`/api/commerce/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opaqueData,
          billTo: { zip },
          testCardNumber: config?.testMode ? digits : undefined,
        }),
      });
      const data = await res.json();
      setBusy(false);
      if (!res.ok) {
        setStatus(data.error || "Payment failed.");
        return;
      }
      setStatus(
        data.testMode
          ? "Test payment recorded — no real charge. Order marked paid."
          : "Payment successful. Thank you.",
      );
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
      setStatus("Authorize.net is not configured for live payments.");
      return;
    }

    if (!ready || !window.Accept) {
      setBusy(false);
      setStatus("Payment form still loading. Try again in a moment.");
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
          setStatus(response.messages?.message?.[0]?.text || "Card validation failed.");
          return;
        }
        void submit(response.opaqueData);
      },
    );
  }

  return (
    <div className="rounded-2xl border border-[#efe4d4] bg-[#fffaf3] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Accept &amp; pay</p>
      <p className="mt-1 font-serif text-2xl text-[#1f1a15]">${total.toFixed(2)}</p>
      <p className="mt-1 text-xs text-[#6f6251]">Order {orderNumber}</p>

      {config?.testMode ? (
        <div className="mt-3 rounded-lg border border-[#d4b87a] bg-[#fff8e8] px-3 py-2 text-xs text-[#6f5230]">
          <p className="font-medium">Test payment mode — no real charge</p>
          <p className="mt-1">{config.testCard?.hint}</p>
          <button
            type="button"
            onClick={fillTestCard}
            className="mt-2 rounded-sm border border-[#b78d4b80] bg-white px-3 py-1.5 text-[#8f6f3e]"
          >
            Fill Visa test card
          </button>
        </div>
      ) : (
        <p className="mt-1 text-xs text-[#6f6251]">Secure card payment</p>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <input
          className="rounded-sm border border-[#b78d4b35] bg-white px-3 py-2 text-sm sm:col-span-2"
          placeholder="Card number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          inputMode="numeric"
          autoComplete="cc-number"
        />
        <input
          className="rounded-sm border border-[#b78d4b35] bg-white px-3 py-2 text-sm"
          placeholder="MM"
          value={expMonth}
          onChange={(e) => setExpMonth(e.target.value)}
          autoComplete="cc-exp-month"
        />
        <input
          className="rounded-sm border border-[#b78d4b35] bg-white px-3 py-2 text-sm"
          placeholder="YYYY"
          value={expYear}
          onChange={(e) => setExpYear(e.target.value)}
          autoComplete="cc-exp-year"
        />
        <input
          className="rounded-sm border border-[#b78d4b35] bg-white px-3 py-2 text-sm"
          placeholder="CVV"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          autoComplete="cc-csc"
        />
        <input
          className="rounded-sm border border-[#b78d4b35] bg-white px-3 py-2 text-sm"
          placeholder="ZIP"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          autoComplete="postal-code"
        />
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => void pay()}
        className="mt-4 w-full rounded-sm bg-[#b78d4b] px-4 py-3 text-sm text-white disabled:opacity-60"
      >
        {busy ? "Processing…" : config?.testMode ? "Accept therapy & pay (test)" : "Accept therapy & pay"}
      </button>
      {status ? <p className="mt-2 text-sm text-[#1b6568]">{status}</p> : null}
    </div>
  );
}
