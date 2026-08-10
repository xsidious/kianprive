import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { listClinicalShopProducts } from "@/lib/commerce/clinical-shop";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildSeoMetadata({
  title: "Shop Wellness Essentials",
  description:
    "Curated skincare, nutrients, and clinical essentials from KIAN Privé — extend your concierge results at home.",
  canonicalPath: "/shop",
});

export default async function ShopPage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);
  const clinicalProducts = isLoggedIn ? await listClinicalShopProducts() : [];

  return <ShopPageClient isLoggedIn={isLoggedIn} clinicalProducts={clinicalProducts} />;
}
