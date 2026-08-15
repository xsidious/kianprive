import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShopProductPurchase } from "@/components/shop/ShopProductPurchase";
import { auth } from "@/lib/auth";
import { getClinicalShopProductBySlug } from "@/lib/commerce/clinical-shop";
import { catalogProducts, getCatalogDisplayPrice, getCatalogProduct } from "@/lib/commerce/products";
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
  if (product) {
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

  // Clinical PDPs are member-only — keep metadata minimal / noindex
  return {
    ...buildSeoMetadata({
      title: "Clinical product",
      description: "Member clinical therapeutics at KIAN Privé.",
      canonicalPath: `/shop/${slug}`,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function ShopProductPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "exosomes") redirect("/shop/korean-skincare");

  const retail = getCatalogProduct(slug);
  if (retail && retail.slug === slug) {
    const fromPrice = getCatalogDisplayPrice(retail);
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
              className="object-contain p-6"
              priority={false}
            />
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

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/shop/${slug}`)}`);
  }

  const clinical = await getClinicalShopProductBySlug(slug);
  if (!clinical) notFound();

  const paragraphs = (clinical.description ?? clinical.summary ?? "")
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const remoteImage = clinical.image.startsWith("http");

  return (
    <EditorialSection className="pt-24">
      <div className={`grid gap-8 lg:grid-cols-2 ${editorialPanel} overflow-hidden p-0`}>
        <div className="relative min-h-[320px] bg-[#f3ebe0]">
          <Image
            src={clinical.image}
            alt={clinical.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={80}
            className="object-cover"
            unoptimized={remoteImage}
            priority={false}
          />
        </div>
        <div className="p-6 sm:p-8">
          <EditorialEyebrow>
            {clinical.category.toUpperCase()}
            {clinical.isPrescription ? " · RX" : ""} · CLINICAL
          </EditorialEyebrow>
          <h1 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">{clinical.name}</h1>

          {clinical.summary ? <p className="mt-4 text-lg text-[#4f4335]">{clinical.summary}</p> : null}

          {paragraphs.length ? (
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#5f5344]">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-[#5f5344]">
              Clinical therapeutic available to signed-in members. Your clinician will recommend dosing and pricing
              through intake.
            </p>
          )}

          <p className="mt-6 text-sm text-[#8f6f3e]">
            Member clinical catalog — pricing is provided only when your clinician recommends a plan.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard/intake" className={editorialCtaPrimary}>
              REQUEST VIA INTAKE
            </Link>
            <Link href="/dashboard/therapeutics" className={editorialCtaSecondary}>
              FULL THERAPEUTICS
            </Link>
            <Link href="/shop#products" className={editorialCtaSecondary}>
              BACK TO SHOP
            </Link>
          </div>
        </div>
      </div>
    </EditorialSection>
  );
}
