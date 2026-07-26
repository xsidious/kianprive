"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

export const dynamic = "force-dynamic";

const copyByTarget: Record<string, { title: string; description: string; loginRedirect: string }> = {
  practitioners: {
    title: "To access the Practitioners page, please log in.",
    description:
      "Practitioner training content is available to authenticated members. Sign in to continue to advanced clinical pathways and resources.",
    loginRedirect: "/practitioners",
  },
  athletes: {
    title: "To access the Athletes page, please log in.",
    description:
      "Athlete recovery and performance protocols are members-only. Sign in to continue and unlock personalized athlete resources.",
    loginRedirect: "/athletes",
  },
  partner: {
    title: "Partner portal access required.",
    description:
      "Your partner account is missing, invited, or suspended. Contact KIAN Privé concierge if you need activation.",
    loginRedirect: "/partner",
  },
};

function AccessRequiredContent() {
  const params = useSearchParams();
  const target = params.get("target") ?? "practitioners";

  const content = useMemo(
    () =>
      copyByTarget[target] ?? {
        title: "This page requires login.",
        description: "Please sign in with your member account to continue.",
        loginRedirect: "/dashboard",
      },
    [target],
  );

  return (
    <EditorialSection>
      <div className={`mx-auto max-w-3xl ${editorialPanel} p-8 sm:p-10`}>
        <EditorialEyebrow>MEMBER ACCESS</EditorialEyebrow>
        <h1 className="mt-4 font-serif text-3xl text-[#1f1a15] sm:text-4xl">{content.title}</h1>
        <p className="mt-4 max-w-3xl text-[#6f6251]">{content.description}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(content.loginRedirect)}`}
            className={editorialCtaPrimary}
          >
            LOGIN TO CONTINUE
          </Link>
          <Link href="/pricing" className={editorialCtaSecondary}>
            VIEW MEMBERSHIP
          </Link>
          <Link href="/" className={editorialCtaSecondary}>
            BACK TO HOME
          </Link>
        </div>
      </div>
    </EditorialSection>
  );
}

export default function AccessRequiredPage() {
  return (
    <Suspense
      fallback={
        <EditorialSection>
          <p className="text-[#6f6251]">Loading access settings...</p>
        </EditorialSection>
      }
    >
      <AccessRequiredContent />
    </Suspense>
  );
}
