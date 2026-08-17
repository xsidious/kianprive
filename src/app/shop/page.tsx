import type { Metadata } from "next";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { listShopCatalogProducts } from "@/lib/commerce/shop-catalog";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildSeoMetadata({
  title: "Shop Wellness Essentials",
  description:
    "Curated skincare, hair, body, nutrients, and injection supplies from KIAN Privé. Peptides are prescribed on Privé Therapeutics.",
  canonicalPath: "/shop",
});

export default async function ShopPage() {
  const products = await listShopCatalogProducts();
  return <ShopPageClient products={products} />;
}
