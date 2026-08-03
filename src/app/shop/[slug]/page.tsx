import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShopProductPurchase } from "@/components/shop/ShopProductPurchase";
import { catalogProducts, getCatalogDisplayPrice, getCatalogProduct } from "@/lib/commerce/products";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaSecondary,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return catalogProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getCatalogProduct(slug);
  if (!product) return buildSeoMetadata({ title: "Product", canonicalPath: "/shop" });
  const fromPrice = getCatalogDisplayPrice(product);
  return buildSeoMetadata({
    title: product.name,
    description:
      product.summary ??
      (product.options?.length
        ? `${product.name} — available in ${product.options.map((o) => o.label).join(", ")}. From $${fromPrice}.`
        : `${product.name} — ${product.category} essentials from KIAN Privé.`),
    canonicalPath: `/shop/${product.slug}`,
    image: product.image,
  });
}

export default async function ShopProductPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "exosomes") redirect("/shop/korean-skincare");
  const product = getCatalogProduct(slug);
  if (!product || product.slug !== slug) notFound();

  const fromPrice = getCatalogDisplayPrice(product);
  const paragraphs = (product.description ?? product.summary ?? "")
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <EditorialSection className="pt-24">
      <div className={`grid gap-8 lg:grid-cols-2 ${editorialPanel} overflow-hidden p-0`}>
        <div className="relative min-h-[320px] bg-[#1a1714]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={80}
            className="object-cover"
            priority={false}
          />
        </div>
        <div className="p-6 sm:p-8">
          <EditorialEyebrow>{product.category.toUpperCase()}</EditorialEyebrow>
          <h1 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">{product.name}</h1>

          {product.summary ? (
            <p className="mt-4 text-lg text-[#4f4335]">{product.summary}</p>
          ) : null}

          {paragraphs.length ? (
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#5f5344]">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-[#5f5344]">
              Product details and options for {product.name.toLowerCase()}.
            </p>
          )}

          {product.options?.length ? (
            <p className="mt-4 text-sm text-[#8f6f3e]">
              Available in {product.options.map((o) => o.label).join(", ")}. From ${fromPrice}.
            </p>
          ) : null}

          {product.redirectUrl ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={product.redirectUrl}
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
            <ShopProductPurchase product={product} />
          )}
        </div>
      </div>
    </EditorialSection>
  );
}
