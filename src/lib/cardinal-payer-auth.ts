import crypto from "crypto";

export type PayerAuthenticationResult = {
  actionCode: "SUCCESS" | "NOACTION" | "FAILURE" | "ERROR" | string;
  cavv?: string;
  eciFlag?: string;
  xid?: string;
  enrolled?: string;
};

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signJwt(payload: Record<string, unknown>, secret: string) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

function decodeJwtPayload<T = Record<string, unknown>>(jwt: string): T {
  const parts = jwt.split(".");
  if (parts.length < 2) throw new Error("Invalid authentication response.");
  const json = Buffer.from(parts[1]!.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  return JSON.parse(json) as T;
}

function verifyJwtSignature(jwt: string, secret: string) {
  const parts = jwt.split(".");
  if (parts.length !== 3) return false;
  const [header, payload, signature] = parts;
  const expected = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  const a = Buffer.from(signature ?? "");
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function cardinalPayerAuthConfigured() {
  return Boolean(
    process.env.CARDINAL_API_KEY &&
      process.env.CARDINAL_API_ID &&
      process.env.CARDINAL_ORG_UNIT,
  );
}

export function cardinalSongbirdUrl() {
  const env = (process.env.AUTHORIZE_NET_ENV || "sandbox").toLowerCase();
  return env === "production"
    ? "https://songbird.cardinalcommerce.com/edge/v1/songbird.js"
    : "https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js";
}

export function generateCardinalSetupJwt(orderNumber: string) {
  const apiKey = process.env.CARDINAL_API_KEY;
  const apiId = process.env.CARDINAL_API_ID;
  const orgUnit = process.env.CARDINAL_ORG_UNIT;
  if (!apiKey || !apiId || !orgUnit) {
    throw new Error("3D Secure is not configured on the server.");
  }

  const now = Math.floor(Date.now() / 1000);
  return signJwt(
    {
      jti: crypto.randomUUID(),
      iss: apiId,
      iat: now,
      exp: now + 3600,
      OrgUnitId: orgUnit,
      Payload: {
        OrderDetails: {
          OrderNumber: orderNumber.slice(0, 20),
        },
      },
      ObjectifyPayload: true,
    },
    apiKey,
  );
}

type CardinalValidatePayload = {
  ActionCode?: string;
  Payment?: {
    ExtendedData?: {
      CAVV?: string;
      ECIFlag?: string;
      XID?: string;
      Enrolled?: string;
    };
  };
};

export function validateCardinalResponseJwt(jwt: string): PayerAuthenticationResult {
  const apiKey = process.env.CARDINAL_API_KEY;
  if (!apiKey) throw new Error("3D Secure is not configured on the server.");
  if (!verifyJwtSignature(jwt, apiKey)) {
    throw new Error("Bank verification response could not be verified.");
  }

  const payload = decodeJwtPayload<CardinalValidatePayload>(jwt);
  const extended = payload.Payment?.ExtendedData;

  return {
    actionCode: payload.ActionCode ?? "ERROR",
    cavv: extended?.CAVV,
    eciFlag: extended?.ECIFlag,
    xid: extended?.XID,
    enrolled: extended?.Enrolled,
  };
}
