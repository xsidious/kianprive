import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/content";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return buildSeoMetadata({ title: "Article", canonicalPath: "/blog", noIndex: true });

  const canonicalPath =
    post.canonicalUrl && post.canonicalUrl.startsWith("http")
      ? undefined
      : post.canonicalUrl?.startsWith("/")
        ? post.canonicalUrl
        : `/blog/${post.slug}`;

  return buildSeoMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    canonicalPath: canonicalPath ?? `/blog/${post.slug}`,
    image: post.seoImage || post.image,
    noIndex: Boolean(post.noIndex),
    type: "article",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <div>
      <JsonLd
        data={[
          articleJsonLd({
            title: post.seoTitle || post.title,
            description: post.seoDescription || post.excerpt,
            slug: post.slug,
            image: post.seoImage || post.image,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt ?? post.publishedAt,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <SectionWrapper className="pt-18">
        <Link href="/blog" className="text-sm text-[#7a5c32] hover:underline">
          ← Back to Blog
        </Link>
        <article className="mt-4 overflow-hidden rounded-sm border border-[#b78d4b2d] bg-white shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)]">
          <div className="relative h-72">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="100vw"
              quality={72}
              className="object-cover"
              priority={false}
            />
          </div>
          <div className="p-8">
            <div className="flex items-center gap-2 text-xs text-[#7a5c32]">
              <span>{post.category}</span>
              <span>•</span>
              <span>{post.readTime}</span>
              <span>•</span>
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
            <h1 className="mt-4 text-4xl text-[#1f1a15]">{post.title}</h1>
            <div className="mt-6 space-y-4 text-[#5f5344]">
              {post.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
      </SectionWrapper>
    </div>
  );
}
