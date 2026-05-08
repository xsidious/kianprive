import { NextResponse } from "next/server";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const body = await req.json();

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      status: body.status as ContentStatus | undefined,
      categoryId: body.categoryId,
      editorId: guard.userId,
      featuredImage: body.featuredImage,
      readTime: body.readTime,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoImage: body.seoImage,
      canonicalUrl: body.canonicalUrl,
      noIndex: body.noIndex,
      tags: body.tags,
      publishedAt: body.status === "PUBLISHED" ? new Date() : undefined,
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "blog.post.update",
    entityType: "BlogPost",
    entityId: post.id,
    metadata: { slug: post.slug, status: post.status },
  });

  return NextResponse.json({ post });
}

export async function DELETE(_: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const { id } = await params;

  const post = await prisma.blogPost.delete({ where: { id } });
  await writeAuditLog({
    userId: guard.userId,
    action: "blog.post.delete",
    entityType: "BlogPost",
    entityId: post.id,
    metadata: { slug: post.slug },
  });

  return NextResponse.json({ ok: true });
}
