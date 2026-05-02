import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const body = await req.json();
  const category = await prisma.blogCategory.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
    },
  });
  return NextResponse.json({ category }, { status: 201 });
}
