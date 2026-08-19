import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSettingValue } from "@/lib/settings-store";
import { getShippingConfig } from "@/lib/commerce/shipping";
import {
  DEFAULT_PRICING_CONFIG,
  type PricingConfig,
  type VendorOfferInput,
  landedCost,
  lineProfit,
  normalizePricingConfig,
  pickBestOffer,
  roundMoney,
  suggestedRetailPrice,
} from "@/lib/commerce/vendor-pricing-math";

export {
  DEFAULT_PRICING_CONFIG,
  type PricingConfig,
  type VendorOfferInput,
  landedCost,
  lineProfit,
  normalizePricingConfig,
  pickBestOffer,
  roundMoney,
  suggestedRetailPrice,
};

export const PRICING_SETTING_KEY = "commerce.pricing";

export async function getPricingConfig(): Promise<PricingConfig> {
  const raw = await getSettingValue<unknown>(PRICING_SETTING_KEY, DEFAULT_PRICING_CONFIG);
  return normalizePricingConfig(raw);
}

export async function savePricingConfig(input: Partial<PricingConfig>): Promise<PricingConfig> {
  const current = await getPricingConfig();
  const next = normalizePricingConfig({ ...current, ...input });
  await prisma.siteSetting.upsert({
    where: { key: PRICING_SETTING_KEY },
    update: { value: next },
    create: { key: PRICING_SETTING_KEY, value: next },
  });
  return next;
}

export function serializeOffer(offer: {
  id: string;
  productId: string;
  vendorId: string;
  unitCost: Prisma.Decimal | number;
  shippingCost: Prisma.Decimal | number;
  vendorSku: string | null;
  notes: string | null;
  vendor?: { id: string; name: string } | null;
}) {
  const unitCost = Number(offer.unitCost);
  const shippingCost = Number(offer.shippingCost);
  return {
    id: offer.id,
    productId: offer.productId,
    vendorId: offer.vendorId,
    vendorName: offer.vendor?.name ?? "",
    vendorSku: offer.vendorSku,
    notes: offer.notes,
    unitCost,
    shippingCost,
    landedCost: landedCost(unitCost, shippingCost),
  };
}

export async function syncProductFromBestOffer(productId: string) {
  const [offers, pricing, shipping] = await Promise.all([
    prisma.productVendorOffer.findMany({
      where: { productId },
      include: { vendor: { select: { id: true, name: true } } },
    }),
    getPricingConfig(),
    getShippingConfig(),
  ]);

  const serialized = offers.map(serializeOffer);
  const best = pickBestOffer(serialized);
  const outbound = shipping.alwaysFree ? 0 : shipping.flatRate;
  const suggested = best ? suggestedRetailPrice({ landedCost: best.landedCost, pricing, outboundShipping: outbound }) : null;

  const product = best
    ? await prisma.product.update({
        where: { id: productId },
        data: {
          wholesalePrice: new Prisma.Decimal(best.landedCost.toFixed(2)),
          vendorId: best.vendorId,
        },
        include: { vendor: { select: { id: true, name: true } } },
      })
    : await prisma.product.findUniqueOrThrow({
        where: { id: productId },
        include: { vendor: { select: { id: true, name: true } } },
      });

  return {
    product,
    offers: serialized,
    best,
    suggestedRetail: suggested,
    pricing,
    shipping,
  };
}

export function serializeProductWithVendorPricing<
  T extends {
    id: string;
    price: unknown;
    wholesalePrice?: unknown | null;
    vendorId?: string | null;
    sku?: string | null;
    vendor?: { id: string; name: string } | null;
    vendorOffers?: Array<{
      id: string;
      productId: string;
      vendorId: string;
      unitCost: Prisma.Decimal | number;
      shippingCost: Prisma.Decimal | number;
      vendorSku: string | null;
      notes: string | null;
      vendor?: { id: string; name: string } | null;
    }>;
  },
>(product: T, shipping: { alwaysFree: boolean; flatRate: number }, pricing: PricingConfig) {
  const offers = (product.vendorOffers ?? []).map(serializeOffer);
  if (!offers.length && product.vendorId && product.wholesalePrice != null) {
    offers.push({
      id: `legacy-${product.id}`,
      productId: product.id,
      vendorId: product.vendorId,
      vendorName: product.vendor?.name ?? "",
      vendorSku: product.sku ?? null,
      notes: null,
      unitCost: Number(product.wholesalePrice),
      shippingCost: 0,
      landedCost: Number(product.wholesalePrice),
    });
  }
  const best = pickBestOffer(offers);
  const outbound = shipping.alwaysFree ? 0 : shipping.flatRate;
  const suggestedPrice = best
    ? suggestedRetailPrice({ landedCost: best.landedCost, pricing, outboundShipping: outbound })
    : null;
  const retail = Number(product.price);
  const landed = best?.landedCost ?? (product.wholesalePrice != null ? Number(product.wholesalePrice) : 0);
  const profitPerUnit = retail > 0 && landed > 0 ? roundMoney(retail - landed) : null;

  return {
    ...product,
    price: retail,
    wholesalePrice: product.wholesalePrice != null ? Number(product.wholesalePrice) : null,
    vendorOffers: offers,
    bestVendor: best,
    suggestedPrice,
    landedCost: best?.landedCost ?? null,
    profitPerUnit,
  };
}

export async function upsertVendorOffer(input: {
  productId: string;
  vendorId: string;
  unitCost: number;
  shippingCost?: number;
}) {
  await prisma.productVendorOffer.upsert({
    where: { productId_vendorId: { productId: input.productId, vendorId: input.vendorId } },
    create: {
      productId: input.productId,
      vendorId: input.vendorId,
      unitCost: input.unitCost,
      shippingCost: input.shippingCost ?? 0,
    },
    update: {
      unitCost: input.unitCost,
      shippingCost: input.shippingCost ?? 0,
    },
  });
  return syncProductFromBestOffer(input.productId);
}
