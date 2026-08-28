"use client";

import { useSession } from "next-auth/react";
import { canViewServicePrices } from "@/lib/member-pricing-access";

export function useCanViewServicePrices() {
  const { data, status } = useSession();
  const canViewPrices = canViewServicePrices(data?.user);
  return { canViewPrices, status, user: data?.user };
}
