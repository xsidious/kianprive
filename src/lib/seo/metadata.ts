import type { Metadata } from "next";

type SeoInput = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
};

const siteName = "KIAN Privé";
const defaultTitle = "Concierge Wellness in Miami";
const defaultDescription =
  "Premium concierge wellness in Miami and North Miami Beach — aesthetics, Icoone, peptides, IV therapy, and physician-led care.";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.kianprive.com";
const defaultImage = "/images/og-default.jpg";

export function getAppUrl() {
  return appUrl.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${getAppUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function displayTitle(rawTitle: string) {
  if (rawTitle.includes(siteName)) return rawTitle;
  return `${rawTitle} | ${siteName}`;
}

export function buildSeoMetadata(input: SeoInput = {}): Metadata {
  const rawTitle = input.title ?? defaultTitle;
  const title = displayTitle(rawTitle);
  const description = input.description ?? defaultDescription;
  const canonicalPath = input.canonicalPath ?? "/";
  const canonical = absoluteUrl(canonicalPath);
  const imagePath = input.image ?? defaultImage;
  const image = absoluteUrl(imagePath);
  const noIndex = Boolean(input.noIndex);

  return {
    title: { absolute: title },
    description,
    metadataBase: new URL(getAppUrl()),
    alternates: { canonical: canonicalPath },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
    openGraph: {
      type: input.type ?? "website",
      siteName,
      locale: "en_US",
      title,
      description,
      url: canonical,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
