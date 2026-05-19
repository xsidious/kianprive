import type { MetadataRoute } from "next";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { retreatEvents } from "@/lib/events";
import { getServiceSlugs } from "@/lib/services/catalog";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts, products] = await Promise.all([
    prisma.cmsPage.findMany({
      where: { status: ContentStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { status: ContentStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
  ]).catch(async () => {
    return [[], [], []] as const;
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date() },
    { url: `${appUrl}/services`, lastModified: new Date() },
    { url: `${appUrl}/about`, lastModified: new Date() },
    { url: `${appUrl}/contact`, lastModified: new Date() },
    { url: `${appUrl}/shop`, lastModified: new Date() },
    { url: `${appUrl}/book-online`, lastModified: new Date() },
    { url: `${appUrl}/pricing`, lastModified: new Date() },
    { url: `${appUrl}/payment-policies`, lastModified: new Date() },
    { url: `${appUrl}/terms-and-conditions`, lastModified: new Date() },
  ];

  const cmsRoutes = pages.map((page) => ({
    url: page.slug === "home" ? appUrl : `${appUrl}/${page.slug}`,
    lastModified: page.updatedAt,
  }));

  const blogRoutes = posts.map((post) => ({
    url: `${appUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  const productRoutes = products.map((product) => ({
    url: `${appUrl}/shop?product=${product.slug}`,
    lastModified: product.updatedAt,
  }));

  const eventRoutes = retreatEvents.map((event) => ({
    url: `${appUrl}/events-retreats/${event.slug}`,
    lastModified: new Date(),
  }));

  const serviceRoutes = getServiceSlugs().map((slug) => ({
    url: `${appUrl}/services/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...serviceRoutes, ...cmsRoutes, ...blogRoutes, ...productRoutes, ...eventRoutes];
}
