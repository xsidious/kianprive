import type { MetadataRoute } from "next";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.kianprive.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api",
          "/api/",
          "/dashboard",
          "/dashboard/",
          "/partner",
          "/partner/",
          "/provider",
          "/provider/",
          "/ambassador",
          "/ambassador/",
          "/login",
          "/signup",
          "/forgot-password",
          "/auth",
          "/auth/",
          "/cart",
          "/checkout",
          "/checkout/",
          "/onboarding",
          "/onboarding/",
          "/pay",
          "/pay/",
          "/intake",
          "/intake/",
          "/access-required",
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
