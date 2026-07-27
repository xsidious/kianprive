import { absoluteUrl, getAppUrl } from "@/lib/seo/metadata";

const phone = "+1-305-918-2570";
const email = "contact@kianprive.com";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KIAN Privé",
    url: getAppUrl(),
    logo: absoluteUrl("/images/kian-prive-logo.png"),
    email,
    telephone: phone,
    sameAs: [
      "https://instagram.com/keepingitallnatural",
      "https://www.facebook.com/KIAN4Life/",
    ],
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${getAppUrl()}/#localbusiness`,
    name: "KIAN Privé",
    image: absoluteUrl("/images/og-default.jpg"),
    url: getAppUrl(),
    telephone: phone,
    email,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "North Miami Beach",
      addressRegion: "FL",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 25.9331,
      longitude: -80.1625,
    },
    areaServed: [
      { "@type": "City", name: "Miami" },
      { "@type": "City", name: "North Miami Beach" },
      { "@type": "AdministrativeArea", name: "Miami-Dade County" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    sameAs: organizationJsonLd().sameAs,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KIAN Privé",
    url: getAppUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${getAppUrl()}/services?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function serviceJsonLd(input: {
  name: string;
  description: string;
  slug: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(`/services/${input.slug}`),
    image: absoluteUrl(input.image ?? "/images/og-default.jpg"),
    provider: {
      "@type": "MedicalBusiness",
      name: "KIAN Privé",
      telephone: phone,
    },
    areaServed: "Miami, FL",
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  datePublished?: string | Date | null;
  dateModified?: string | Date | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: absoluteUrl(input.image || "/images/og-default.jpg"),
    url: absoluteUrl(`/blog/${input.slug}`),
    datePublished: input.datePublished ? new Date(input.datePublished).toISOString() : undefined,
    dateModified: input.dateModified
      ? new Date(input.dateModified).toISOString()
      : input.datePublished
        ? new Date(input.datePublished).toISOString()
        : undefined,
    author: { "@type": "Organization", name: "KIAN Privé" },
    publisher: {
      "@type": "Organization",
      name: "KIAN Privé",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/kian-prive-logo.png"),
      },
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
