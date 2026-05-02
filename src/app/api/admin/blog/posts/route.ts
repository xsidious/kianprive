import { NextResponse } from "next/server";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const posts = await prisma.blogPost.findMany({
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const body = await req.json();

  const post = await prisma.blogPost.create({
    data: {
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content ?? [],
      status: (body.status as ContentStatus) ?? ContentStatus.DRAFT,
      categoryId: body.categoryId,
      authorId: guard.userId,
      editorId: guard.userId,
      featuredImage: body.featuredImage,
      readTime: body.readTime,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoImage: body.seoImage,
      canonicalUrl: body.canonicalUrl,
      noIndex: Boolean(body.noIndex),
      tags: Array.isArray(body.tags) ? body.tags : [],
      publishedAt: body.status === "PUBLISHED" ? new Date() : undefined,
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "blog.post.create",
    entityType: "BlogPost",
    entityId: post.id,
    metadata: { slug: post.slug },
  });

  return NextResponse.json({ post }, { status: 201 });
}
