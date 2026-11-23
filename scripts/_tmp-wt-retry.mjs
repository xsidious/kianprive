import "dotenv/config";

const base = (process.env.WT_API_URL || process.env.WELLNESS_TECH_API_URL || "").replace(/\/$/, "");
const secret = process.env.WT_PARTNER_ORDER_SECRET?.trim();
const distributionOrderId = "cmvz9vrjq0003l507xd0reez0";
const externalRef = "KP-THERAPY-1793624210951";

console.log("WT base", base ? "set" : "missing", "secret", secret ? "set" : "missing");

const retry = await fetch(`${base}/api/partner/orders/retry`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-wt-partner-secret": secret,
    "x-wt-partner-site": "kian-prive",
  },
  body: JSON.stringify({ orderId: distributionOrderId, externalRef }),
});
const retryJson = await retry.json().catch(() => ({}));
console.log("RETRY", retry.status, JSON.stringify(retryJson, null, 2));

for (const path of [
  `/api/partner/orders/${distributionOrderId}`,
  `/api/partner/orders?externalRef=${encodeURIComponent(externalRef)}`,
  `/api/partner/orders/status?externalRef=${encodeURIComponent(externalRef)}`,
  `/api/partner/orders/by-ref/${encodeURIComponent(externalRef)}`,
]) {
  try {
    const res = await fetch(`${base}${path}`, {
      headers: {
        "x-wt-partner-secret": secret,
        "x-wt-partner-site": "kian-prive",
      },
    });
    const text = await res.text();
    console.log("GET", path, res.status, text.slice(0, 800));
  } catch (e) {
    console.log("GET fail", path, e.message);
  }
}
