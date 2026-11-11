/** 7% sales tax on retail hair, skincare, and nutrients only. */
export const SALES_TAX_RATE = 0.07;

const TAXABLE_CATEGORIES = new Set([
  "hair care",
  "skincare",
  "korean skincare",
  "nutrients",
]);

export function isTaxableProductCategory(category: string | null | undefined): boolean {
  if (!category) return false;
  return TAXABLE_CATEGORIES.has(category.trim().toLowerCase());
}

/** Round money to cents (half-up). */
export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculateSalesTax(
  lines: Array<{ category?: string | null; amount: number }>,
  rate = SALES_TAX_RATE,
): number {
  const taxable = lines.reduce((sum, line) => {
    if (!isTaxableProductCategory(line.category)) return sum;
    return sum + line.amount;
  }, 0);
  return roundMoney(taxable * rate);
}
