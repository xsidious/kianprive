/** Build a public carrier tracking URL from a tracking number + carrier hint. */
export function buildTrackingUrl(trackingNumber: string, carrier?: string | null): string {
  const num = trackingNumber.trim();
  if (!num) return "";
  const c = (carrier || "").toLowerCase();

  if (c.includes("ups") || /^1z/i.test(num)) {
    return `https://www.ups.com/track?tracknum=${encodeURIComponent(num)}`;
  }
  if (c.includes("usps") || /^\d{20,22}$/.test(num.replace(/\s/g, ""))) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(num)}`;
  }
  if (c.includes("dhl")) {
    return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${encodeURIComponent(num)}`;
  }
  if (c.includes("ontrac")) {
    return `https://www.ontrac.com/tracking/?number=${encodeURIComponent(num)}`;
  }
  // Default FedEx (WT historically used FedEx)
  return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(num)}`;
}
