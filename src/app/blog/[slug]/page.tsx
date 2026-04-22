import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/content";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
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
      <SectionWrapper className="pt-18">
        <Link href="/blog" className="text-sm text-[#8f6f3e] hover:underline">
          ← Back to Blog
        </Link>
        <article className="mt-4 overflow-hidden rounded-3xl border border-[#b78d4b2d] bg-white shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)]">
          <div className="relative h-72">
            <Image src={post.image} alt={post.title} fill className="object-cover" />
          </div>
          <div className="p-8">
            <div className="flex items-center gap-2 text-xs text-[#8f6f3e]">
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
