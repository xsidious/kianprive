export const FREE_SHIPPING_THRESHOLD = 150;
export const STANDARD_SHIPPING_FLAT = 12;

export function calculateShipping(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FLAT;
}
