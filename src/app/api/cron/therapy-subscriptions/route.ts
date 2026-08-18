import { NextResponse } from "next/server";
import { chargeDueTherapySubscriptions } from "@/lib/commerce/therapy-subscriptions";

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

  const results = await chargeDueTherapySubscriptions();
  return NextResponse.json({
    ok: true,
    processed: results.length,
    charged: results.filter((row) => row.ok).length,
    failed: results.filter((row) => !row.ok).length,
    results,
  });
}

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}
