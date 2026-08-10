/**
 * Authorize.net Accept.js charge helper + test payment mode.
 *
 * Env:
 *  THERAPY_PAYMENT_MODE=test|live   (default: test until AuthNet keys exist)
 *  AUTHORIZE_NET_API_LOGIN_ID
 *  AUTHORIZE_NET_TRANSACTION_KEY
 *  AUTHORIZE_NET_ENV=sandbox|production
 *  NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY
 *  NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID
 */

type OpaqueData = { dataDescriptor: string; dataValue: string };

type ChargeInput = {
  amount: number;
  orderNumber: string;
  opaqueData: OpaqueData;
  email?: string;
  billTo?: { firstName?: string; lastName?: string; zip?: string };
  /** Present in test mode when the member typed a card in the form */
  testCardNumber?: string;
};

/** Visa success card used in UI + docs while THERAPY_PAYMENT_MODE=test */
export const THERAPY_TEST_CARD = {
  number: "4111111111111111",
  expMonth: "12",
  expYear: "2030",
  cvv: "123",
  zip: "10001",
  label: "Visa test card (no real charge)",
};

const DECLINE_TEST_CARD = "4000000000000002";

function endpoint() {
  const env = (process.env.AUTHORIZE_NET_ENV || "sandbox").toLowerCase();
  return env === "production"
    ? "https://api.authorize.net/xml/v1/request.api"
    : "https://apitest.authorize.net/xml/v1/request.api";
}

export function authorizeNetConfigured() {
  return Boolean(process.env.AUTHORIZE_NET_API_LOGIN_ID && process.env.AUTHORIZE_NET_TRANSACTION_KEY);
}

/**
 * Test mode until AuthNet keys are set, or when THERAPY_PAYMENT_MODE=test.
 * Set THERAPY_PAYMENT_MODE=live once real processing should be required.
 */
export function isTherapyPaymentTestMode() {
  const mode = (process.env.THERAPY_PAYMENT_MODE || "").toLowerCase();
  if (mode === "live") return false;
  if (mode === "test") return true;
  return !authorizeNetConfigured();
}

export function authorizeNetPublicConfig() {
  const testMode = isTherapyPaymentTestMode();
  return {
    configured: Boolean(
      process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID && process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY,
    ),
    apiLoginId: process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID || "",
    clientKey: process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY || "",
    env: (process.env.AUTHORIZE_NET_ENV || "sandbox").toLowerCase(),
    testMode,
    testCard: testMode
      ? {
          number: THERAPY_TEST_CARD.number,
          expMonth: THERAPY_TEST_CARD.expMonth,
          expYear: THERAPY_TEST_CARD.expYear,
          cvv: THERAPY_TEST_CARD.cvv,
          zip: THERAPY_TEST_CARD.zip,
          hint: "Use 4111 1111 1111 1111 — simulated payment only. Decline: 4000 0000 0000 0002",
        }
      : null,
  };
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function simulateTestCharge(input: ChargeInput) {
  const fromOpaque = input.opaqueData.dataValue?.startsWith("TESTCARD:")
    ? input.opaqueData.dataValue.slice("TESTCARD:".length)
    : "";
  const card = digitsOnly(input.testCardNumber || fromOpaque || "");

  if (!card || card.length < 13) {
    throw new Error("Enter a card number to run the test payment.");
  }

  if (card === DECLINE_TEST_CARD) {
    throw new Error("Test card declined (as expected for 4000 0000 0000 0002).");
  }

  // Accept any plausible PAN in test mode; prefer the documented Visa test card.
  if (card.length < 13 || card.length > 19) {
    throw new Error("Enter a valid-looking test card number (13–19 digits).");
  }

  return {
    transId: `TEST-${Date.now()}`,
    authCode: "TESTOK",
    testMode: true as const,
    raw: { mode: "test", last4: card.slice(-4), amount: input.amount },
  };
}

export async function chargeAuthorizeNetCard(input: ChargeInput) {
  if (isTherapyPaymentTestMode()) {
    return simulateTestCharge(input);
  }

  if (!authorizeNetConfigured()) {
    throw new Error("Authorize.net is not configured. Set keys or THERAPY_PAYMENT_MODE=test.");
  }

  const payload = {
    createTransactionRequest: {
      merchantAuthentication: {
        name: process.env.AUTHORIZE_NET_API_LOGIN_ID,
        transactionKey: process.env.AUTHORIZE_NET_TRANSACTION_KEY,
      },
      refId: input.orderNumber.slice(0, 20),
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: input.amount.toFixed(2),
        payment: {
          opaqueData: {
            dataDescriptor: input.opaqueData.dataDescriptor,
            dataValue: input.opaqueData.dataValue,
          },
        },
        order: {
          invoiceNumber: input.orderNumber.slice(0, 20),
          description: "KIAN Prive order",
        },
        customer: input.email ? { email: input.email } : undefined,
        billTo: input.billTo
          ? {
              firstName: input.billTo.firstName,
              lastName: input.billTo.lastName,
              zip: input.billTo.zip,
            }
          : undefined,
      },
    },
  };

  const response = await fetch(endpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as {
    messages?: { resultCode?: string; message?: Array<{ text?: string }> };
    transactionResponse?: {
      transId?: string;
      authCode?: string;
      errors?: Array<{ errorText?: string }>;
      messages?: Array<{ description?: string }>;
    };
  };

  const resultCode = data.messages?.resultCode;
  const transId = data.transactionResponse?.transId;
  if (resultCode !== "Ok" || !transId) {
    const err =
      data.transactionResponse?.errors?.[0]?.errorText ||
      data.messages?.message?.[0]?.text ||
      "Authorize.net declined the payment.";
    throw new Error(err);
  }

  return {
    transId,
    authCode: data.transactionResponse?.authCode ?? "",
    testMode: false as const,
    raw: data,
  };
}
