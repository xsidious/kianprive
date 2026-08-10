import { NextResponse } from "next/server";
import { getShippingConfig } from "@/lib/commerce/shipping";

/** Public shipping rules for cart / checkout UI. */
export async function GET() {
  const config = await getShippingConfig();
  return NextResponse.json({
    freeThreshold: config.freeThreshold,
    flatRate: config.flatRate,
    alwaysFree: config.alwaysFree,
  });
}
