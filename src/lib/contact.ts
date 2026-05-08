export const conciergePhoneE164 = "13059182570";
export const conciergeEmail = "contact@kianprive.com";

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${conciergePhoneE164}?text=${encodeURIComponent(message)}`;
}
