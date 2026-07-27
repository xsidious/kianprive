import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Geist } from "next/font/google";
import "./globals.css";
import { AppSessionProvider } from "@/components/providers/session-provider";
import { PageAnalyticsTracker } from "@/components/analytics/page-analytics-tracker";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSettingValue } from "@/lib/settings-store";
import { AppChrome } from "@/components/layout/AppChrome";
import { PartnerReferralCapture } from "@/components/partners/PartnerReferralCapture";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const displaySerif = Cormorant_Garamond({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.kianprive.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  ...buildSeoMetadata({
    title: "Concierge Wellness in Miami",
    description:
      "Premium concierge wellness in Miami and North Miami Beach — aesthetics, Icoone, peptides, IV therapy, and physician-led care.",
    canonicalPath: "/",
    image: "/images/og-default.jpg",
  }),
  icons: {
    icon: "/images/kian-prive-logo.png",
    apple: "/images/kian-prive-logo.png",
  },
  applicationName: "KIAN Privé",
  category: "health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const liveChat = getSettingValue<{ script?: string }>("liveChat", { script: "" });
  return (
    <html lang="en" className={`${geistSans.variable} ${displaySerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[var(--bg)]">
        <JsonLd data={[organizationJsonLd(), localBusinessJsonLd(), websiteJsonLd()]} />
        <AppSessionProvider>
          <PageAnalyticsTracker />
          <PartnerReferralCapture />
          <AppChrome>{children}</AppChrome>
        </AppSessionProvider>
        <LiveChatScript liveChatPromise={liveChat} />
      </body>
    </html>
  );
}

async function LiveChatScript({
  liveChatPromise,
}: {
  liveChatPromise: ReturnType<typeof getSettingValue<{ script?: string }>>;
}) {
  const liveChat = await liveChatPromise;
  if (!liveChat?.script?.trim()) return null;
  return (
    <Script id="live-chat-script" strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: liveChat.script }} />
  );
}
