"use client";

import { money } from "@/components/admin/ui";

export type VendorOffer = {
  id: string;
  vendorId: string;
  vendorName: string;
  unitCost: number;
  shippingCost: number;
  landedCost: number;
};

type Props = {
  bestVendor?: VendorOffer | null;
  landedCost?: number | null;
  price: number;
  suggestedPrice?: number | null;
  compact?: boolean;
};

export function ProductPricingHint({ bestVendor, landedCost, price, suggestedPrice, compact }: Props) {
  if (!bestVendor && !landedCost && price <= 0 && !suggestedPrice) {
    return <p className="text-xs text-[#7c2c2c]">Add vendor quotes</p>;
  }

  if (compact) {
    return (
      <p className="text-xs text-[#6f6251]">
        {bestVendor ? `${bestVendor.vendorName} · cost ${money(bestVendor.landedCost)}` : landedCost ? `Cost ${money(landedCost)}` : null}
        {suggestedPrice ? ` · suggest ${money(suggestedPrice)}` : price > 0 ? ` · sell ${money(price)}` : null}
      </p>
    );
  }

  const profit = price > 0 && (landedCost ?? bestVendor?.landedCost) ? price - (landedCost ?? bestVendor!.landedCost) : null;

  return (
    <div className="mt-1 space-y-0.5 text-xs text-[#6f6251]">
      {bestVendor ? (
        <p>
          Best: <span className="text-[#4f4335]">{bestVendor.vendorName}</span> · product {money(bestVendor.unitCost)} + ship{" "}
          {money(bestVendor.shippingCost)} = {money(bestVendor.landedCost)}
        </p>
      ) : landedCost ? (
        <p>Vendor cost: {money(landedCost)}</p>
      ) : null}
      {suggestedPrice ? <p className="text-[#8f6f3e]">Suggested sell: {money(suggestedPrice)}</p> : null}
      {price > 0 ? (
        <p>
          Your price: {money(price)}
          {profit != null ? <span className="text-[#2f6b3a]"> · profit {money(profit)}/unit</span> : null}
        </p>
      ) : null}
    </div>
  );
}
