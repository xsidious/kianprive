import type { Metadata } from "next";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { auth } from "@/lib/auth";
import { listMemberPeptideProducts } from "@/lib/commerce/peptides";
import { listShopCatalogProducts } from "@/lib/commerce/shop-catalog";
import { canViewServicePrices } from "@/lib/member-pricing-access";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildSeoMetadata({
  title: "Shop Wellness Essentials",
  description:
    "Curated skincare, hair, body, nutrients, and injection supplies from KIAN Privé. The Peptides category is reserved for approved members.",
  canonicalPath: "/shop",
});

export default async function ShopPage() {
  const session = await auth();
  const peptidesUnlocked = canViewServicePrices(session?.user);
  const [products, peptideProducts] = await Promise.all([
    listShopCatalogProducts(),
    peptidesUnlocked ? listMemberPeptideProducts() : Promise.resolve([]),
  ]);
  return (
    <ShopPageClient
      products={products}
      peptideProducts={peptideProducts}
      peptidesUnlocked={peptidesUnlocked}
    />
  );
}
