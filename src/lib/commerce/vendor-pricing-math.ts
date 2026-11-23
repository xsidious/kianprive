export type PricingConfig = {
  marginPercent: number;
  extraDollars: number;
  includeStoreShipping: boolean;
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  marginPercent: 40,
  extraDollars: 0,
  includeStoreShipping: true,
};

export type VendorOfferInput = {
  id: string;
  vendorId: string;
  vendorName?: string;
  unitCost: number;
  shippingCost: number;
};

export function normalizePricingConfig(raw: unknown): PricingConfig {
  const base = { ...DEFAULT_PRICING_CONFIG };
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  const marginPercent = Number(obj.marginPercent);
  const extraDollars = Number(obj.extraDollars);
  return {
    marginPercent: Number.isFinite(marginPercent) && marginPercent >= 0 ? marginPercent : base.marginPercent,
    extraDollars: Number.isFinite(extraDollars) && extraDollars >= 0 ? extraDollars : base.extraDollars,
    includeStoreShipping: obj.includeStoreShipping == null ? base.includeStoreShipping : Boolean(obj.includeStoreShipping),
  };
}

export function roundMoney(value: number) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function landedCost(unitCost: number, shippingCost = 0) {
  return roundMoney(Math.max(0, unitCost) + Math.max(0, shippingCost));
}

export function pickBestOffer<T extends VendorOfferInput>(offers: T[]) {
  // Ignore $0 / placeholder offers so they cannot beat real vendor costs
  // (that previously made every suggested retail land on flatRate × margin, e.g. $35 × 1.4 = $49).
  const usable = offers.filter((o) => Number(o.unitCost) > 0);
  if (!usable.length) return null;
  return [...usable].sort((a, b) => {
    const diff = landedCost(a.unitCost, a.shippingCost) - landedCost(b.unitCost, b.shippingCost);
    if (diff !== 0) return diff;
    return a.vendorName?.localeCompare(b.vendorName ?? "") ?? 0;
  })[0];
}

/**
 * Suggested patient unit price from vendor landed cost + margin.
 * Do not bake the full cart flat-rate shipping into every SKU — that made nearly all
 * low-cost clinical items suggest ~$49 ($35 ship × 40% margin). Shipping is charged on the order.
 */
export function suggestedRetailPrice(args: {
  landedCost: number;
  pricing: PricingConfig;
  outboundShipping?: number;
}) {
  if (!(args.landedCost > 0)) return null;
  // Per-SKU suggestions use product cost only. `includeStoreShipping` is reserved for
  // explicit all-in quotes (pass outbound intentionally); catalog serialize passes 0.
  const outbound = args.pricing.includeStoreShipping ? Math.max(0, args.outboundShipping ?? 0) : 0;
  const covered = roundMoney(args.landedCost + outbound);
  const withMargin = roundMoney(covered * (1 + args.pricing.marginPercent / 100));
  return roundMoney(withMargin + args.pricing.extraDollars);
}

export function lineProfit(args: { unitPrice: number; quantity: number; landedCost: number | null }) {
  if (args.landedCost == null || args.landedCost <= 0) return null;
  return roundMoney((args.unitPrice - args.landedCost) * args.quantity);
}
