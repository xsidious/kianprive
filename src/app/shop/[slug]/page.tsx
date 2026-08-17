import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShopProductPurchase } from "@/components/shop/ShopProductPurchase";
import {
  catalogProducts,
  getCatalogDisplayPrice,
  isCatalogProductComingSoon,
} from "@/lib/commerce/products";
import { getShopCatalogProduct } from "@/lib/commerce/shop-catalog";
import { getClinicalShopProductBySlug, getRetailPathForClinicalSupply } from "@/lib/commerce/clinical-shop";
import { PRIVETHERAPEUTICS_URL } from "@/lib/privetherapeutics";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaSecondary,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return catalogProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getShopCatalogProduct(slug);
  if (!product) {
    return buildSeoMetadata({
      title: "Product",
      description: "KIAN Privé shop.",
      canonicalPath: `/shop/${slug}`,
      noIndex: true,
    });
  }

  const fromPrice = getCatalogDisplayPrice(product);
  const comingSoon = isCatalogProductComingSoon(product);
  return buildSeoMetadata({
    title: product.name,
    description:
      product.summary ??
      (comingSoon
        ? `${product.name} — coming soon from KIAN Privé.`
        : product.options?.length
          ? `${product.name} — available in ${product.options.map((o) => o.label).join(", ")}. From $${fromPrice}.`
          : `${product.name} — ${product.category} essentials from KIAN Privé.`),
    canonicalPath: `/shop/${product.slug}`,
    image: product.image,
  });
}

export default async function ShopProductPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "exosomes") redirect("/shop/korean-skincare");

  const retail = await getShopCatalogProduct(slug);
  if (!retail || retail.slug !== slug) {
    const clinical = await getClinicalShopProductBySlug(slug);
    if (clinical) {
      const supplyPath = getRetailPathForClinicalSupply(clinical.slug, clinical.name, clinical.category);
      redirect(supplyPath ?? PRIVETHERAPEUTICS_URL);
    }
    notFound();
  }

  const fromPrice = getCatalogDisplayPrice(retail);
  const comingSoon = isCatalogProductComingSoon(retail);
  const paragraphs = (retail.description ?? retail.summary ?? "")
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <EditorialSection className="pt-24">
      <div className={`grid gap-8 lg:grid-cols-2 ${editorialPanel} overflow-hidden p-0`}>
        <div className="relative min-h-[320px] bg-[#f3ebe0]">
          <Image
            src={retail.image}
            alt={retail.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={85}
            className={`object-contain p-6 ${comingSoon ? "opacity-80" : ""}`}
            priority={false}
          />
          {comingSoon ? (
            <span className="absolute left-4 top-4 rounded-sm bg-[#1f1a15]/85 px-3 py-1.5 text-[10px] tracking-[0.16em] text-white">
              COMING SOON
            </span>
          ) : null}
        </div>
        <div className="p-6 sm:p-8">
          <EditorialEyebrow>{retail.category.toUpperCase()}</EditorialEyebrow>
          <h1 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">{retail.name}</h1>

          {retail.summary ? <p className="mt-4 text-lg text-[#4f4335]">{retail.summary}</p> : null}

          {paragraphs.length ? (
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#5f5344]">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-[#5f5344]">Product details and options for {retail.name.toLowerCase()}.</p>
          )}

          {retail.options?.length && fromPrice > 0 ? (
            <p className="mt-4 text-sm text-[#8f6f3e]">
              Available in {retail.options.map((o) => o.label).join(", ")}. From ${fromPrice}.
            </p>
          ) : null}

          {retail.redirectUrl ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={retail.redirectUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-sm bg-[#b78d4b] px-5 py-3 text-sm tracking-[0.12em] text-white"
              >
                GO TO PRODUCT
              </a>
              <Link href="/shop" className={editorialCtaSecondary}>
                ALL PRODUCTS
              </Link>
            </div>
          ) : (
            <ShopProductPurchase product={retail} />
          )}
        </div>
      </div>
    </EditorialSection>
  );
}
