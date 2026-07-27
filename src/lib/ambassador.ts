export function publicAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://www.kianprive.com").replace(/\/$/, "");
}

export function ambassadorReferralLinks(code: string, baseUrl = publicAppUrl()) {
  const c = code.toUpperCase();
  return {
    code: c,
    shop: `${baseUrl}/shop?partner=${c}`,
    home: `${baseUrl}/?partner=${c}`,
    book: `${baseUrl}/book-online?partner=${c}`,
  };
}

export function qrCodeImageUrl(data: string, size = 240) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}
