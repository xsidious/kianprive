export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function detectCardBrand(number: string): CardBrand {
  const d = digitsOnly(number);
  if (/^4/.test(d)) return "visa";
  if (/^3[47]/.test(d)) return "amex";
  if (/^6(?:011|5)/.test(d)) return "discover";
  if (/^5[1-5]/.test(d) || /^2(?:2[2-9]|[3-6]|7[01]|920)/.test(d)) return "mastercard";
  return "unknown";
}

export function formatCardNumber(number: string) {
  const d = digitsOnly(number);
  const brand = detectCardBrand(d);
  if (brand === "amex") {
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(" ");
  }
  return d.match(/.{1,4}/g)?.join(" ") ?? d;
}

export function displayCardNumber(number: string) {
  const d = digitsOnly(number);
  if (!d.length) return "•••• •••• •••• ••••";
  const brand = detectCardBrand(d);
  const length = brand === "amex" ? 15 : 16;
  const padded = d.padEnd(length, "•");
  return formatCardNumber(padded);
}

export function formatExpiry(month: string, year: string) {
  const mm = digitsOnly(month).slice(0, 2);
  const yy = digitsOnly(year).slice(-2);
  if (!mm && !yy) return "MM/YY";
  return `${mm || "MM"}/${yy || "YY"}`;
}

/** Single expiry input — digits only, displayed as MM / YY. */
export function formatExpiryField(raw: string) {
  const d = digitsOnly(raw).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)} / ${d.slice(2)}`;
}

export function parseExpiryField(raw: string) {
  const d = digitsOnly(raw).slice(0, 4);
  return {
    month: d.slice(0, 2),
    year: d.length >= 4 ? `20${d.slice(2, 4)}` : "",
  };
}

export function maxCardDigits(brand: CardBrand) {
  return brand === "amex" ? 15 : 16;
}

export function maxCvvDigits(brand: CardBrand) {
  return brand === "amex" ? 4 : 3;
}

export function cardLast4(number: string) {
  const d = digitsOnly(number);
  return d.slice(-4) || "••••";
}

export function brandLabel(brand: CardBrand) {
  switch (brand) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "amex":
      return "American Express";
    case "discover":
      return "Discover";
    default:
      return "Card";
  }
}
