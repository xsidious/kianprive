import { getSettingValue } from "@/lib/settings-store";
import { prisma } from "@/lib/prisma";

export const SHIPPING_SETTING_KEY = "commerce.shipping";

export type ShippingConfig = {
  /** Cart subtotal at/above this amount gets free shipping. Use 0 to always free (with flatRate 0) or free from $0+. */
  freeThreshold: number;
  /** Flat shipping fee when under the free threshold. */
  flatRate: number;
  /** When true, shipping is always $0. */
  alwaysFree: boolean;
};

export const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  freeThreshold: 150,
  flatRate: 12,
  alwaysFree: false,
};

/** @deprecated use DEFAULT_SHIPPING_CONFIG.freeThreshold */
export const FREE_SHIPPING_THRESHOLD = DEFAULT_SHIPPING_CONFIG.freeThreshold;
/** @deprecated use DEFAULT_SHIPPING_CONFIG.flatRate */
export const STANDARD_SHIPPING_FLAT = DEFAULT_SHIPPING_CONFIG.flatRate;

export function normalizeShippingConfig(raw: unknown): ShippingConfig {
  const base = { ...DEFAULT_SHIPPING_CONFIG };
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  const freeThreshold = Number(obj.freeThreshold);
  const flatRate = Number(obj.flatRate);
  return {
    freeThreshold: Number.isFinite(freeThreshold) && freeThreshold >= 0 ? freeThreshold : base.freeThreshold,
    flatRate: Number.isFinite(flatRate) && flatRate >= 0 ? flatRate : base.flatRate,
    alwaysFree: Boolean(obj.alwaysFree),
  };
}

export function calculateShipping(subtotal: number, config: ShippingConfig = DEFAULT_SHIPPING_CONFIG) {
  if (subtotal <= 0) return 0;
  if (config.alwaysFree) return 0;
  if (config.flatRate <= 0) return 0;
  return subtotal >= config.freeThreshold ? 0 : config.flatRate;
}

export async function getShippingConfig(): Promise<ShippingConfig> {
  const raw = await getSettingValue<unknown>(SHIPPING_SETTING_KEY, DEFAULT_SHIPPING_CONFIG);
  return normalizeShippingConfig(raw);
}

export async function saveShippingConfig(input: Partial<ShippingConfig>): Promise<ShippingConfig> {
  const current = await getShippingConfig();
  const next = normalizeShippingConfig({
    ...current,
    ...input,
  });
  await prisma.siteSetting.upsert({
    where: { key: SHIPPING_SETTING_KEY },
    update: { value: next },
    create: { key: SHIPPING_SETTING_KEY, value: next },
  });
  return next;
}
