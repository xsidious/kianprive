import { NextResponse } from "next/server";
import { getRetreatEventsFromStore } from "@/lib/events-store";

export async function GET() {
  const events = await getRetreatEventsFromStore();
  return NextResponse.json({ events });
}
