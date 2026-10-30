import { NextResponse } from "next/server";
import { syncOpenDistributionStatuses } from "@/lib/rxhere/sync-distribution-status";

function cronAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  const urlSecret = new URL(req.url).searchParams.get("secret");
  return header === `Bearer ${secret}` || urlSecret === secret;
}

async function run(req: Request) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await syncOpenDistributionStatuses(50);
  return NextResponse.json({ ok: true, ...summary });
}

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}
