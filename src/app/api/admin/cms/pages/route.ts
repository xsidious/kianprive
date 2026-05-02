import { NextResponse } from "next/server";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const pages = await prisma.cmsPage.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  return NextResponse.json({ pages });
}

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const body = await req.json();
  const page = await prisma.cmsPage.create({
    data: {
      slug: body.slug,
      title: body.title,
      pageType: body.pageType ?? "marketing",
      body: body.body ?? {},
      status: (body.status as ContentStatus) ?? ContentStatus.DRAFT,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      canonicalUrl: body.canonicalUrl,
      noIndex: Boolean(body.noIndex),
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "cms.page.create",
    entityType: "CmsPage",
    entityId: page.id,
    metadata: { slug: page.slug },
  });

  return NextResponse.json({ page }, { status: 201 });
}
