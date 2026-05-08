import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSessionProvider } from "@/components/providers/session-provider";
import { PageAnalyticsTracker } from "@/components/analytics/page-analytics-tracker";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSettingValue } from "@/lib/settings-store";
import { AppChrome } from "@/components/layout/AppChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "KIAN Privé",
    description: "Premium concierge wellness for discerning clients and practitioners.",
    canonicalPath: "/",
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const liveChat = getSettingValue<{ script?: string }>("liveChat", { script: "" });
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)]">
        <AppSessionProvider>
          <PageAnalyticsTracker />
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
  return <Script id="live-chat-script" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: liveChat.script }} />;
}
