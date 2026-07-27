"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/partner") || pathname?.startsWith("/ambassador")) {
      return;
    }

    let sessionId = window.localStorage.getItem("kp_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      window.localStorage.setItem("kp_session_id", sessionId);
    }

    const payload = {
      eventName: "page_view",
      pagePath: pathname,
      referrer: document.referrer || null,
      sessionId,
      locale: navigator.language || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      occurredAt: new Date().toISOString(),
    };

    fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
