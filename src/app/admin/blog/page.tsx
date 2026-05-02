import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    include: { category: true },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-[#1f1a15]">Blog Manager</h1>
        <Link href="/admin/blog/new" className="rounded-full bg-[#b78d4b] px-4 py-2 text-sm text-white">
          New Post
        </Link>
      </div>
      <div className="mt-6 grid gap-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-lg text-[#1f1a15]">{post.title}</p>
                <p className="text-sm text-[#6f6251]">/{post.slug}</p>
              </div>
              <div className="text-sm text-[#8f6f3e]">
                {post.status} · {post.category?.name ?? "Uncategorized"}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
