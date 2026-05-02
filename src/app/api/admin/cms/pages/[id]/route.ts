import { NextResponse } from "next/server";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const page = await prisma.cmsPage.findUnique({
    where: { id },
    include: { sections: { orderBy: { sortOrder: "asc" } }, revisions: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await req.json();

  const page = await prisma.cmsPage.update({
    where: { id },
    data: {
      slug: body.slug,
      title: body.title,
      pageType: body.pageType,
      body: body.body,
      status: body.status as ContentStatus | undefined,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoImage: body.seoImage,
      canonicalUrl: body.canonicalUrl,
      noIndex: body.noIndex,
      publishedAt: body.status === "PUBLISHED" ? new Date() : undefined,
    },
  });

  await prisma.pageRevision.create({
    data: {
      pageId: page.id,
      editorId: guard.userId,
      note: body.revisionNote ?? "Admin update",
      snapshot: page as unknown as object,
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "cms.page.update",
    entityType: "CmsPage",
    entityId: page.id,
    metadata: { slug: page.slug, status: page.status },
  });

  return NextResponse.json({ page });
}
