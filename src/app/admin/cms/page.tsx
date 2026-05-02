import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminCmsPage() {
  const pages = await prisma.cmsPage.findMany({
    orderBy: { updatedAt: "desc" },
    include: { sections: true },
    take: 25,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-[#1f1a15]">CMS Pages</h1>
        <Link href="/admin/cms/new" className="rounded-full bg-[#b78d4b] px-4 py-2 text-sm text-white">
          New Page
        </Link>
      </div>
      <div className="mt-6 grid gap-3">
        {pages.map((page) => (
          <article key={page.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-lg text-[#1f1a15]">{page.title}</p>
                <p className="text-sm text-[#6f6251]">/{page.slug}</p>
              </div>
              <div className="text-sm text-[#8f6f3e]">
                {page.status} · {page.sections.length} sections
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
