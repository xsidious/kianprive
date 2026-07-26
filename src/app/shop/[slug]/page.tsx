import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogProducts } from "@/lib/commerce/products";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return catalogProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = catalogProducts.find((p) => p.slug === slug);
  if (!product) return buildSeoMetadata({ title: "Product", canonicalPath: "/shop" });
  return buildSeoMetadata({
    title: product.name,
    description: `${product.name} — ${product.category} essentials from KIAN Privé.`,
    canonicalPath: `/shop/${product.slug}`,
    image: product.image,
  });
}

export default async function ShopProductPage({ params }: Props) {
  const { slug } = await params;
  const product = catalogProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <EditorialSection className="pt-24">
      <div className={`grid gap-8 lg:grid-cols-2 ${editorialPanel} overflow-hidden p-0`}>
        <div className="relative min-h-[320px]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={72}
            className="object-cover"
            priority={false}
          />
        </div>
        <div className="p-6 sm:p-8">
          <EditorialEyebrow>{product.category.toUpperCase()}</EditorialEyebrow>
          <h1 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">{product.name}</h1>
          {product.redirectUrl ? (
            <p className="mt-4 text-[#5f5344]">Available via our partner product page.</p>
          ) : (
            <p className="mt-4 text-2xl text-[#1f1a15]">${product.price}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {product.redirectUrl ? (
              <a href={product.redirectUrl} target="_blank" rel="noreferrer" className={editorialCtaPrimary}>
                GO TO PRODUCT
              </a>
            ) : (
              <Link href="/shop#products" className={editorialCtaPrimary}>
                VIEW IN SHOP
              </Link>
            )}
            <Link href="/shop" className={editorialCtaSecondary}>
              BACK TO SHOP
            </Link>
          </div>
        </div>
      </div>
    </EditorialSection>
  );
}
