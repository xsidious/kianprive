import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CmsSeoEditor } from "@/components/admin/CmsSeoEditor";
import { adminBtnGhost, adminEyebrow, adminMuted, adminPanel, adminTitle } from "@/components/admin/ui";

export default async function AdminSeoPage() {
  const [pages, posts, products] = await Promise.all([
    prisma.cmsPage.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        seoTitle: true,
        seoDescription: true,
        seoImage: true,
        canonicalUrl: true,
        noIndex: true,
      },
    }),
    prisma.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        slug: true,
        seoTitle: true,
        seoDescription: true,
        status: true,
      },
    }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        slug: true,
        seoTitle: true,
        seoDescription: true,
        featuredImage: true,
        status: true,
      },
    }),
  ]);

  const missingPageSeo = pages.filter((p) => !p.seoTitle || !p.seoDescription).length;
  const missingProductSeo = products.filter((p) => !p.seoTitle || !p.seoDescription).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={adminEyebrow}>Discoverability</p>
          <h1 className={adminTitle}>SEO</h1>
          <p className={adminMuted}>
            Edit page metadata without a deploy. Keep titles, descriptions, and share images sharp for Google and social.
          </p>
        </div>
        <Link href="/admin/cms" className={adminBtnGhost}>
          Open CMS
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">CMS pages</p>
          <p className="mt-2 font-serif text-3xl">{pages.length}</p>
        </div>
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Pages missing SEO</p>
          <p className="mt-2 font-serif text-3xl">{missingPageSeo}</p>
        </div>
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Products missing SEO</p>
          <p className="mt-2 font-serif text-3xl">{missingProductSeo}</p>
        </div>
      </div>

      <CmsSeoEditor initialPages={pages} />

      <section className={`${adminPanel} p-5`}>
        <h2 className="font-serif text-2xl text-[#1f1a15]">Blog SEO snapshot</h2>
        <p className="mt-1 text-sm text-[#6f6251]">Edit full post SEO from the Blog admin.</p>
        <div className="mt-4 divide-y divide-[#efe4d4]">
          {posts.map((post) => (
            <div key={post.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div>
                <p className="text-[#1f1a15]">{post.title}</p>
                <p className="text-xs text-[#6f6251]">/{post.slug}</p>
              </div>
              <p className="text-xs text-[#8f6f3e]">{post.seoTitle ? "SEO set" : "Needs SEO title"}</p>
            </div>
          ))}
        </div>
        <Link href="/admin/blog" className={`${adminBtnGhost} mt-4`}>
          Manage blog SEO
        </Link>
      </section>

      <section className={`${adminPanel} p-5`}>
        <h2 className="font-serif text-2xl text-[#1f1a15]">Product SEO snapshot</h2>
        <p className="mt-1 text-sm text-[#6f6251]">Edit product SEO titles/descriptions in Products.</p>
        <div className="mt-4 divide-y divide-[#efe4d4]">
          {products.map((product) => (
            <div key={product.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div>
                <p className="text-[#1f1a15]">{product.title}</p>
                <p className="text-xs text-[#6f6251]">/shop/{product.slug}</p>
              </div>
              <p className="text-xs text-[#8f6f3e]">{product.seoTitle ? "SEO set" : "Needs SEO title"}</p>
            </div>
          ))}
        </div>
        <Link href="/admin/products" className={`${adminBtnGhost} mt-4`}>
          Manage product SEO
        </Link>
      </section>
    </div>
  );
}
