"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const payload = {
      eventName: "page_view",
      pagePath: pathname,
      referrer: document.referrer || null,
      sessionId: window.localStorage.getItem("kp_session_id") ?? crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
    };

    if (!window.localStorage.getItem("kp_session_id")) {
      window.localStorage.setItem("kp_session_id", payload.sessionId);
    }

    fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
