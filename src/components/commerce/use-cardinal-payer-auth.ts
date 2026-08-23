"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BillTo } from "@/lib/commerce/billing-address";
import { digitsOnly, parseExpiryField } from "@/components/commerce/payment-card-utils";

type PayerAuthOutcome = {
  cavv?: string;
  eciFlag?: string;
};

type StartInput = {
  orderNumber: string;
  amount: number;
  cardNumber: string;
  expiry: string;
  billTo: BillTo;
};

declare global {
  interface Window {
    Cardinal?: {
      configure: (opts: { logging?: { level: string } }) => void;
      setup: (action: string, opts: { jwt: string }) => void;
      start: (action: string, order: unknown) => void;
      on: (event: string, cb: (data: unknown, jwt: string) => void) => void;
    };
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export function useCardinalPayerAuth(enabled: boolean, songbirdUrl: string | null) {
  const [ready, setReady] = useState(false);
  const pendingRef = useRef<{
    resolve: (value: PayerAuthOutcome | null) => void;
    reject: (reason: Error) => void;
  } | null>(null);

  useEffect(() => {
    if (!enabled || !songbirdUrl) {
      setReady(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        await loadScript(songbirdUrl);
        if (cancelled || !window.Cardinal) return;

        window.Cardinal.configure({ logging: { level: "off" } });

        window.Cardinal.on("payments.validated", (data, jwt) => {
          const pending = pendingRef.current;
          pendingRef.current = null;
          if (!pending) return;

          void (async () => {
            try {
              const res = await fetch("/api/commerce/authorize-net/payer-auth/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jwt }),
              });
              const payload = (await res.json()) as {
                error?: string;
                actionCode?: string;
                cavv?: string | null;
                eciFlag?: string | null;
              };

              if (!res.ok) {
                pending.reject(new Error(payload.error || "Bank verification failed."));
                return;
              }

              if (payload.actionCode === "SUCCESS") {
                pending.resolve({
                  cavv: payload.cavv ?? undefined,
                  eciFlag: payload.eciFlag ?? undefined,
                });
                return;
              }

              if (payload.actionCode === "NOACTION") {
                pending.resolve(null);
                return;
              }

              pending.reject(
                new Error(
                  payload.actionCode === "FAILURE"
                    ? "Your bank could not verify this card. Try another card or contact your bank."
                    : "Bank verification was interrupted. Please try again.",
                ),
              );
            } catch (error) {
              pending.reject(error instanceof Error ? error : new Error("Bank verification failed."));
            }
          })();
        });

        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setReady(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, songbirdUrl]);

  const initSession = useCallback(async (orderNumber: string) => {
    if (!enabled || !window.Cardinal) return;
    const res = await fetch("/api/commerce/authorize-net/payer-auth/jwt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber }),
    });
    const data = (await res.json()) as { jwt?: string; error?: string };
    if (!res.ok || !data.jwt) {
      throw new Error(data.error || "3D Secure could not be initialized.");
    }
    window.Cardinal.setup("init", { jwt: data.jwt });
  }, [enabled]);

  const startAuthentication = useCallback(
    (input: StartInput) =>
      new Promise<PayerAuthOutcome | null>((resolve, reject) => {
        if (!enabled || !window.Cardinal) {
          resolve(null);
          return;
        }

        const digits = digitsOnly(input.cardNumber);
        const { month, year } = parseExpiryField(input.expiry);
        if (!month || !year) {
          reject(new Error("Enter a valid expiration date."));
          return;
        }

        pendingRef.current = { resolve, reject };

        window.Cardinal.start("cca", {
          OrderDetails: {
            Amount: input.amount.toFixed(2),
            CurrencyCode: "840",
          },
          Consumer: {
            Account: {
              AccountNumber: digits,
              ExpirationMonth: parseInt(month, 10),
              ExpirationYear: parseInt(year.slice(-2), 10),
            },
            BillingAddress: {
              FirstName: input.billTo.firstName,
              LastName: input.billTo.lastName,
              Address1: input.billTo.address,
              City: input.billTo.city,
              State: input.billTo.state,
              PostalCode: input.billTo.zip,
              CountryCode: "840",
            },
          },
        });
      }),
    [enabled],
  );

  return { ready, initSession, startAuthentication };
}
