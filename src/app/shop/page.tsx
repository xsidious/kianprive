import type { Metadata } from "next";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildSeoMetadata({
  title: "Shop Wellness Essentials",
  description:
    "Curated skincare, nutrients, and clinical essentials from KIAN Privé — extend your concierge results at home.",
  canonicalPath: "/shop",
});

export default function ShopPage() {
  return <ShopPageClient />;
}
