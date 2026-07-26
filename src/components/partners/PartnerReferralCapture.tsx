"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { capturePartnerReferralFromUrl } from "@/lib/partner-referral";

function PartnerReferralInner() {
  const searchParams = useSearchParams();
  useEffect(() => {
    capturePartnerReferralFromUrl(searchParams);
  }, [searchParams]);
  return null;
}

export function PartnerReferralCapture() {
  return (
    <Suspense fallback={null}>
      <PartnerReferralInner />
    </Suspense>
  );
}
