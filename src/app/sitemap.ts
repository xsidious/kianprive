import type { MetadataRoute } from "next";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { retreatEvents } from "@/lib/events";
import { getServiceSlugs } from "@/lib/services/catalog";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.kianprive.com").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts, products] = await Promise.all([
    prisma.cmsPage.findMany({
      where: { status: ContentStatus.PUBLISHED, noIndex: false },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { status: ContentStatus.PUBLISHED, noIndex: false },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", catalogKind: "RETAIL" },
      select: { slug: true, updatedAt: true },
    }),
  ]).catch(async () => {
    return [[], [], []] as const;
  });

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${appUrl}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${appUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${appUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${appUrl}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${appUrl}/book-online`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${appUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${appUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${appUrl}/what-we-do`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/corporate-wellness`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/client-testimonials`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${appUrl}/events-retreats`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/icoone`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${appUrl}/icoone-training`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${appUrl}/payment-policies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${appUrl}/terms-and-conditions`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const cmsRoutes = pages.map((page) => ({
    url: page.slug === "home" ? appUrl : `${appUrl}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const blogRoutes = posts.map((post) => ({
    url: `${appUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const productRoutes = products.map((product) => ({
    url: `${appUrl}/shop/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const eventRoutes = retreatEvents.map((event) => ({
    url: `${appUrl}/events-retreats/${event.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const serviceRoutes = getServiceSlugs().map((slug) => ({
    url: `${appUrl}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...serviceRoutes, ...cmsRoutes, ...blogRoutes, ...productRoutes, ...eventRoutes];
}
