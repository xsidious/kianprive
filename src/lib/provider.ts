/** Public referral links for practitioners (providers). */
export function providerBookingLinks(code: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://www.kianprive.com";
  const q = encodeURIComponent(code.toUpperCase());
  return {
    code: code.toUpperCase(),
    book: `${base}/book-online?partner=${q}`,
    telemedicine: `${base}/book-online?service=telemedicine&partner=${q}`,
    shop: `${base}/shop?partner=${q}`,
    home: `${base}/?partner=${q}`,
    services: `${base}/services?partner=${q}`,
  };
}
