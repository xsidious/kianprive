import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { syncRxHereCatalog } from "@/lib/rxhere/sync-catalog";
import { rxhereConfigured } from "@/lib/rxhere/client";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  return NextResponse.json({
    configured: rxhereConfigured(),
    hasKey: Boolean(process.env.RXHERE_API_KEY || process.env.RXHERE_LIVE_API_KEY || process.env.VITARELAY_API_KEY),
  });
}

export async function POST() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const result = await syncRxHereCatalog({ activateNew: true });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  const { ok: _ok, ...rest } = result;
  return NextResponse.json({ ok: true, ...rest });
}
