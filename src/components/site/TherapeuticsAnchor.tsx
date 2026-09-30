"use client";

import { useEffect, useState } from "react";
import { readPartnerReferralClient } from "@/lib/partner-referral";

/** Keep an ambassador or practitioner code on links into Privé Therapeutics. */
export function withPartnerReferral(href: string) {
  const code = readPartnerReferralClient();
  if (!code || !href.includes("privetherapeutics.solutions")) return href;
  try {
    const url = new URL(href);
    if (!url.searchParams.has("ref") && !url.searchParams.has("partner")) {
      url.searchParams.set("ref", code);
    }
    return url.toString();
  } catch {
    return href;
  }
}

export function TherapeuticsAnchor({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [url, setUrl] = useState(href);
  useEffect(() => {
    setUrl(withPartnerReferral(href));
  }, [href]);

  return (
    <a href={url} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}
