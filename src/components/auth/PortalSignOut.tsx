"use client";

import { signOut } from "next-auth/react";

type Props = {
  className?: string;
};

export function PortalSignOut({ className }: Props) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/login" })}
      className={
        className ??
        "block w-full rounded-full border border-[#e5d7c2] bg-white px-3 py-2.5 text-center text-[10px] uppercase tracking-[0.14em] text-[#5f5344] hover:bg-[#fff6e8] hover:text-[#8f6f3e]"
      }
    >
      Log out
    </button>
  );
}
