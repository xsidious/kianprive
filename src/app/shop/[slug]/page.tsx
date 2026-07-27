import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { catalogProducts, getCatalogProduct } from "@/lib/commerce/products";
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
  const product = getCatalogProduct(slug);
  if (!product) return buildSeoMetadata({ title: "Product", canonicalPath: "/shop" });
  return buildSeoMetadata({
    title: product.name,
    description: `${product.name} — ${product.category} essentials from KIAN Privé. View options and product details.`,
    canonicalPath: `/shop/${product.slug}`,
    image: product.image,
  });
}

export default async function ShopProductPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "exosomes") redirect("/shop/korean-skincare");
  const product = getCatalogProduct(slug);
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
          <p className="mt-4 text-[#5f5344]">
            Product details and variable options will live here—sizes, kits, and clinical variants for{" "}
            {product.name.toLowerCase()}.
          </p>
          {product.redirectUrl ? (
            <p className="mt-3 text-sm text-[#6f6251]">This item continues on a partner product page.</p>
          ) : (
            <p className="mt-4 text-2xl text-[#1f1a15]">From ${product.price}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {product.redirectUrl ? (
              <a href={product.redirectUrl} target="_blank" rel="noreferrer" className={editorialCtaPrimary}>
                GO TO PRODUCT
              </a>
            ) : (
              <Link href="/shop#products" className={editorialCtaPrimary}>
                BACK TO CATALOG
              </Link>
            )}
            <Link href="/shop" className={editorialCtaSecondary}>
              ALL PRODUCTS
            </Link>
          </div>
        </div>
      </div>
    </EditorialSection>
  );
}
