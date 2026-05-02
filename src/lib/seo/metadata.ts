type SeoInput = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  noIndex?: boolean;
};

const defaultTitle = "KIAN Privé";
const defaultDescription = "Premium concierge wellness for discerning clients and practitioners.";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function buildSeoMetadata(input: SeoInput) {
  const title = input.title ?? defaultTitle;
  const description = input.description ?? defaultDescription;
  const canonical = input.canonicalPath ? `${appUrl}${input.canonicalPath}` : appUrl;
  const image = input.image ? `${appUrl}${input.image}` : `${appUrl}/images/beauty.avif`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: !input.noIndex,
      follow: !input.noIndex,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: image }],
    },
  };
}
