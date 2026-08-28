"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { memberPricingGateCopy } from "@/lib/member-pricing-access";
import { editorialCtaPrimary, editorialCtaSecondary, editorialPanel } from "@/components/ui/editorial-primitives";

type Props = {
  compact?: boolean;
  className?: string;
};

export function MemberPriceNotice({ compact = false, className = "" }: Props) {
  const { data } = useSession();
  const copy = memberPricingGateCopy(data?.user);

  if (compact) {
    return (
      <p className={`text-sm text-[#8f6f3e] ${className}`}>
        {copy.description}{" "}
        <Link href={copy.primaryHref} className="underline underline-offset-2">
          {copy.primaryLabel}
        </Link>
      </p>
    );
  }

  return (
    <div className={`${editorialPanel} p-5 sm:p-6 ${className}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Member access</p>
      <h3 className="mt-2 font-serif text-xl text-[#1f1a15]">{copy.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6f6251]">{copy.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={copy.primaryHref} className={editorialCtaPrimary}>
          {copy.primaryLabel.toUpperCase()}
        </Link>
        <Link href={copy.secondaryHref} className={editorialCtaSecondary}>
          {copy.secondaryLabel.toUpperCase()}
        </Link>
      </div>
    </div>
  );
}
