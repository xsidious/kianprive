import { NextResponse } from "next/server";
import { authorizeNetPublicConfig } from "@/lib/authorize-net";

export async function GET() {
  return NextResponse.json(authorizeNetPublicConfig());
}
