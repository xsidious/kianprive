/**
 * Verify a transaction exists in Authorize.net (production API).
 * Usage: node scripts/verify-authnet-trans.mjs 81758378631
 */
import "dotenv/config";

const transId = process.argv[2];
if (!transId) {
  console.error("Usage: node scripts/verify-authnet-trans.mjs <transId>");
  process.exit(1);
}

const login = process.env.AUTHORIZE_NET_API_LOGIN_ID;
const key = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
const env = (process.env.AUTHORIZE_NET_ENV || "sandbox").toLowerCase();

if (!login || !key) {
  console.error("Missing AUTHORIZE_NET_API_LOGIN_ID or AUTHORIZE_NET_TRANSACTION_KEY in env");
  process.exit(1);
}

const endpoint =
  env === "production"
    ? "https://api.authorize.net/xml/v1/request.api"
    : "https://apitest.authorize.net/xml/v1/request.api";

const payload = {
  getTransactionDetailsRequest: {
    merchantAuthentication: { name: login, transactionKey: key },
    transId,
  },
};

const res = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const text = await res.text();
const data = JSON.parse(text.replace(/^\uFEFF/, ""));

console.log("Env:", env);
console.log("API Login ID:", login);
console.log("Endpoint:", endpoint);
console.log("\nResult:", data.messages?.resultCode);
console.log("Message:", data.messages?.message?.[0]?.text);

const tx = data.transaction;
if (tx) {
  console.log("\n--- Transaction found ---");
  console.log("transId:", tx.transId);
  console.log("submitTimeUTC:", tx.submitTimeUTC);
  console.log("submitTimeLocal:", tx.submitTimeLocal);
  console.log("transactionStatus:", tx.transactionStatus);
  console.log("responseCode:", tx.responseReasonCode, tx.responseReasonDescription);
  console.log("authAmount:", tx.authAmount);
  console.log("settleAmount:", tx.settleAmount);
  console.log("accountType:", tx.payment?.creditCard?.cardType);
  console.log("accountNumber:", tx.payment?.creditCard?.cardNumber);
  console.log("invoiceNumber:", tx.order?.invoiceNumber);
} else {
  console.log("\nNo transaction object returned.");
  console.log(JSON.stringify(data, null, 2));
}
