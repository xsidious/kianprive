import type { Metadata } from "next";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildSeoMetadata({
  title: "Events and Retreats",
  description: "Wellness events and retreats hosted by KIAN Prive.",
  canonicalPath: "/events-retreats",
});


export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
