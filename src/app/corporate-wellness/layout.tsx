import type { Metadata } from "next";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildSeoMetadata({
  title: "Corporate Wellness",
  description: "Corporate wellness programs from KIAN Prive for teams in Miami and South Florida.",
  canonicalPath: "/corporate-wellness",
});


export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
